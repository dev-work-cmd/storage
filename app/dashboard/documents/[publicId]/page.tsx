// Owns the authenticated document detail route for Stages 07-10.
// Loads safe document metadata and QR settings, plus delegates PDF rendering and policy forms.
// Must not implement final PDF mutation yet; that is Stage 12.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DocumentManagementSummary } from "@/features/documents/components/document-management-summary";
import { PdfPreviewViewer } from "@/features/documents/components/pdf-preview-viewer";
import { ProcessDocumentButton } from "@/features/documents/components/process-document-button";
import { QrSettingsCard } from "@/features/documents/components/qr-settings-card";
import { getDocumentManagement } from "@/features/documents/server/get-document-management";
import { getDocumentPreview } from "@/features/documents/server/get-document-preview";
import { getDocumentQrBounds } from "@/features/documents/server/get-document-qr-bounds";
import { getDocumentQrSettings } from "@/features/documents/server/get-document-qr-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preview PDF",
};

const routeParamsSchema = z.object({
  publicId: z.string().min(1).max(128),
});

export default async function DocumentPreviewPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const parsedParams = routeParamsSchema.safeParse(await params);

  if (!parsedParams.success) {
    notFound();
  }

  const [document, management] = await Promise.all([
    getDocumentPreview(parsedParams.data.publicId),
    getDocumentManagement(parsedParams.data.publicId),
  ]);

  if (!document || !management) {
    notFound();
  }

  // Load existing QR settings for prefill
  const [qrSettings, qrBounds] = await Promise.all([
    getDocumentQrSettings(parsedParams.data.publicId),
    getDocumentQrBounds(parsedParams.data.publicId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          PDF preview
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
          {document.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Preview rendering is for navigation and QR coordinate selection. Final
          output will continue to use PDF mutation, not rasterized preview
          pages.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-zinc-500">Original file</p>
              <p className="mt-1 truncate font-medium text-zinc-950">
                {document.originalFilename}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Status</p>
              <p className="mt-1 font-medium text-zinc-950">
                {document.status}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Created</p>
              <p className="mt-1 font-medium text-zinc-950">
                {document.createdAt.toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PdfPreviewViewer
            fileUrl={document.fileUrl}
            initialQrBounds={
              qrBounds.status === "success" ? qrBounds.bounds : undefined
            }
            publicId={document.publicId}
          />
        </CardContent>
      </Card>

      {/* Stage 10: QR Behavior & Access Settings */}
      <QrSettingsCard
        publicId={document.publicId}
        initialSettings={
          qrSettings.status === "success" ? qrSettings.settings : undefined
        }
      />

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-zinc-950">
            Processing
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Regenerate or process the PDF after QR coordinates and access
            settings are correct.
          </p>
        </CardHeader>
        <CardContent>
          <ProcessDocumentButton publicId={document.publicId} />
        </CardContent>
      </Card>

      <DocumentManagementSummary document={management} />
    </div>
  );
}
