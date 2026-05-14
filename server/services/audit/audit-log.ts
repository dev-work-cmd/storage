// Owns generic server-only audit writes and safe metadata shaping.
// Centralizes audit persistence so feature code records events consistently.
// Must never accept secrets, raw document contents, PINs, passwords, or tokens.
import "server-only";

import { AuditOutcome, type AuditEvent, type Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

type SafeAuditMetadataValue = string | number | boolean | null | undefined;

type AuditLogInput = {
  event: AuditEvent;
  outcome?: AuditOutcome;
  actorUserId?: string;
  documentId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, SafeAuditMetadataValue>;
};

export type RequestAuditMetadata = {
  ipAddress?: string;
  userAgent?: string;
};

export function getRequestAuditMetadata(
  headerList: Headers,
): RequestAuditMetadata {
  const forwardedFor = headerList.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    undefined;

  return {
    ipAddress,
    userAgent: headerList.get("user-agent") ?? undefined,
  };
}

export function sanitizeAuditMetadata(
  metadata?: Record<string, SafeAuditMetadataValue>,
): Prisma.InputJsonObject | undefined {
  if (!metadata) {
    return undefined;
  }

  const entries = Object.entries(metadata).filter(
    (entry): entry is [string, Exclude<SafeAuditMetadataValue, undefined>] =>
      entry[1] !== undefined,
  );

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

export async function logAuditEvent(input: AuditLogInput) {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      documentId: input.documentId,
      event: input.event,
      outcome: input.outcome ?? AuditOutcome.INFO,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: sanitizeAuditMetadata(input.metadata),
    },
  });
}
