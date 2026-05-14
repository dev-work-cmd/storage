import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, verifyMock } = vi.hoisted(() => ({
  prismaMock: {
    document: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  verifyMock: vi.fn(),
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@node-rs/argon2", () => ({
  verify: verifyMock,
}));

import { evaluatePublicDocumentAccess } from "@/server/services/access/document-access";

describe("evaluatePublicDocumentAccess", () => {
  beforeEach(() => {
    prismaMock.document.findUnique.mockReset();
    prismaMock.document.update.mockReset();
    verifyMock.mockReset();
    prismaMock.document.update.mockResolvedValue({});
  });

  it("denies missing documents without recording an update", async () => {
    prismaMock.document.findUnique.mockResolvedValue(null);

    await expect(
      evaluatePublicDocumentAccess({
        publicId: "missing",
        mode: "verify",
      }),
    ).resolves.toEqual({
      status: "denied",
      mode: "verify",
      reason: "not_found",
      message: "This verification link is not available.",
    });

    expect(prismaMock.document.update).not.toHaveBeenCalled();
  });

  it("denies expired documents and records the failed access", async () => {
    prismaMock.document.findUnique.mockResolvedValue({
      id: "doc_1",
      publicId: "doc-public",
      title: "Expired PDF",
      originalFilename: "expired.pdf",
      processedFilePath: "processed/doc.pdf",
      status: "PROCESSED",
      qrMode: "VERIFY",
      expiresAt: new Date("2020-01-01T00:00:00.000Z"),
      maxAccessCount: null,
      accessCount: 0,
      requiresPin: false,
      pinHash: null,
      isEnabled: true,
      isRevoked: false,
      deletedAt: null,
      processedAt: new Date("2026-05-14T00:00:00.000Z"),
    });

    const result = await evaluatePublicDocumentAccess({
      publicId: "doc-public",
      mode: "verify",
    });

    expect(result).toMatchObject({
      status: "denied",
      reason: "expired",
      documentTitle: "Expired PDF",
    });
    expect(prismaMock.document.update).toHaveBeenCalledTimes(1);
  });

  it("requires a pin for open/download access when no verified grant is present", async () => {
    prismaMock.document.findUnique.mockResolvedValue({
      id: "doc_2",
      publicId: "pin-doc",
      title: "PIN PDF",
      originalFilename: "pin.pdf",
      processedFilePath: "processed/doc.pdf",
      status: "PROCESSED",
      qrMode: "OPEN",
      expiresAt: null,
      maxAccessCount: null,
      accessCount: 0,
      requiresPin: true,
      pinHash: "hash",
      isEnabled: true,
      isRevoked: false,
      deletedAt: null,
      processedAt: new Date("2026-05-14T00:00:00.000Z"),
    });

    await expect(
      evaluatePublicDocumentAccess({
        publicId: "pin-doc",
        mode: "open",
      }),
    ).resolves.toEqual({
      status: "pin_required",
      mode: "open",
      document: {
        publicId: "pin-doc",
        title: "PIN PDF",
        qrMode: "OPEN",
        processedAt: new Date("2026-05-14T00:00:00.000Z"),
      },
    });
  });

  it("denies invalid pins and records the failure", async () => {
    prismaMock.document.findUnique.mockResolvedValue({
      id: "doc_3",
      publicId: "pin-doc",
      title: "PIN PDF",
      originalFilename: "pin.pdf",
      processedFilePath: "processed/doc.pdf",
      status: "PROCESSED",
      qrMode: "DOWNLOAD",
      expiresAt: null,
      maxAccessCount: null,
      accessCount: 0,
      requiresPin: true,
      pinHash: "hash",
      isEnabled: true,
      isRevoked: false,
      deletedAt: null,
      processedAt: new Date("2026-05-14T00:00:00.000Z"),
    });
    verifyMock.mockResolvedValue(false);

    const result = await evaluatePublicDocumentAccess({
      publicId: "pin-doc",
      mode: "download",
      pin: "bad-pin",
    });

    expect(result).toMatchObject({
      status: "denied",
      reason: "pin_invalid",
    });
    expect(verifyMock).toHaveBeenCalledWith("hash", "bad-pin");
    expect(prismaMock.document.update).toHaveBeenCalledTimes(1);
  });

  it("allows open access, increments counters, and returns the secure file route", async () => {
    prismaMock.document.findUnique.mockResolvedValue({
      id: "doc_4",
      publicId: "allowed-doc",
      title: "Allowed PDF",
      originalFilename: "allowed.pdf",
      processedFilePath: "processed/doc.pdf",
      status: "PROCESSED",
      qrMode: "OPEN",
      expiresAt: null,
      maxAccessCount: 10,
      accessCount: 3,
      requiresPin: false,
      pinHash: null,
      isEnabled: true,
      isRevoked: false,
      deletedAt: null,
      processedAt: new Date("2026-05-14T00:00:00.000Z"),
    });

    const result = await evaluatePublicDocumentAccess({
      publicId: "allowed-doc",
      mode: "open",
      metadata: {
        ipAddress: "127.0.0.1",
        userAgent: "vitest",
      },
    });

    expect(result).toMatchObject({
      status: "allowed",
      mode: "open",
      fileRoute: "/api/documents/allowed-doc/file?mode=open",
      document: {
        publicId: "allowed-doc",
        title: "Allowed PDF",
      },
    });
    expect(prismaMock.document.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "doc_4" },
        data: expect.objectContaining({
          accessCount: { increment: 1 },
          openCount: { increment: 1 },
          scanCount: { increment: 1 },
          accessSuccessCount: { increment: 1 },
        }),
      }),
    );
  });
});
