// Owns owner-visible lifecycle, access policy, and counter summaries.
// Keeps management metadata separate from preview and public verification UI.
// Must not expose storage paths, PIN hashes, or raw internal errors.
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DocumentManagement } from "@/features/documents/server/get-document-management";
import { cn } from "@/lib/utils";

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
    <div className="rounded-[1.35rem] border border-[color:oklch(0.89_0.015_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(246,241,233,0.58))] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[color:oklch(0.5_0.024_38)]">
        {label}
      </p>
      <p className="mt-3 font-heading text-3xl text-[color:oklch(0.245_0.026_41)]">
        {value}
      </p>
    </div>
  );
}

const badgeClasses = {
  Revoked:
    "border-red-200 bg-red-50 text-red-800",
  Enabled:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  Disabled:
    "border-[color:oklch(0.89_0.015_74)] bg-[color:oklch(0.97_0.008_80)] text-[color:oklch(0.42_0.024_39)]",
} as const;

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
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
              Step 4
            </p>
            <h2 className="mt-2 text-2xl text-[color:oklch(0.245_0.026_41)]">
              Management
            </h2>
            <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
              Lifecycle controls and owner-visible access outcomes.
            </p>
          </div>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              document.isRevoked
                ? badgeClasses.Revoked
                : document.isEnabled
                  ? badgeClasses.Enabled
                  : badgeClasses.Disabled,
            )}
          >
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
            <dt className="text-[color:oklch(0.5_0.024_38)]">Status</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {document.status}
            </dd>
          </div>
          <div>
            <dt className="text-[color:oklch(0.5_0.024_38)]">QR mode</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {document.qrMode}
            </dd>
          </div>
          <div>
            <dt className="text-[color:oklch(0.5_0.024_38)]">Processed</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {formatDate(document.processedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-[color:oklch(0.5_0.024_38)]">Last accessed</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {formatDate(document.lastAccessedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-[color:oklch(0.5_0.024_38)]">Expires</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {formatDate(document.expiresAt)}
            </dd>
          </div>
          <div>
            <dt className="text-[color:oklch(0.5_0.024_38)]">Access limit</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {document.maxAccessCount ?? "Unlimited"}
            </dd>
          </div>
          <div>
            <dt className="text-[color:oklch(0.5_0.024_38)]">PIN required</dt>
            <dd className="mt-1 font-medium text-zinc-950">
              {document.requiresPin ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-[color:oklch(0.5_0.024_38)]">Successful access</dt>
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
