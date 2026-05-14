// Owns the owner-facing audit timeline presentation.
// Keeps event history readable without exposing raw private storage or secret values.
// Must treat metadata as optional display-only context.
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OwnerAuditLogItem } from "@/features/audit/server/get-owner-audit-logs";

const eventLabels: Record<OwnerAuditLogItem["event"], string> = {
  LOGIN_SUCCESS: "Login success",
  LOGIN_FAILURE: "Login failure",
  DOCUMENT_UPLOADED: "Document uploaded",
  QR_DETECTION_SUCCESS: "QR detected",
  QR_DETECTION_FAILURE: "QR detection failed",
  QR_MANUAL_SELECTION: "Manual QR selection",
  DOCUMENT_PROCESSED: "Document processed",
  DOCUMENT_OPENED: "Document opened",
  DOCUMENT_DOWNLOADED: "Document downloaded",
  DOCUMENT_REVOKED: "Document revoked",
  DOCUMENT_DELETED: "Document deleted",
  ACCESS_ALLOWED: "Access allowed",
  ACCESS_DENIED: "Access denied",
};

function formatDateTime(date: Date) {
  return date.toLocaleString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function metadataValue(
  metadata: OwnerAuditLogItem["metadata"],
  key: string,
): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = metadata[key as keyof typeof metadata];

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return null;
}

function contextForLog(log: OwnerAuditLogItem) {
  const parts = [
    metadataValue(log.metadata, "reason"),
    metadataValue(log.metadata, "action"),
    metadataValue(log.metadata, "mode"),
    metadataValue(log.metadata, "source"),
  ].filter(Boolean);

  return parts.join(" · ");
}

function outcomeClass(outcome: OwnerAuditLogItem["outcome"]) {
  if (outcome === "SUCCESS") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (outcome === "FAILURE") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

export function AuditLogList({ logs }: { logs: OwnerAuditLogItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-base font-semibold text-zinc-950">
            Recent audit events
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Latest owner, document, and public-access events.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex min-h-48 flex-col justify-center rounded-md border border-dashed border-zinc-300 p-5">
            <p className="text-sm font-medium text-zinc-950">
              No audit events yet.
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Upload, processing, access, and authentication events will appear
              here after they occur.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {logs.map((log) => {
              const context = contextForLog(log);

              return (
                <article
                  className="grid gap-3 py-5 lg:grid-cols-[minmax(0,1fr)_11rem_10rem]"
                  key={log.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-950">
                        {eventLabels[log.event]}
                      </h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${outcomeClass(
                          log.outcome,
                        )}`}
                      >
                        {log.outcome.toLowerCase()}
                      </span>
                    </div>
                    {log.document ? (
                      <Link
                        className="mt-1 block truncate text-sm text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline"
                        href={`/dashboard/documents/${log.document.publicId}`}
                      >
                        {log.document.title}
                      </Link>
                    ) : (
                      <p className="mt-1 text-sm text-zinc-500">
                        Account event
                      </p>
                    )}
                    {context ? (
                      <p className="mt-1 text-xs text-zinc-500">{context}</p>
                    ) : null}
                  </div>
                  <div className="text-sm text-zinc-600">
                    <p>{formatDateTime(log.createdAt)}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {log.actorName ?? "Public visitor"}
                    </p>
                  </div>
                  <div className="min-w-0 text-xs text-zinc-500">
                    <p className="truncate">{log.ipAddress ?? "No IP"}</p>
                    <p className="mt-1 truncate">{log.userAgent ?? "No UA"}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
