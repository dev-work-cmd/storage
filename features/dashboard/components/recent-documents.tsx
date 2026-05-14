// Owns the recent documents dashboard section.
// Provides a useful empty state before the upload workflow exists.
// Must not expose raw storage paths or private document internals.
import Link from "next/link";

import { DocumentStatus } from "@prisma/client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
            <h2 className="text-base font-semibold tracking-tight">
              Recent documents
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Latest owner-visible PDF records.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex min-h-40 flex-col justify-center border border-dashed border-zinc-300 p-5">
            <p className="text-sm font-medium text-zinc-950">
              No documents yet.
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Upload a PDF to create a draft. Recent records and processing
              status will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
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
                  <p className="mt-1 text-xs text-zinc-500">
                    {document.createdAt.toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-sm text-zinc-600">
                  {statusLabels[document.status]}
                </p>
                <p className="text-sm text-zinc-600">
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
