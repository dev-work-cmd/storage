// Owns auth-related audit writes for login and setup flows.
// Keeps auth actions small while preserving server-only access to request metadata.
// Must never log passwords, raw cookies, PINs, or passkey material.
import "server-only";

import { AuditEvent, AuditOutcome } from "@prisma/client";

import { logAuditEvent } from "@/server/services/audit/audit-log";

type AuthAuditInput = {
  event: Extract<AuditEvent, "LOGIN_SUCCESS" | "LOGIN_FAILURE">;
  outcome: AuditOutcome;
  actorUserId?: string;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
};

export async function logAuthEvent(input: AuthAuditInput) {
  await logAuditEvent({
    actorUserId: input.actorUserId,
    event: input.event,
    outcome: input.outcome,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    metadata: {
      username: input.username,
      reason: input.reason,
    },
  });
}
