// Owns validation of QR bounds against PDF page dimensions.
// Ensures detected or manually-adjusted coordinates stay within document space.
// Must reject bounds that would place QR outside valid PDF area.
import "server-only";

import type { PdfBounds } from "@/lib/pdf-coordinate-conversion";

export type PdfPageDimensions = {
  width: number;
  height: number;
};

export interface QrBoundsValidationError {
  field: string;
  reason: string;
}

/**
 * Validates QR bounds against PDF page dimensions.
 * Returns empty array if valid, otherwise returns error details.
 */
export function validateQrBoundsAgainstPage(
  bounds: PdfBounds,
  pageDimensions: PdfPageDimensions,
): QrBoundsValidationError[] {
  const errors: QrBoundsValidationError[] = [];

  // Check if bounds coordinates are negative
  if (bounds.x < 0) {
    errors.push({
      field: "x",
      reason: "QR position cannot be negative (outside left edge).",
    });
  }

  if (bounds.y < 0) {
    errors.push({
      field: "y",
      reason: "QR position cannot be negative (outside top edge).",
    });
  }

  // Check if bounds extend beyond page dimensions
  const rightEdge = bounds.x + bounds.width;
  if (rightEdge > pageDimensions.width) {
    errors.push({
      field: "width",
      reason: `QR extends beyond right edge (${rightEdge.toFixed(2)} > ${pageDimensions.width.toFixed(2)}).`,
    });
  }

  const bottomEdge = bounds.y + bounds.height;
  if (bottomEdge > pageDimensions.height) {
    errors.push({
      field: "height",
      reason: `QR extends beyond bottom edge (${bottomEdge.toFixed(2)} > ${pageDimensions.height.toFixed(2)}).`,
    });
  }

  // Check for zero or inverted dimensions
  if (bounds.width <= 0) {
    errors.push({
      field: "width",
      reason: "QR width must be positive.",
    });
  }

  if (bounds.height <= 0) {
    errors.push({
      field: "height",
      reason: "QR height must be positive.",
    });
  }

  // Check for unreasonably small QR (less than 10x10 PDF units)
  if (bounds.width < 10 || bounds.height < 10) {
    errors.push({
      field: "size",
      reason: "QR code is too small to be scanned reliably.",
    });
  }

  // Check for unreasonably large QR (more than 80% of page)
  const pageArea = pageDimensions.width * pageDimensions.height;
  const qrArea = bounds.width * bounds.height;
  if (qrArea > pageArea * 0.8) {
    errors.push({
      field: "size",
      reason: "QR code is too large (would cover >80% of page).",
    });
  }

  return errors;
}

/**
 * Quick check if bounds look reasonable without page dimensions.
 * Used for early validation before database save.
 */
export function validateQrBoundsSanity(bounds: PdfBounds): string | null {
  if (!Number.isFinite(bounds.x) || !Number.isFinite(bounds.y)) {
    return "QR position contains invalid numbers.";
  }

  if (!Number.isFinite(bounds.width) || !Number.isFinite(bounds.height)) {
    return "QR dimensions contain invalid numbers.";
  }

  if (bounds.width <= 0 || bounds.height <= 0) {
    return "QR dimensions must be positive.";
  }

  return null;
}
