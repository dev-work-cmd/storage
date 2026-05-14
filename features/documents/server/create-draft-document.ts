// Owns the Stage 06 document intake workflow after form validation succeeds.
// Uploads private originals, creates draft records, and writes safe audit entries.
// Must never return raw storage paths or Supabase URLs to the caller.
import "server-only";

import { AuditEvent, AuditOutcome, DocumentStatus } from "@prisma/client";

import { prisma } from "@/server/db/prisma";
import { validatePdfUploadFile } from "@/server/services/pdf/validate-pdf-upload";
import {
  createOriginalPdfStoragePath,
  removeOriginalPdf,
  uploadOriginalPdf,
} from "@/server/services/storage/supabase-storage";

type CreateDraftDocumentInput = {
  ownerId: string;
  title?: string;
  file: File;
  ipAddress?: string;
  userAgent?: string;
};

export type CreateDraftDocumentResult =
  | {
      status: "success";
      document: {
        publicId: string;
        title: string;
      };
    }
  | {
      status: "error";
      field: "file" | "form";
      message: string;
    };

function titleFromFilename(filename: string) {
  const withoutExtension = filename.replace(/\.pdf$/i, "").trim();
  return withoutExtension || "Untitled PDF";
}

export async function createDraftDocument(
  input: CreateDraftDocumentInput,
): Promise<CreateDraftDocumentResult> {
  const pdfValidation = await validatePdfUploadFile(input.file);

  if (!pdfValidation.ok) {
    return {
      status: "error",
      field: "file",
      message: pdfValidation.message,
    };
  }

  const originalFilePath = createOriginalPdfStoragePath(input.ownerId);

  try {
    const storedPath = await uploadOriginalPdf({
      path: originalFilePath,
      buffer: pdfValidation.buffer,
    });

    const document = await prisma.document.create({
      data: {
        ownerId: input.ownerId,
        title: input.title ?? titleFromFilename(input.file.name),
        originalFilename: input.file.name,
        originalMimeType: "application/pdf",
        originalFilePath: storedPath,
        status: DocumentStatus.DRAFT,
        auditLogs: {
          create: {
            actorUserId: input.ownerId,
            event: AuditEvent.DOCUMENT_UPLOADED,
            outcome: AuditOutcome.SUCCESS,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
            metadata: {
              fileSizeBytes: input.file.size,
            },
          },
        },
      },
      select: {
        publicId: true,
        title: true,
      },
    });

    return {
      status: "success",
      document,
    };
  } catch {
    await removeOriginalPdf(originalFilePath);

    return {
      status: "error",
      field: "form",
      message: "The PDF could not be uploaded. Try again.",
    };
  }
}
