// PDF service module - centralized PDF-related server operations.
// Exports upload validation plus isolated replacement and insertion services.
export { validatePdfUploadFile } from "./validate-pdf-upload";
export type { PdfUploadValidationResult } from "./validate-pdf-upload";

export { replaceQrInPdf, QrReplacementError } from "./replace-qr";
export type { QrReplacementInput, QrReplacementResult } from "./replace-qr";
export { insertQrIntoPdf, QrInsertionError } from "./insert-qr";
export type { QrInsertionInput, QrInsertionResult } from "./insert-qr";
