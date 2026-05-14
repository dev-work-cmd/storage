// Owns the additive PDF QR insertion operation using pdf-lib.
// Draws a new QR image into an owner-selected rectangle without clearing surrounding content.
// Must preserve the original PDF structure and remain isolated from replacement-specific behavior.
import "server-only";

import { PDFDocument } from "pdf-lib";

export interface QrInsertionInput {
  pdfBuffer: Buffer;
  qrPngBuffer: Buffer;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QrInsertionResult {
  pdfBuffer: Buffer;
  pageCount: number;
}

export class QrInsertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QrInsertionError";
  }
}

export async function insertQrIntoPdf(
  input: QrInsertionInput,
): Promise<QrInsertionResult> {
  if (!Buffer.isBuffer(input.pdfBuffer) || input.pdfBuffer.length === 0) {
    throw new QrInsertionError("Invalid PDF buffer: empty or not a buffer.");
  }

  if (!Buffer.isBuffer(input.qrPngBuffer) || input.qrPngBuffer.length === 0) {
    throw new QrInsertionError(
      "Invalid QR PNG buffer: empty or not a buffer.",
    );
  }

  if (!Number.isFinite(input.pageNumber) || input.pageNumber < 1) {
    throw new QrInsertionError(
      `Invalid page number: ${input.pageNumber}. Must be >= 1.`,
    );
  }

  if (
    !Number.isFinite(input.x) ||
    !Number.isFinite(input.y) ||
    !Number.isFinite(input.width) ||
    !Number.isFinite(input.height)
  ) {
    throw new QrInsertionError("QR bounds contain non-finite values.");
  }

  if (input.width <= 0 || input.height <= 0) {
    throw new QrInsertionError(
      `Invalid QR dimensions: ${input.width}x${input.height}. Must be positive.`,
    );
  }

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(input.pdfBuffer, {
      ignoreEncryption: true,
    });
  } catch (error) {
    throw new QrInsertionError(
      `Failed to load PDF: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const pageCount = pdfDoc.getPageCount();

  if (input.pageNumber > pageCount) {
    throw new QrInsertionError(
      `Page ${input.pageNumber} does not exist. PDF has ${pageCount} page(s).`,
    );
  }

  const page = pdfDoc.getPage(input.pageNumber - 1);
  const { width: pageWidth, height: pageHeight } = page.getSize();

  if (
    input.x < 0 ||
    input.y < 0 ||
    input.x + input.width > pageWidth ||
    input.y + input.height > pageHeight
  ) {
    throw new QrInsertionError(
      `QR bounds extend beyond page dimensions. ` +
        `Page: ${pageWidth}x${pageHeight}, ` +
        `QR: x=${input.x} y=${input.y} w=${input.width} h=${input.height}.`,
    );
  }

  let qrImage;
  try {
    qrImage = await pdfDoc.embedPng(input.qrPngBuffer);
  } catch (error) {
    throw new QrInsertionError(
      `Failed to embed QR PNG: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  page.drawImage(qrImage, {
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
  });

  try {
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: true,
    });

    return {
      pdfBuffer: Buffer.from(pdfBytes),
      pageCount,
    };
  } catch (error) {
    throw new QrInsertionError(
      `Failed to save modified PDF: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
