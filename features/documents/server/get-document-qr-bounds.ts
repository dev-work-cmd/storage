// Fetches current QR bounds for a document if detection was previously run.
// Returns bounds in PDF space for use as starting values in manual selector.
// Must verify document ownership before returning private coordinates.
import "server-only";

import { getCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

export interface DocumentQrBounds {
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GetQrBoundsResult {
  status: "success" | "not_found" | "unauthorized";
  bounds?: DocumentQrBounds;
}

export async function getDocumentQrBounds(
  publicId: string,
): Promise<GetQrBoundsResult> {
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
      qrPageNumber: true,
      qrX: true,
      qrY: true,
      qrWidth: true,
      qrHeight: true,
    },
  });

  if (!document) {
    return { status: "not_found" };
  }

  // If no QR bounds have been detected yet
  if (
    document.qrPageNumber === null ||
    document.qrX === null ||
    document.qrY === null ||
    document.qrWidth === null ||
    document.qrHeight === null
  ) {
    return { status: "not_found" };
  }

  return {
    status: "success",
    bounds: {
      pageNumber: document.qrPageNumber,
      x: Number(document.qrX),
      y: Number(document.qrY),
      width: Number(document.qrWidth),
      height: Number(document.qrHeight),
    },
  };
}
