import { validatePdfUploadFile } from "@/server/services/pdf/validate-pdf-upload";

function createPdfFile(name = "sample.pdf") {
  return new File([Buffer.from("%PDF-1.7\nbody")], name, {
    type: "application/pdf",
  });
}

describe("validatePdfUploadFile", () => {
  it("accepts a valid pdf file with correct magic bytes", async () => {
    const result = await validatePdfUploadFile(createPdfFile());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.buffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    }
  });

  it("rejects non-pdf mime types", async () => {
    const file = new File([Buffer.from("%PDF-1.7\nbody")], "sample.pdf", {
      type: "text/plain",
    });

    await expect(validatePdfUploadFile(file)).resolves.toEqual({
      ok: false,
      message: "Only PDF files are accepted.",
    });
  });

  it("rejects invalid file signatures even if the extension is pdf", async () => {
    const file = new File([Buffer.from("hello world")], "sample.pdf", {
      type: "application/pdf",
    });

    await expect(validatePdfUploadFile(file)).resolves.toEqual({
      ok: false,
      message: "The uploaded file is not a valid PDF.",
    });
  });
});
