import {
  buildPdfResponseHeaders,
  sanitizePdfFilename,
} from "@/server/services/storage/file-response";

describe("file-response", () => {
  it("sanitizes unsafe filenames and preserves the pdf extension", () => {
    expect(sanitizePdfFilename(' report\r\n"name?.pdf ')).toBe(
      "report  -name-.pdf",
    );
    expect(sanitizePdfFilename("../../../unsafe")).toBe("..-..-..-unsafe.pdf");
  });

  it("builds private no-store headers for inline pdf responses", () => {
    expect(
      buildPdfResponseHeaders({
        disposition: "inline",
        filename: "invoice.pdf",
      }),
    ).toEqual({
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'inline; filename="invoice.pdf"',
      "Content-Type": "application/pdf",
      "X-Content-Type-Options": "nosniff",
    });
  });
});
