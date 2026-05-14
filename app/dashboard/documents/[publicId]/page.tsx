// Owns the authenticated document detail route for Stages 07-10.
// Loads safe document metadata and QR settings, plus delegates PDF rendering and policy forms.
// Must not implement final PDF mutation yet; that is Stage 12.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { buttonVariants } from "@/components/ui/button";
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

const searchParamsSchema = z.object({
  processed: z.enum(["1"]).optional(),
});

export default async function DocumentPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ processed?: string }>;
}) {
  const parsedParams = routeParamsSchema.safeParse(await params);
  const parsedSearchParams = searchParamsSchema.safeParse(await searchParams);

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
  const showProcessedNotice = parsedSearchParams.success
    ? parsedSearchParams.data.processed === "1"
    : false;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
          PDF preview
        </p>
        <h1 className="mt-2 text-4xl text-[color:oklch(0.245_0.026_41)]">
          {document.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:oklch(0.49_0.024_39)]">
          {document.previewMode === "processed"
            ? "You are viewing the processed PDF stored after QR replacement."
            : "Preview rendering is for navigation and QR coordinate selection. Final output will continue to use PDF mutation, not rasterized preview pages."}
        </p>
      </div>

      {showProcessedNotice && document.processedFileUrl ? (
        <div className="rounded-[1.8rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(237,251,243,0.98),rgba(226,246,235,0.95))] p-6 text-emerald-950 shadow-[0_22px_48px_-36px_rgba(36,92,55,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Process Complete
          </p>
          <h2 className="mt-2 text-lg font-semibold">
            The QR code was replaced and the new document is ready.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-900/80">
            The preview below is now showing the processed PDF, not the original
            upload. Open the processed file directly or test the QR target URL.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              className={buttonVariants({ variant: "primary", size: "sm" })}
              href={document.processedFileUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open processed PDF
            </a>
            {management.qrTargetUrl ? (
              <a
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                href={management.qrTargetUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open QR target
              </a>
            ) : null}
            <a
              className={buttonVariants({ variant: "secondary", size: "sm" })}
              href={document.originalFileUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open original PDF
            </a>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="grid gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-[color:oklch(0.5_0.024_38)]">Original file</p>
              <p className="mt-1 truncate font-medium text-zinc-950">
                {document.originalFilename}
              </p>
            </div>
            <div>
              <p className="text-[color:oklch(0.5_0.024_38)]">Status</p>
              <p className="mt-1 font-medium text-zinc-950">
                {document.status}
              </p>
            </div>
            <div>
              <p className="text-[color:oklch(0.5_0.024_38)]">Created</p>
              <p className="mt-1 font-medium text-zinc-950">
                {document.createdAt.toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-[color:oklch(0.5_0.024_38)]">Previewing</p>
              <p className="mt-1 font-medium text-zinc-950">
                {document.previewMode === "processed"
                  ? "Processed PDF"
                  : "Original PDF"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PdfPreviewViewer
            fileUrl={document.fileUrl}
            allowQrEditing={document.previewMode !== "processed"}
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
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
            Step 3
          </p>
          <h2 className="mt-2 text-2xl text-[color:oklch(0.245_0.026_41)]">
            Processing
          </h2>
          <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
            Regenerate or process the PDF after QR coordinates and access
            settings are correct.
          </p>
        </CardHeader>
        <CardContent>
          {document.status === "DRAFT" ? (
            <ProcessDocumentButton publicId={document.publicId} />
          ) : (
            <div className="rounded-[1.4rem] border border-[color:oklch(0.89_0.015_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(246,241,233,0.62))] p-4 text-sm text-[color:oklch(0.45_0.024_39)]">
              {document.status === "PROCESSED"
                ? "This document already has a processed PDF. Use the processed preview above or choose Regenerate PDF in Management if you need to rebuild it."
                : "This document is not in draft state. Use Regenerate PDF in Management if you need to run QR replacement again."}
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentManagementSummary document={management} />
    </div>
  );
}
