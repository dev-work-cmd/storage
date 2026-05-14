// Coordinate system conversion for QR selector.
// Handles the mismatch between browser viewport origin (top-left) and PDF origin (bottom-left).
// Must keep viewport and PDF spaces aligned for accurate QR placement.

import type {
  PdfBounds,
  ViewportBounds,
} from "@/lib/pdf-coordinate-conversion";

export interface PdfPageInfo {
  width: number;
  height: number;
}

/**
 * Converts PDF-space bounds to browser viewport-space bounds.
 * PDF space: origin at bottom-left
 * Viewport space: origin at top-left
 * This is used to display stored PDF bounds as initial drag box position.
 */
export function convertPdfBoundsToViewportBounds(
  pdfBounds: PdfBounds,
  pageInfo: PdfPageInfo,
): ViewportBounds {
  // In viewport space, y increases downward.
  // In PDF space, y increases upward.
  // PDF (0,0) is bottom-left; viewport (0,0) is top-left.
  // A QR at pdf_y=100 with height=20:
  //   - Bottom edge at y=100, top edge at y=120
  // Viewport (0,0) is top-left, so:
  //   - Top edge = page_height - 120 = page_height - (pdf_y + pdf_height)
  const viewportY = pageInfo.height - (pdfBounds.y + pdfBounds.height);

  return {
    x: pdfBounds.x,
    y: viewportY,
    width: pdfBounds.width,
    height: pdfBounds.height,
  };
}

/**
 * Converts browser viewport-space bounds to PDF-space bounds.
 * Handles the top-left vs bottom-left origin mismatch.
 * This is used to save manually-adjusted box position back to PDF space.
 */
export function convertViewportBoundsToPdfBoundsWithOrigin(
  viewportBounds: ViewportBounds,
  pageInfo: PdfPageInfo,
): PdfBounds {
  // Inverse conversion:
  // viewport_y = pageHeight - (pdf_y + pdf_height)
  // pdf_y = pageHeight - viewport_y - pdf_height
  const pdfY = pageInfo.height - viewportBounds.y - viewportBounds.height;

  return {
    pageNumber: 0, // Will be set by caller
    x: viewportBounds.x,
    y: pdfY,
    width: viewportBounds.width,
    height: viewportBounds.height,
  };
}
