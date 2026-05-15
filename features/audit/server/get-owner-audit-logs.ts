// Owns owner-scoped audit log retrieval for dashboard review.
// Returns a minimal DTO so the UI never receives storage paths or sensitive auth data.
// Must authorize through the current session before reading audit records.
import "server-only";

import type { Prisma } from "@prisma/client";

import { requireCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

const ownerAuditLogSelect = {
  id: true,
  event: true,
  outcome: true,
  ipAddress: true,
  userAgent: true,
  metadata: true,
  createdAt: true,
  actor: {
    select: {
      username: true,
      name: true,
    },
  },
  document: {
    select: {
      publicId: true,
      title: true,
    },
  },
} satisfies Prisma.AuditLogSelect;

type OwnerAuditLogRecord = Prisma.AuditLogGetPayload<{
  select: typeof ownerAuditLogSelect;
}>;

export type OwnerAuditLogItem = Awaited<
  ReturnType<typeof getOwnerAuditLogs>
>[number];

export async function getOwnerAuditLogs() {
  const session = await requireCurrentSession();

  const logs = await prisma.auditLog.findMany({
    where: {
      OR: [
        {
          actorUserId: session.user.id,
        },
        {
          document: {
            ownerId: session.user.id,
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
    select: ownerAuditLogSelect,
  });

  return logs.map((log: OwnerAuditLogRecord) => ({
    id: log.id,
    event: log.event,
    outcome: log.outcome,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    metadata: log.metadata,
    createdAt: log.createdAt,
    actorName: log.actor?.name ?? log.actor?.username ?? null,
    document: log.document,
  }));
}
