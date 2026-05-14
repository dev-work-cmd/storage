// QR service module - centralized QR-related server operations.
// Exports validation, coordinate conversion, URL construction, and image generation.
export {
  validateQrBoundsAgainstPage,
  validateQrBoundsSanity,
} from "./validate-qr-bounds";
export type {
  PdfPageDimensions,
  QrBoundsValidationError,
} from "./validate-qr-bounds";

export {
  convertPdfBoundsToViewportBounds,
  convertViewportBoundsToPdfBoundsWithOrigin,
} from "./coordinate-system";
export type { PdfPageInfo } from "./coordinate-system";

export {
  buildQrTargetUrl,
  getVerificationPath,
  parseQrModeFromParam,
} from "./qr-target-url";
export type { QrTargetMode } from "./qr-target-url";

export { generateQrPng, generateQrDataUrl } from "./qr-image-generator";
export type {
  QrGenerationOptions,
  QrGenerationResult,
} from "./qr-image-generator";
