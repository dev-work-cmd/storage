// Owns persistence of QR bounds detected from preview-rendered pages.
// Re-checks document ownership before saving client-derived coordinates.
// Must store PDF-space coordinates, not browser viewport coordinates.
// Validates bounds stay within reasonable ranges before database write.
import "server-only";

import { AuditEvent, AuditOutcome } from "@prisma/client";
import { PDFDocument } from "pdf-lib";

import { requireCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import {
  validateQrBoundsAgainstPage,
  validateQrBoundsSanity,
} from "@/server/services/qr/validate-qr-bounds";
import { downloadOriginalPdf } from "@/server/services/storage/supabase-storage";

import type { QrBoundsInput } from "../schemas/qr-bounds-schema";

export interface UpdateQrBoundsError {
  code: "UNAUTHORIZED" | "NOT_FOUND" | "INVALID_BOUNDS" | "DB_ERROR";
  message: string;
}

export async function updateDetectedQrBounds(
  input: QrBoundsInput,
): Promise<boolean | UpdateQrBoundsError> {
  try {
    // Validate bounds sanity before hitting database
    const sanityError = validateQrBoundsSanity(input);
    if (sanityError) {
      return {
        code: "INVALID_BOUNDS",
        message: sanityError,
      };
    }

    const session = await requireCurrentSession();

    const document = await prisma.document.findFirst({
      where: {
        publicId: input.publicId,
        ownerId: session.user.id,
        deletedAt: null,
        status: "DRAFT",
      },
      select: {
        id: true,
        originalFilePath: true,
      },
    });

    if (!document?.originalFilePath) {
      return {
        code: "NOT_FOUND",
        message:
          "Document not found, not editable, or the original PDF is missing.",
      };
    }

    const originalPdf = await downloadOriginalPdf(document.originalFilePath);
    const pdfDoc = await PDFDocument.load(
      Buffer.from(await originalPdf.arrayBuffer()),
      { ignoreEncryption: true },
    );

    if (input.pageNumber > pdfDoc.getPageCount()) {
      return {
        code: "INVALID_BOUNDS",
        message: `Page ${input.pageNumber} does not exist in this PDF.`,
      };
    }

    const page = pdfDoc.getPage(input.pageNumber - 1);
    const pageDimensions = page.getSize();
    const pageErrors = validateQrBoundsAgainstPage(
      {
        pageNumber: input.pageNumber,
        x: input.x,
        y: input.y,
        width: input.width,
        height: input.height,
      },
      pageDimensions,
    );

    if (pageErrors.length > 0) {
      return {
        code: "INVALID_BOUNDS",
        message: pageErrors.map((error) => error.reason).join(" "),
      };
    }

    await prisma.document.update({
      where: {
        id: document.id,
      },
      data: {
        qrPageNumber: input.pageNumber,
        qrX: input.x,
        qrY: input.y,
        qrWidth: input.width,
        qrHeight: input.height,
        auditLogs: {
          create: {
            actorUserId: session.user.id,
            event:
              input.source === "MANUAL"
                ? AuditEvent.QR_MANUAL_SELECTION
                : AuditEvent.QR_DETECTION_SUCCESS,
            outcome: AuditOutcome.SUCCESS,
            metadata: {
              pageNumber: input.pageNumber,
              source: input.source,
            },
          },
        },
      },
    });

    return true;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        code: "UNAUTHORIZED",
        message: "You must be logged in.",
      };
    }

    return {
      code: "DB_ERROR",
      message: "Failed to save QR bounds.",
    };
  }
}
