// Owns the core PDF QR replacement operation using pdf-lib.
// Overlays a white rectangle and new QR image over the selected QR area only.
// Must never re-render pages as images, rebuild the PDF, or modify non-QR content.
// Preserves original page size, fonts, metadata, and all visual content outside the QR bounds.
import "server-only";

import { PDFDocument, rgb } from "pdf-lib";

export interface QrReplacementInput {
  /** Original PDF file as a Buffer */
  pdfBuffer: Buffer;
  /** QR code PNG image as a Buffer */
  qrPngBuffer: Buffer;
  /** 1-based page number where the QR should be placed */
  pageNumber: number;
  /** X coordinate in PDF space (origin: bottom-left) */
  x: number;
  /** Y coordinate in PDF space (origin: bottom-left) */
  y: number;
  /** Width of the QR area in PDF units */
  width: number;
  /** Height of the QR area in PDF units */
  height: number;
}

export interface QrReplacementResult {
  /** The modified PDF as a Buffer */
  pdfBuffer: Buffer;
  /** Total page count of the output PDF */
  pageCount: number;
}

export class QrReplacementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QrReplacementError";
  }
}

/**
 * Replaces the QR code area in a PDF with a new QR image.
 *
 * Process:
 * 1. Load the original PDF via pdf-lib (preserves all original content)
 * 2. Select the target page
 * 3. Draw a white rectangle over the old QR area to erase it
 * 4. Embed the new QR PNG image
 * 5. Draw the new QR image in the same rectangle
 * 6. Save and return the modified PDF
 *
 * The coordinate system uses PDF space (origin at bottom-left).
 * Only the specified rectangle is modified; all other content is preserved.
 */
export async function replaceQrInPdf(
  input: QrReplacementInput,
): Promise<QrReplacementResult> {
  // Validate inputs
  if (!Buffer.isBuffer(input.pdfBuffer) || input.pdfBuffer.length === 0) {
    throw new QrReplacementError("Invalid PDF buffer: empty or not a buffer.");
  }

  if (!Buffer.isBuffer(input.qrPngBuffer) || input.qrPngBuffer.length === 0) {
    throw new QrReplacementError(
      "Invalid QR PNG buffer: empty or not a buffer.",
    );
  }

  if (!Number.isFinite(input.pageNumber) || input.pageNumber < 1) {
    throw new QrReplacementError(
      `Invalid page number: ${input.pageNumber}. Must be >= 1.`,
    );
  }

  if (
    !Number.isFinite(input.x) ||
    !Number.isFinite(input.y) ||
    !Number.isFinite(input.width) ||
    !Number.isFinite(input.height)
  ) {
    throw new QrReplacementError("QR bounds contain non-finite values.");
  }

  if (input.width <= 0 || input.height <= 0) {
    throw new QrReplacementError(
      `Invalid QR dimensions: ${input.width}x${input.height}. Must be positive.`,
    );
  }

  // Load the original PDF — pdf-lib preserves all original content
  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(input.pdfBuffer, {
      ignoreEncryption: true,
    });
  } catch (error) {
    throw new QrReplacementError(
      `Failed to load PDF: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const pageCount = pdfDoc.getPageCount();

  // Validate page number against actual page count
  if (input.pageNumber > pageCount) {
    throw new QrReplacementError(
      `Page ${input.pageNumber} does not exist. PDF has ${pageCount} page(s).`,
    );
  }

  // Select the target page (pdf-lib uses 0-based index)
  const page = pdfDoc.getPage(input.pageNumber - 1);
  const { width: pageWidth, height: pageHeight } = page.getSize();

  // Validate QR bounds are within page dimensions
  if (
    input.x < 0 ||
    input.y < 0 ||
    input.x + input.width > pageWidth ||
    input.y + input.height > pageHeight
  ) {
    throw new QrReplacementError(
      `QR bounds extend beyond page dimensions. ` +
        `Page: ${pageWidth}x${pageHeight}, ` +
        `QR: x=${input.x} y=${input.y} w=${input.width} h=${input.height}.`,
    );
  }

  // Step 1: Draw a white rectangle over the old QR area to erase it
  // pdf-lib drawRectangle uses bottom-left origin, matching our stored coordinates
  page.drawRectangle({
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    color: rgb(1, 1, 1), // Pure white
  });

  // Step 2: Embed the new QR PNG image
  let qrImage;
  try {
    qrImage = await pdfDoc.embedPng(input.qrPngBuffer);
  } catch (error) {
    throw new QrReplacementError(
      `Failed to embed QR PNG: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // Step 3: Draw the new QR image in the same rectangle
  // The image is scaled to fit the rectangle dimensions
  page.drawImage(qrImage, {
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
  });

  // Step 4: Save the modified PDF
  let outputBuffer: Buffer;
  try {
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: true,
    });
    outputBuffer = Buffer.from(pdfBytes);
  } catch (error) {
    throw new QrReplacementError(
      `Failed to save modified PDF: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return {
    pdfBuffer: outputBuffer,
    pageCount,
  };
}
