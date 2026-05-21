import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import {
  expandQrReplacementBounds,
  replaceQrInPdf,
} from "@/server/services/pdf/replace-qr";
import { generateQrPng } from "@/server/services/qr/qr-image-generator";

async function createSamplePdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText("Replacement workflow test document", {
    x: 32,
    y: 340,
    size: 18,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  return Buffer.from(await pdfDoc.save());
}

describe("replaceQrInPdf", () => {
  it("replaces a QR image with a small bleed around the selected bounds", async () => {
    const pdfBuffer = await createSamplePdf();
    const qrPngBuffer = (await generateQrPng("https://example.com")).pngBuffer;

    const result = await replaceQrInPdf({
      pdfBuffer,
      qrPngBuffer,
      pageNumber: 1,
      x: 260,
      y: 48,
      width: 92,
      height: 92,
    });

    const replacedPdf = await PDFDocument.load(result.pdfBuffer);

    expect(result.pageCount).toBe(1);
    expect(replacedPdf.getPageCount()).toBe(1);
    expect(result.pdfBuffer.equals(pdfBuffer)).toBe(false);
    expect(
      expandQrReplacementBounds({
        x: 260,
        y: 48,
        width: 92,
        height: 92,
        pageWidth: 400,
        pageHeight: 400,
      }),
    ).toEqual({
      x: 258.5,
      y: 46.5,
      width: 95,
      height: 95,
    });
  });

  it("clips replacement bleed to the page edges", () => {
    expect(
      expandQrReplacementBounds({
        x: 0,
        y: 0,
        width: 80,
        height: 80,
        pageWidth: 400,
        pageHeight: 400,
      }),
    ).toEqual({
      x: 0,
      y: 0,
      width: 81.5,
      height: 81.5,
    });
  });
});
