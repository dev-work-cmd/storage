// Owns end-to-end document processing for both replacement and insertion workflows.
// Orchestrates: load original → generate QR → mutate PDF → upload processed → update record.
// Must keep replacement behavior unchanged while routing insertion to its own primitive.
import "server-only";

import {
  AuditEvent,
  AuditOutcome,
  DocumentWorkflowType,
} from "@prisma/client";

import { prisma } from "@/server/db/prisma";
import { requireCurrentSession } from "@/server/auth/session";
import { insertQrIntoPdf } from "@/server/services/pdf/insert-qr";
import { replaceQrInPdf } from "@/server/services/pdf/replace-qr";
import { generateQrPng } from "@/server/services/qr/qr-image-generator";
import { buildQrTargetUrl } from "@/server/services/qr/qr-target-url";
import {
  createProcessedPdfStoragePath,
  downloadOriginalPdf,
  removeProcessedPdf,
  uploadProcessedPdf,
} from "@/server/services/storage/supabase-storage";

export interface ProcessDocumentInput {
  publicId: string;
}

export interface ProcessDocumentResult {
  status: "success" | "error";
  message: string;
  processedFileUrl?: string;
  verificationUrl?: string;
  workflowType?: DocumentWorkflowType;
}

/**
 * Processes a document by applying the workflow-specific QR mutation and storing the result.
 *
 * Pipeline:
 * 1. Validate the document is in DRAFT status and has all required data
 * 2. Download the original PDF from Supabase
 * 3. Generate the QR PNG using the configured target URL
 * 4. Replace the QR area in the PDF using stored coordinates
 * 5. Upload the processed PDF to the processed bucket
 * 6. Update the document record with processed status and path
 */
export async function processDocument(
  input: ProcessDocumentInput,
): Promise<ProcessDocumentResult> {
  const session = await requireCurrentSession();

  // 1. Load document with all required processing data
  const document = await prisma.document.findFirst({
    where: {
      publicId: input.publicId,
      ownerId: session.user.id,
      deletedAt: null,
      status: "DRAFT",
    },
    select: {
      id: true,
      publicId: true,
      ownerId: true,
      originalFilePath: true,
      qrTargetUrl: true,
      qrPageNumber: true,
      qrX: true,
      qrY: true,
      qrWidth: true,
      qrHeight: true,
      qrMode: true,
      workflowType: true,
      legalConfirmedAt: true,
    },
  });

  if (!document) {
    return {
      status: "error",
      message: "Document not found, not in draft status, or you do not own it.",
    };
  }

  // Validate required processing prerequisites
  if (!document.originalFilePath) {
    return {
      status: "error",
      message: "Original file is missing. Re-upload the document.",
    };
  }

  if (!document.legalConfirmedAt) {
    return {
      status: "error",
      message: "Legal authority must be confirmed before processing.",
    };
  }

  if (!document.workflowType) {
    return {
      status: "error",
      message: "Choose replace QR or insert QR before processing this document.",
    };
  }

  if (
    document.qrPageNumber === null ||
    document.qrX === null ||
    document.qrY === null ||
    document.qrWidth === null ||
    document.qrHeight === null
  ) {
    return {
      status: "error",
      message:
        "QR area not defined. Detect or manually select the QR position first.",
    };
  }

  // QR target URL should be set by the settings save flow (Stage 10/11)
  const targetUrl =
    document.qrTargetUrl ??
    buildQrTargetUrl(document.publicId, document.qrMode);

  // 2. Download original PDF
  let originalPdf: Blob;
  try {
    originalPdf = await downloadOriginalPdf(document.originalFilePath);
  } catch {
    return {
      status: "error",
      message: "Failed to download the original PDF for processing.",
    };
  }

  const originalBuffer = Buffer.from(await originalPdf.arrayBuffer());

  // 3. Generate QR PNG
  let qrPngBuffer: Buffer;
  try {
    const qrResult = await generateQrPng(targetUrl);
    qrPngBuffer = qrResult.pngBuffer;
  } catch {
    return {
      status: "error",
      message: "Failed to generate the QR code image.",
    };
  }

  // 4. Mutate PDF using the stored workflow type
  let processedPdfBuffer: Buffer;
  try {
    const mutationInput = {
      pdfBuffer: originalBuffer,
      qrPngBuffer,
      pageNumber: document.qrPageNumber,
      x: Number(document.qrX),
      y: Number(document.qrY),
      width: Number(document.qrWidth),
      height: Number(document.qrHeight),
    };

    const mutationResult =
      document.workflowType === DocumentWorkflowType.INSERT_NEW_QR
        ? await insertQrIntoPdf(mutationInput)
        : await replaceQrInPdf(mutationInput);
    processedPdfBuffer = mutationResult.pdfBuffer;
  } catch (error) {
    const workflowLabel =
      document.workflowType === DocumentWorkflowType.INSERT_NEW_QR
        ? "QR insertion"
        : "QR replacement";

    return {
      status: "error",
      message:
        error instanceof Error
          ? `${workflowLabel} failed: ${error.message}`
          : `${workflowLabel} failed unexpectedly.`,
    };
  }

  // 5. Upload processed PDF
  const processedPath = createProcessedPdfStoragePath(document.ownerId);
  try {
    await uploadProcessedPdf({
      path: processedPath,
      buffer: processedPdfBuffer,
    });
  } catch {
    return {
      status: "error",
      message: "Failed to upload the processed PDF.",
    };
  }

  // 6. Update document record
  try {
    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: "PROCESSED",
        processedFilePath: processedPath,
        qrTargetUrl: targetUrl,
        processedAt: new Date(),
        auditLogs: {
          create: {
            actorUserId: session.user.id,
            event: AuditEvent.DOCUMENT_PROCESSED,
            outcome: AuditOutcome.SUCCESS,
            metadata: {
              qrMode: document.qrMode,
              workflowType: document.workflowType,
            },
          },
        },
      },
    });
  } catch {
    // Attempt to clean up the uploaded file on DB failure
    try {
      await removeProcessedPdf(processedPath);
    } catch {
      // Best-effort cleanup
    }
    return {
      status: "error",
      message: "Failed to finalize the document record after processing.",
    };
  }

  return {
    status: "success",
    message:
      document.workflowType === DocumentWorkflowType.INSERT_NEW_QR
        ? "QR code inserted successfully. Your processed document is ready."
        : "QR code replaced successfully. Your processed document is ready.",
    processedFileUrl: `/api/dashboard/documents/${document.publicId}/processed`,
    verificationUrl: targetUrl,
    workflowType: document.workflowType,
  };
}
