"use server";

// Owns protected document lifecycle mutations for owners.
// Performs ownership checks before revoke, restore, disable, delete, or regenerate actions.
// Must keep destructive actions auditable and avoid leaking storage paths.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuditEvent, AuditOutcome } from "@prisma/client";

import { requireCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { processDocument } from "@/server/services/pdf/process-document";
import {
  removeOriginalPdf,
  removeProcessedPdf,
} from "@/server/services/storage/supabase-storage";

export type ManagementActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

async function updateOwnerDocument(
  publicId: string,
  data: Parameters<typeof prisma.document.updateMany>[0]["data"],
  audit: {
    event: AuditEvent;
    metadata?: Record<string, string | boolean>;
  },
) {
  const session = await requireCurrentSession();

  const document = await prisma.document.findFirst({
    where: {
      publicId,
      ownerId: session.user.id,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!document) {
    return false;
  }

  await prisma.document.update({
    where: {
      id: document.id,
    },
    data: {
      ...data,
      auditLogs: {
        create: {
          actorUserId: session.user.id,
          event: audit.event,
          outcome: AuditOutcome.SUCCESS,
          metadata: audit.metadata,
        },
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/dashboard/documents/${publicId}`);
  revalidatePath(`/dashboard/documents/${publicId}/insert-qr`);
  revalidatePath(`/verify/${publicId}`);
  return true;
}

export async function revokeDocument(
  publicId: string,
): Promise<ManagementActionResult> {
  const updated = await updateOwnerDocument(
    publicId,
    {
      isRevoked: true,
      isEnabled: false,
      revokedAt: new Date(),
    },
    {
      event: AuditEvent.DOCUMENT_REVOKED,
      metadata: { action: "revoke" },
    },
  );

  return updated
    ? { status: "success", message: "Document access revoked." }
    : { status: "error", message: "Document could not be revoked." };
}

export async function restoreDocumentAccess(
  publicId: string,
): Promise<ManagementActionResult> {
  const updated = await updateOwnerDocument(
    publicId,
    {
      isRevoked: false,
      isEnabled: true,
      revokedAt: null,
    },
    {
      event: AuditEvent.ACCESS_ALLOWED,
      metadata: { action: "restore_access" },
    },
  );

  return updated
    ? { status: "success", message: "Document access restored." }
    : { status: "error", message: "Document access could not be restored." };
}

export async function disableDocument(
  publicId: string,
): Promise<ManagementActionResult> {
  const updated = await updateOwnerDocument(
    publicId,
    {
      isEnabled: false,
    },
    {
      event: AuditEvent.ACCESS_DENIED,
      metadata: { action: "disable" },
    },
  );

  return updated
    ? { status: "success", message: "Document access disabled." }
    : { status: "error", message: "Document access could not be disabled." };
}

export async function enableDocument(
  publicId: string,
): Promise<ManagementActionResult> {
  const updated = await updateOwnerDocument(
    publicId,
    {
      isEnabled: true,
    },
    {
      event: AuditEvent.ACCESS_ALLOWED,
      metadata: { action: "enable" },
    },
  );

  return updated
    ? { status: "success", message: "Document access enabled." }
    : { status: "error", message: "Document access could not be enabled." };
}

export async function deleteDocument(publicId: string) {
  const session = await requireCurrentSession();

  const document = await prisma.document.findFirst({
    where: {
      publicId,
      ownerId: session.user.id,
      deletedAt: null,
    },
    select: {
      id: true,
      originalFilePath: true,
      processedFilePath: true,
    },
  });

  if (!document) {
    return {
      status: "error",
      message: "Document could not be deleted.",
    };
  }

  try {
    if (document.originalFilePath) {
      await removeOriginalPdf(document.originalFilePath);
    }

    if (document.processedFilePath) {
      await removeProcessedPdf(document.processedFilePath);
    }
  } catch {
    return {
      status: "error",
      message: "Document files could not be removed from storage.",
    };
  }

  await prisma.document.update({
    where: {
      id: document.id,
    },
    data: {
      deletedAt: new Date(),
      isEnabled: false,
      isRevoked: true,
      revokedAt: new Date(),
      originalFilePath: null,
      processedFilePath: null,
      auditLogs: {
        create: {
          actorUserId: session.user.id,
          event: AuditEvent.DOCUMENT_DELETED,
          outcome: AuditOutcome.SUCCESS,
          metadata: { action: "soft_delete", storageCleanup: true },
        },
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/dashboard/documents/${publicId}`);
  revalidatePath(`/dashboard/documents/${publicId}/insert-qr`);
  revalidatePath(`/verify/${publicId}`);

  redirect("/dashboard/documents");
}

export async function regenerateDocument(
  publicId: string,
): Promise<ManagementActionResult> {
  const session = await requireCurrentSession();

  const updated = await prisma.document.updateMany({
    where: {
      publicId,
      ownerId: session.user.id,
      deletedAt: null,
      status: {
        in: ["PROCESSED", "FAILED"],
      },
    },
    data: {
      status: "DRAFT",
      processingError: null,
    },
  });

  if (updated.count !== 1) {
    return {
      status: "error",
      message: "Only processed or failed documents can be regenerated.",
    };
  }

  const result = await processDocument({ publicId });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/dashboard/documents/${publicId}`);
  revalidatePath(`/dashboard/documents/${publicId}/insert-qr`);
  revalidatePath(`/verify/${publicId}`);

  return result.status === "success"
    ? { status: "success", message: "Processed PDF regenerated." }
    : {
        status: "error",
        message: "The processed PDF could not be regenerated.",
      };
}

export async function selectDocumentWorkflow(
  publicId: string,
  workflowType: "REPLACE_EXISTING_QR" | "INSERT_NEW_QR",
): Promise<ManagementActionResult> {
  const session = await requireCurrentSession();

  const currentDocument = await prisma.document.findFirst({
    where: {
      publicId,
      ownerId: session.user.id,
      deletedAt: null,
    },
    select: {
      workflowType: true,
      status: true,
    },
  });

  if (!currentDocument) {
    return {
      status: "error",
      message: "Document not found.",
    };
  }

  if (currentDocument.status === "PROCESSING") {
    return {
      status: "error",
      message: "Wait for the current processing job to finish first.",
    };
  }

  const updated = await prisma.document.updateMany({
    where: {
      publicId,
      ownerId: session.user.id,
      deletedAt: null,
    },
    data: {
      workflowType,
      status: "DRAFT",
      processingError: null,
      ...(currentDocument.workflowType === workflowType
        ? {}
        : {
            qrPageNumber: null,
            qrX: null,
            qrY: null,
            qrWidth: null,
            qrHeight: null,
          }),
    },
  });

  if (updated.count !== 1) {
    return {
      status: "error",
      message: "The document could not be prepared for editing.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/dashboard/documents/${publicId}`);
  revalidatePath(`/dashboard/documents/${publicId}/insert-qr`);

  return {
    status: "success",
    message:
      workflowType === "INSERT_NEW_QR"
        ? "Insertion mode is ready. Save bounds and process when you are ready."
        : "Replacement mode is ready. Detect or adjust the QR bounds and process when you are ready.",
  };
}
