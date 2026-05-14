// Owns the protected audit log dashboard route.
// Composes owner-scoped audit DTOs with a minimal review timeline.
// Must never expose raw document storage paths or secret metadata.
import type { Metadata } from "next";

import { AuditLogList } from "@/features/audit/components/audit-log-list";
import { getOwnerAuditLogs } from "@/features/audit/server/get-owner-audit-logs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Logs",
};

export default async function AuditLogsPage() {
  const logs = await getOwnerAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Audit logs
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
          Review security events
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Inspect authentication, document lifecycle, QR selection, and public
          access decisions captured by the server.
        </p>
      </div>
      <AuditLogList logs={logs} />
    </div>
  );
}
