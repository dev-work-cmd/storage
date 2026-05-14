// Owns low-level PDF upload validation that cannot be trusted to the browser.
// Verifies the declared file and the PDF magic bytes before storage writes.
// Must not parse or mutate PDF content; later stages own preview and processing.
import "server-only";

import { maxPdfSizeBytes } from "@/lib/env";

export type PdfUploadValidationResult =
  | { ok: true; buffer: Buffer }
  | { ok: false; message: string };

export async function validatePdfUploadFile(
  file: File,
): Promise<PdfUploadValidationResult> {
  if (file.size <= 0) {
    return { ok: false, message: "Choose a PDF file before uploading." };
  }

  if (file.size > maxPdfSizeBytes) {
    return { ok: false, message: "The selected PDF is too large." };
  }

  if (file.type !== "application/pdf") {
    return { ok: false, message: "Only PDF files are accepted." };
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, message: "The uploaded file must use a .pdf extension." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const signature = buffer.subarray(0, 5).toString("ascii");

  if (signature !== "%PDF-") {
    return { ok: false, message: "The uploaded file is not a valid PDF." };
  }

  return { ok: true, buffer };
}
