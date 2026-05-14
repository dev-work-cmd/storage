// Owns the authenticated PDF intake route for Stage 06.
// Composes the upload form while server modules own validation, storage, and persistence.
// Must not implement preview, QR selection, or processing before later stages.
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
          Document intake
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
          Upload a PDF
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Add the original PDF that will later receive a replacement QR code.
          This stage only stores the private original and creates a draft record.
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
              before writing to storage.
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
