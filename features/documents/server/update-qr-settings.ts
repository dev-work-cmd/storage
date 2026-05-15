// Owns persistence of QR behavior and access settings before document processing.
// Re-checks document ownership before updating any policy fields.
// Must only allow settings persistence while the document is back in editable draft mode.
// Computes and stores the QR target URL from the selected mode.
import "server-only";

import { prisma } from "@/server/db/prisma";
import { requireCurrentSession } from "@/server/auth/session";
import { hash } from "@node-rs/argon2";
import { buildQrTargetUrl } from "@/server/services/qr/qr-target-url";

import type { QrSettingsInput } from "../schemas/qr-settings-schema";

export async function updateDocumentQrSettings(
  input: QrSettingsInput,
): Promise<boolean> {
  const session = await requireCurrentSession();

  // Compute the QR target URL from the selected mode
  const qrTargetUrl = buildQrTargetUrl(input.publicId, input.qrMode);

  // Build the update data
  const updateData: Record<string, unknown> = {
    qrMode: input.qrMode,
    qrTargetUrl,
    expiresAt: input.expiresAt ?? null,
    maxAccessCount: input.maxAccessCount ?? null,
    requiresPin: input.requiresPin,
    isEnabled: input.isEnabled,
    legalConfirmedAt: new Date(),
  };

  // If PIN is required, hash it before storing
  if (input.requiresPin && input.pin) {
    updateData.pinHash = await hash(input.pin);
  } else if (!input.requiresPin) {
    // Clear PIN hash if PIN is no longer required
    updateData.pinHash = null;
  }

  const updated = await prisma.document.updateMany({
    where: {
      publicId: input.publicId,
      ownerId: session.user.id,
      deletedAt: null,
      status: "DRAFT",
    },
    data: updateData,
  });

  return updated.count === 1;
}
