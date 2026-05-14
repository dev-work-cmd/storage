import {
  createFileAccessGrant,
  fileAccessGrantCookieName,
  verifyFileAccessGrant,
} from "@/server/services/access/file-access-grant";

describe("file-access-grant", () => {
  it("builds stable cookie names per document and mode", () => {
    expect(fileAccessGrantCookieName("doc_123", "open")).toBe(
      "pdf_access_doc_123_open",
    );
  });

  it("accepts a freshly created grant for the same document and mode", () => {
    const grant = createFileAccessGrant({
      publicId: "doc_123",
      mode: "download",
    });

    expect(
      verifyFileAccessGrant(grant, {
        publicId: "doc_123",
        mode: "download",
      }),
    ).toBe(true);
  });

  it("rejects grants when the mode or document does not match", () => {
    const grant = createFileAccessGrant({
      publicId: "doc_123",
      mode: "open",
    });

    expect(
      verifyFileAccessGrant(grant, {
        publicId: "doc_123",
        mode: "download",
      }),
    ).toBe(false);

    expect(
      verifyFileAccessGrant(grant, {
        publicId: "doc_999",
        mode: "open",
      }),
    ).toBe(false);
  });
});
