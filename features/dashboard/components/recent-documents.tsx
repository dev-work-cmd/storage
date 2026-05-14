// Owns the recent documents dashboard section.
// Provides a useful empty state before the upload workflow exists.
// Must not expose raw storage paths or private document internals.
import Link from "next/link";

import { DocumentStatus } from "@prisma/client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RecentDocument = {
  publicId: string;
  title: string;
  status: DocumentStatus;
  createdAt: Date;
  scanCount: number;
};

const statusLabels: Record<DocumentStatus, string> = {
  DRAFT: "Draft",
  PROCESSING: "Processing",
  PROCESSED: "Processed",
  FAILED: "Failed",
};

const statusClasses: Record<DocumentStatus, string> = {
  DRAFT:
    "border-[color:oklch(0.89_0.015_74)] bg-[color:oklch(0.97_0.008_80)] text-[color:oklch(0.42_0.024_39)]",
  PROCESSING:
    "border-[color:oklch(0.88_0.04_76)] bg-[color:oklch(0.96_0.025_81)] text-[color:oklch(0.47_0.05_67)]",
  PROCESSED:
    "border-[color:oklch(0.88_0.03_145)] bg-[color:oklch(0.96_0.02_145)] text-[color:oklch(0.46_0.06_145)]",
  FAILED:
    "border-[color:oklch(0.88_0.035_28)] bg-[color:oklch(0.96_0.02_28)] text-[color:oklch(0.48_0.08_28)]",
};

export function RecentDocuments({
  documents,
}: {
  documents: RecentDocument[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.52_0.022_39)]">
              Activity
            </p>
            <h2 className="mt-2 text-2xl text-[color:oklch(0.245_0.026_41)]">
              Recent documents
            </h2>
            <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
              Latest owner-visible PDF records.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex min-h-40 flex-col justify-center rounded-2xl border border-dashed border-[color:oklch(0.87_0.016_72)] bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(245,239,230,0.5))] p-6">
            <p className="text-sm font-medium text-zinc-950">
              No documents yet.
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
              Upload a PDF to create a draft. Recent records and processing
              status will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[color:oklch(0.9_0.012_74)]">
            {documents.map((document) => (
              <div
                className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_8rem_6rem]"
                key={document.publicId}
              >
                <div className="min-w-0">
                  <Link
                    className="block truncate text-sm font-medium text-zinc-950 underline-offset-4 hover:underline"
                    href={`/dashboard/documents/${document.publicId}`}
                  >
                    {document.title}
                  </Link>
                  <p className="mt-1 text-xs text-[color:oklch(0.5_0.024_38)]">
                    {document.createdAt.toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p>
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                      statusClasses[document.status],
                    )}
                  >
                    {statusLabels[document.status]}
                  </span>
                </p>
                <p className="text-sm text-[color:oklch(0.49_0.024_39)]">
                  {document.scanCount} scans
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
