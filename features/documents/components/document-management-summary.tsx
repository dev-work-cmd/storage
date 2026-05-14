// Owns owner-visible lifecycle, access policy, and counter summaries.
// Keeps management metadata separate from preview and public verification UI.
// Must not expose storage paths, PIN hashes, or raw internal errors.
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DocumentManagement } from "@/features/documents/server/get-document-management";

import { DocumentManagementActions } from "./document-management-actions";

function formatDate(date: Date | null) {
  if (!date) {
    return "Not set";
  }

  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

export function DocumentManagementSummary({
  document,
}: {
  document: DocumentManagement;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-950">
              Management
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Lifecycle controls and owner-visible access outcomes.
            </p>
          </div>
          <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700">
            {document.isRevoked
              ? "Revoked"
              : document.isEnabled
                ? "Enabled"
                : "Disabled"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Scans" value={document.scanCount} />
          <Stat label="Opens" value={document.openCount} />
          <Stat label="Downloads" value={document.downloadCount} />
          <Stat
            label="Denied"
            value={document.accessFailureCount}
          />
        </div>

        <dl className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="text-zinc-500">Status</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {document.status}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">QR mode</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {document.qrMode}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Processed</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {formatDate(document.processedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Last accessed</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {formatDate(document.lastAccessedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Expires</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {formatDate(document.expiresAt)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Access limit</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {document.maxAccessCount ?? "Unlimited"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">PIN required</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {document.requiresPin ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Successful access</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {document.accessSuccessCount}
            </dd>
          </div>
        </dl>

        <DocumentManagementActions
          isEnabled={document.isEnabled}
          isRevoked={document.isRevoked}
          publicId={document.publicId}
          status={document.status}
        />
      </CardContent>
    </Card>
  );
}
