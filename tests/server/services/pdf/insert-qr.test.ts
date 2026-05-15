import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { insertQrIntoPdf } from "@/server/services/pdf/insert-qr";
import { generateQrPng } from "@/server/services/qr/qr-image-generator";

async function createSamplePdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText("Insertion workflow test document", {
    x: 32,
    y: 340,
    size: 18,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  return Buffer.from(await pdfDoc.save());
}

describe("insertQrIntoPdf", () => {
  it("inserts a QR image into a PDF without changing page count", async () => {
    const pdfBuffer = await createSamplePdf();
    const qrPngBuffer = (await generateQrPng("https://example.com")).pngBuffer;

    const result = await insertQrIntoPdf({
      pdfBuffer,
      qrPngBuffer,
      pageNumber: 1,
      x: 260,
      y: 48,
      width: 92,
      height: 92,
    });

    const insertedPdf = await PDFDocument.load(result.pdfBuffer);

    expect(result.pageCount).toBe(1);
    expect(insertedPdf.getPageCount()).toBe(1);
    expect(result.pdfBuffer.equals(pdfBuffer)).toBe(false);
  });

  it("rejects insertion bounds that extend beyond the target page", async () => {
    const pdfBuffer = await createSamplePdf();
    const qrPngBuffer = (await generateQrPng("https://example.com")).pngBuffer;

    await expect(
      insertQrIntoPdf({
        pdfBuffer,
        qrPngBuffer,
        pageNumber: 1,
        x: 350,
        y: 350,
        width: 80,
        height: 80,
      }),
    ).rejects.toThrow("QR bounds extend beyond page dimensions.");
  });
});
