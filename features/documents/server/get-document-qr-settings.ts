// Owns loading existing QR behavior and access settings for prefill in the settings form.
// Verifies document ownership before returning policy data.
// Must only return data for DRAFT documents; processed documents should use a different flow.
import "server-only";

import { getCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

export type QrModeType = "VERIFY" | "OPEN" | "DOWNLOAD";

export interface DocumentQrSettings {
  qrMode: QrModeType;
  expiresAt: Date | null;
  maxAccessCount: number | null;
  requiresPin: boolean;
  isEnabled: boolean;
}

export interface GetQrSettingsResult {
  status: "success" | "not_found" | "unauthorized";
  settings?: DocumentQrSettings;
}

export async function getDocumentQrSettings(
  publicId: string,
): Promise<GetQrSettingsResult> {
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
      qrMode: true,
      expiresAt: true,
      maxAccessCount: true,
      requiresPin: true,
      isEnabled: true,
    },
  });

  if (!document) {
    return { status: "not_found" };
  }

  return {
    status: "success",
    settings: {
      qrMode: document.qrMode,
      expiresAt: document.expiresAt,
      maxAccessCount: document.maxAccessCount,
      requiresPin: document.requiresPin,
      isEnabled: document.isEnabled,
    },
  };
}
