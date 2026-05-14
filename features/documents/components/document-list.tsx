// Owns the protected owner document table/list presentation.
// Shows lifecycle status and access counters without exposing storage internals.
// Must stay presentation-only; server modules own filtering and authorization.
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OwnerDocumentListItem } from "@/features/documents/server/get-owner-documents";

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
            <h2 className="text-base font-semibold text-zinc-950">
              All documents
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
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
          <div className="flex min-h-48 flex-col justify-center rounded-md border border-dashed border-zinc-300 p-5">
            <p className="text-sm font-medium text-zinc-950">
              No documents yet.
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Upload a PDF to begin QR replacement and access management.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {documents.map((document) => (
              <div
                className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_8rem_8rem_14rem_6rem]"
                key={document.publicId}
              >
                <div className="min-w-0">
                  <Link
                    className="block truncate text-sm font-semibold text-zinc-950 underline-offset-4 hover:underline"
                    href={`/dashboard/documents/${document.publicId}`}
                  >
                    {document.title}
                  </Link>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {document.originalFilename}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Created {formatDate(document.createdAt)}
                  </p>
                </div>
                <p className="text-sm text-zinc-700">{document.status}</p>
                <p className="text-sm text-zinc-700">
                  {document.isRevoked
                    ? "Revoked"
                    : document.isEnabled
                      ? "Enabled"
                      : "Disabled"}
                </p>
                <div className="grid grid-cols-3 gap-2 text-sm text-zinc-600">
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
