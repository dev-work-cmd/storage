"use server";

// Owns server action boundaries for QR detection results.
// Validates client-derived PDF coordinates and delegates owner-scoped persistence.
// Must never trust preview coordinates without server-side validation.
// Handles rate limiting and coordinate conversion errors gracefully.
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { AuditEvent, AuditOutcome } from "@prisma/client";

import {
  qrDetectionFailureSchema,
  qrBoundsSchema,
  type QrDetectionFailureInput,
  type QrBoundsInput,
} from "@/features/documents/schemas/qr-bounds-schema";
import { updateDetectedQrBounds } from "@/features/documents/server/update-detected-qr-bounds";
import { CoordinateConversionError } from "@/lib/pdf-coordinate-conversion";
import { requireCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import {
  getRequestAuditMetadata,
  logAuditEvent,
} from "@/server/services/audit/audit-log";

export type SaveQrBoundsResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export type LogQrDetectionFailureResult = { status: "ok" | "ignored" };

export async function saveDetectedQrBounds(
  input: QrBoundsInput,
): Promise<SaveQrBoundsResult> {
  try {
    const parsed = qrBoundsSchema.safeParse(input);

    if (!parsed.success) {
      return {
        status: "error",
        message: "The detected QR coordinates were invalid.",
      };
    }

    const saved = await updateDetectedQrBounds(parsed.data);

    // Handle structured error response from server function
    if (typeof saved === "object" && "code" in saved) {
      return {
        status: "error",
        message: saved.message,
      };
    }

    if (!saved) {
      return {
        status: "error",
        message: "The detected QR area could not be saved.",
      };
    }

    revalidatePath(`/dashboard/documents/${parsed.data.publicId}`);
    revalidatePath(`/dashboard/documents/${parsed.data.publicId}/insert-qr`);

    return {
      status: "success",
      message: "Detected QR area saved for review.",
    };
  } catch (error) {
    // Handle coordinate conversion errors
    if (error instanceof CoordinateConversionError) {
      return {
        status: "error",
        message: "The QR coordinates could not be converted safely.",
      };
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        status: "error",
        message: "You must be signed in to save QR coordinates.",
      };
    }

    return {
      status: "error",
      message: "The QR coordinates could not be saved. Try again.",
    };
  }
}

export async function logQrDetectionFailure(
  input: QrDetectionFailureInput,
): Promise<LogQrDetectionFailureResult> {
  const parsed = qrDetectionFailureSchema.safeParse(input);

  if (!parsed.success) {
    return { status: "ignored" };
  }

  const session = await requireCurrentSession();
  const requestMetadata = getRequestAuditMetadata(await headers());

  const document = await prisma.document.findFirst({
    where: {
      publicId: parsed.data.publicId,
      ownerId: session.user.id,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!document) {
    return { status: "ignored" };
  }

  await logAuditEvent({
    actorUserId: session.user.id,
    documentId: document.id,
    event: AuditEvent.QR_DETECTION_FAILURE,
    outcome: AuditOutcome.FAILURE,
    ipAddress: requestMetadata.ipAddress,
    userAgent: requestMetadata.userAgent,
    metadata: {
      pageNumber: parsed.data.pageNumber,
      reason: parsed.data.reason,
    },
  });

  return { status: "ok" };
}
