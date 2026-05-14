// Owns the protected owner document table/list presentation.
// Shows lifecycle status and access counters without exposing storage internals.
// Must stay presentation-only; server modules own filtering and authorization.
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OwnerDocumentListItem } from "@/features/documents/server/get-owner-documents";
import { cn } from "@/lib/utils";

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

const documentStatusClasses: Record<string, string> = {
  DRAFT:
    "border-[color:oklch(0.89_0.015_74)] bg-[color:oklch(0.97_0.008_80)] text-[color:oklch(0.42_0.024_39)]",
  PROCESSING:
    "border-[color:oklch(0.88_0.04_76)] bg-[color:oklch(0.96_0.025_81)] text-[color:oklch(0.47_0.05_67)]",
  PROCESSED:
    "border-[color:oklch(0.88_0.03_145)] bg-[color:oklch(0.96_0.02_145)] text-[color:oklch(0.46_0.06_145)]",
  FAILED:
    "border-[color:oklch(0.88_0.035_28)] bg-[color:oklch(0.96_0.02_28)] text-[color:oklch(0.48_0.08_28)]",
};

const accessStateClasses = {
  Revoked:
    "border-[color:oklch(0.88_0.035_28)] bg-[color:oklch(0.96_0.02_28)] text-[color:oklch(0.48_0.08_28)]",
  Enabled:
    "border-[color:oklch(0.88_0.03_145)] bg-[color:oklch(0.96_0.02_145)] text-[color:oklch(0.46_0.06_145)]",
  Disabled:
    "border-[color:oklch(0.89_0.015_74)] bg-[color:oklch(0.97_0.008_80)] text-[color:oklch(0.42_0.024_39)]",
} as const;

export function DocumentList({
  documents,
}: {
  documents: OwnerDocumentListItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.52_0.022_39)]">
              Library
            </p>
            <h2 className="mt-2 text-2xl text-[color:oklch(0.245_0.026_41)]">
              All documents
            </h2>
            <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
              Owner-controlled records and public access outcomes.
            </p>
          </div>
          <Link
            className={buttonVariants({ variant: "primary", size: "sm" })}
            href="/dashboard/documents/new"
          >
            Upload PDF
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex min-h-48 flex-col justify-center rounded-2xl border border-dashed border-[color:oklch(0.87_0.016_72)] bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(245,239,230,0.5))] p-6">
            <p className="text-sm font-medium text-zinc-950">
              No documents yet.
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
              Upload a PDF to begin QR replacement and access management.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[color:oklch(0.9_0.012_74)]">
            {documents.map((document) => (
              <div className="py-5" key={document.publicId}>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_10rem_10rem_15rem_7rem] lg:items-center">
                  <div className="min-w-0">
                    <Link
                      className="block truncate text-base font-semibold text-zinc-950 underline-offset-4 hover:underline"
                      href={`/dashboard/documents/${document.publicId}`}
                    >
                      {document.title}
                    </Link>
                    <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-[color:oklch(0.5_0.024_38)]">
                      {document.originalFilename}
                    </p>
                    <p className="mt-2 text-sm text-[color:oklch(0.49_0.024_39)]">
                      Created {formatDate(document.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                        documentStatusClasses[document.status] ??
                          accessStateClasses.Disabled,
                      )}
                    >
                      {document.status}
                    </span>
                  </div>
                  <div>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                        document.isRevoked
                          ? accessStateClasses.Revoked
                          : document.isEnabled
                            ? accessStateClasses.Enabled
                            : accessStateClasses.Disabled,
                      )}
                    >
                      {document.isRevoked
                        ? "Revoked"
                        : document.isEnabled
                          ? "Enabled"
                          : "Disabled"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[color:oklch(0.9_0.012_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(246,241,233,0.48))] px-3 py-2 text-sm text-[color:oklch(0.49_0.024_39)]">
                    <span>{document.scanCount} scans</span>
                    <span>{document.openCount} opens</span>
                    <span>{document.downloadCount} downloads</span>
                  </div>
                  <Link
                    className={buttonVariants({
                      variant: "secondary",
                      size: "sm",
                      className: "w-full",
                    })}
                    href={`/dashboard/documents/${document.publicId}`}
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
