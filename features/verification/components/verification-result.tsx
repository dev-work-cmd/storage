// Owns public verification result presentation.
// Keeps the page clear that app verification is access control, not official certification.
// Must avoid exposing private storage paths or sensitive policy internals.
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PublicDocumentAccessResult } from "@/server/services/access/document-access";

import { PinAccessForm } from "./pin-access-form";

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

export function VerificationResult({
  result,
}: {
  result: PublicDocumentAccessResult;
}) {
  if (result.status === "denied") {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight">
            Verification unavailable
          </h1>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-zinc-600">{result.message}</p>
          <p className="mt-4 text-sm leading-6 text-zinc-500">
            This page does not imply legal or official authenticity. Access is
            controlled by the document owner.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (result.status === "pin_required") {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight">
            PIN required
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            The owner requires a PIN before this document can be accessed.
          </p>
        </CardHeader>
        <CardContent>
          <PinAccessForm mode={result.mode} publicId={result.document.publicId} />
        </CardContent>
      </Card>
    );
  }

  const actionMode =
    result.document.qrMode === "DOWNLOAD"
      ? "download"
      : result.document.qrMode === "OPEN"
        ? "open"
        : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
            Verification page
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {result.document.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            This file is managed by its owner through Secure PDF QR. This page
            confirms that the app can evaluate the owner&apos;s access rules; it
            does not create legal or official authenticity.
          </p>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-zinc-500">Original file</dt>
              <dd className="mt-1 truncate font-medium text-zinc-950">
                {result.document.originalFilename}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Processed</dt>
              <dd className="mt-1 font-medium text-zinc-950">
                {formatDate(result.document.processedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Expires</dt>
              <dd className="mt-1 font-medium text-zinc-950">
                {formatDate(result.document.expiresAt)}
              </dd>
            </div>
          </dl>

          {actionMode ? (
            <div className="mt-6">
              <Link
                className={buttonVariants({
                  variant: "primary",
                  className: "w-full sm:w-auto",
                })}
                href={`/verify/${result.document.publicId}?mode=${actionMode}`}
              >
                {actionMode === "download" ? "Download PDF" : "Open PDF"}
              </Link>
            </div>
          ) : (
            <p className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
              The owner configured this QR code for verification only. File
              access is not exposed from this page.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
