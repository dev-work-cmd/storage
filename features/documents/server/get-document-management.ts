// Owns owner-scoped lifecycle and counter data for a single document.
// Supports protected management controls without exposing storage internals.
// Must keep public access policy fields visible only to the owner.
import "server-only";

import { requireCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

export type DocumentManagement = {
  publicId: string;
  title: string;
  originalFilename: string;
  status: string;
  workflowType: "REPLACE_EXISTING_QR" | "INSERT_NEW_QR" | null;
  qrMode: string;
  qrTargetUrl: string | null;
  isEnabled: boolean;
  isRevoked: boolean;
  revokedAt: Date | null;
  expiresAt: Date | null;
  maxAccessCount: number | null;
  requiresPin: boolean;
  createdAt: Date;
  processedAt: Date | null;
  lastAccessedAt: Date | null;
  scanCount: number;
  openCount: number;
  downloadCount: number;
  accessSuccessCount: number;
  accessFailureCount: number;
};

export async function getDocumentManagement(
  publicId: string,
): Promise<DocumentManagement | null> {
  const session = await requireCurrentSession();

  return prisma.document.findFirst({
    where: {
      publicId,
      ownerId: session.user.id,
      deletedAt: null,
    },
    select: {
      publicId: true,
      title: true,
      originalFilename: true,
      status: true,
      workflowType: true,
      qrMode: true,
      qrTargetUrl: true,
      isEnabled: true,
      isRevoked: true,
      revokedAt: true,
      expiresAt: true,
      maxAccessCount: true,
      requiresPin: true,
      createdAt: true,
      processedAt: true,
      lastAccessedAt: true,
      scanCount: true,
      openCount: true,
      downloadCount: true,
      accessSuccessCount: true,
      accessFailureCount: true,
    },
  });
}
