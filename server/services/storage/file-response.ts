// Owns response header policy for PDF streaming routes.
// Keeps filenames safe and ensures processed PDFs are served only as app-controlled responses.
// Must not expose storage paths, signed URLs, or bucket internals.
import "server-only";

export type PdfDisposition = "inline" | "attachment";

export function sanitizePdfFilename(filename: string) {
  const normalized = filename
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/[\r\n]/g, " ")
    .trim();
  const withoutExtension = normalized.replace(/\.pdf$/i, "");
  return `${withoutExtension || "document"}.pdf`;
}

export function buildPdfResponseHeaders(input: {
  disposition: PdfDisposition;
  filename: string;
}) {
  return {
    "Cache-Control": "private, no-store",
    "Content-Disposition": `${input.disposition}; filename="${sanitizePdfFilename(
      input.filename,
    )}"`,
    "Content-Type": "application/pdf",
    "X-Content-Type-Options": "nosniff",
  };
}
