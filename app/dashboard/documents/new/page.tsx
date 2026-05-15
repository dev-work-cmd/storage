// Owns the unified authenticated document intake route.
// Lets the owner upload once and continue into a neutral document workspace.
// Must keep upload validation/storage server-owned while avoiding edit-mode decisions at upload time.
import type { Metadata } from "next";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PdfUploadForm } from "@/features/documents/components/pdf-upload-form";
import { env, maxPdfSizeBytes } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upload PDF",
};

export default function NewDocumentPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          New document
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
          Upload a document
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Add the original PDF once. You can store it as-is, then later open the
          document page anytime to insert a new QR or replace an existing one.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-base font-semibold text-zinc-950">
              Original file
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              The server checks file type, size, extension, and PDF signature
              before writing to storage. After upload, the document opens in a
              neutral workspace where you choose any QR editing action later.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <PdfUploadForm
            maxPdfSizeBytes={maxPdfSizeBytes}
            maxPdfSizeLabel={`${env.MAX_PDF_SIZE_MB} MB`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
