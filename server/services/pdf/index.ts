// PDF service module - centralized PDF-related server operations.
// Exports upload validation and QR replacement services.
export { validatePdfUploadFile } from "./validate-pdf-upload";
export type { PdfUploadValidationResult } from "./validate-pdf-upload";

export { replaceQrInPdf, QrReplacementError } from "./replace-qr";
export type { QrReplacementInput, QrReplacementResult } from "./replace-qr";
