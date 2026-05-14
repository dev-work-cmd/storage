// Owns owner-scoped document list data for management screens.
// Returns safe DTOs with lifecycle and counter fields only.
// Must not expose storage paths, PIN hashes, or internal processing errors publicly.
import "server-only";

import { requireCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

export type OwnerDocumentListItem = {
  publicId: string;
  title: string;
  originalFilename: string;
  status: string;
  qrMode: string;
  isEnabled: boolean;
  isRevoked: boolean;
  createdAt: Date;
  processedAt: Date | null;
  expiresAt: Date | null;
  scanCount: number;
  openCount: number;
  downloadCount: number;
  accessSuccessCount: number;
  accessFailureCount: number;
};

export async function getOwnerDocuments(): Promise<OwnerDocumentListItem[]> {
  const session = await requireCurrentSession();

  return prisma.document.findMany({
    where: {
      ownerId: session.user.id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      publicId: true,
      title: true,
      originalFilename: true,
      status: true,
      qrMode: true,
      isEnabled: true,
      isRevoked: true,
      createdAt: true,
      processedAt: true,
      expiresAt: true,
      scanCount: true,
      openCount: true,
      downloadCount: true,
      accessSuccessCount: true,
      accessFailureCount: true,
    },
  });
}
