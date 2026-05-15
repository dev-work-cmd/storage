// Owns owner-authorized QR PNG generation for a single document.
// Reuses the persisted app-hosted target URL and never exposes storage internals.
// Must stay server-only because QR generation depends on private ownership checks.
import "server-only";

import { getCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { generateQrPng } from "@/server/services/qr/qr-image-generator";
import { buildQrTargetUrl } from "@/server/services/qr/qr-target-url";

export type OwnedDocumentQrResult =
  | { status: "unauthorized" }
  | { status: "not_found" }
  | {
      status: "success";
      pngBuffer: Buffer;
      filename: string;
    };

export async function getOwnedDocumentQr(
  publicId: string,
): Promise<OwnedDocumentQrResult> {
  const session = await getCurrentSession();

  if (!session) {
    return { status: "unauthorized" };
  }

  const document = await prisma.document.findFirst({
    where: {
      publicId,
      ownerId: session.user.id,
      deletedAt: null,
    },
    select: {
      title: true,
      qrMode: true,
      qrTargetUrl: true,
    },
  });

  if (!document) {
    return { status: "not_found" };
  }

  const qrTargetUrl =
    document.qrTargetUrl ?? buildQrTargetUrl(publicId, document.qrMode);
  const qr = await generateQrPng(qrTargetUrl);

  return {
    status: "success",
    pngBuffer: qr.pngBuffer,
    filename: `${document.title || "document"}-qr.png`,
  };
}
