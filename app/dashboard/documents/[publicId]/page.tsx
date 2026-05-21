// Owns the shared document editing workspace for replacement and insertion.
// Loads the original PDF plus owner controls, then lets the user choose how to edit the QR.
// Must keep the original PDF as the editing source so owners can return and reprocess later.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { z } from "zod";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DocumentManagementSummary } from "@/features/documents/components/document-management-summary";
import { DocumentWorkflowPicker } from "@/features/documents/components/document-workflow-picker";
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

function formatWorkflowType(
  workflowType: "REPLACE_EXISTING_QR" | "INSERT_NEW_QR" | null,
) {
  if (!workflowType) {
    return "Not selected yet";
  }

  return workflowType === "INSERT_NEW_QR"
    ? "Add new QR"
    : "Replace existing QR";
}

function formatDate(date: Date | null) {
  if (!date) {
    return "Not available yet";
  }

  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StepLabel({ children }: { children: string }) {
  return (
    <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
      {children}
    </p>
  );
}

function HelpText({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
      {children}
    </p>
  );
}

function DetailPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-[1.6rem] border border-[color:oklch(0.89_0.015_74)] bg-white/70 shadow-[0_18px_44px_-36px_rgba(85,58,34,0.28)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-sm font-medium text-zinc-950">
            {title}
          </span>
          <span className="mt-1 block text-sm text-[color:oklch(0.49_0.024_39)]">
            {description}
          </span>
        </span>
        <span className="shrink-0 rounded-full border border-[color:oklch(0.88_0.014_74)] bg-white px-3 py-1 text-xs font-medium text-[color:oklch(0.45_0.024_39)] transition group-open:bg-[color:oklch(0.96_0.008_80)]">
          <span className="group-open:hidden">Show</span>
          <span className="hidden group-open:inline">Hide</span>
        </span>
      </summary>
      <div className="border-t border-[color:oklch(0.9_0.012_74)] px-5 py-5">
        {children}
      </div>
    </details>
  );
}

const routeParamsSchema = z.object({
  publicId: z.string().min(1).max(128),
});

const searchParamsSchema = z.object({
  processed: z.enum(["1"]).optional(),
});

function canDownloadFinalPdf(document: {
  status: string;
  processedFileUrl: string | null;
}) {
  return document.status === "PROCESSED" && !!document.processedFileUrl;
}

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
    ? parsedSearchParams.data.processed === "1" && canDownloadFinalPdf(document)
    : false;
  const showFinalPdfActions = canDownloadFinalPdf(document);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
          Edit PDF QR
        </p>
        <h1 className="mt-2 text-4xl text-[color:oklch(0.245_0.026_41)]">
          {document.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:oklch(0.49_0.024_39)]">
          Choose what kind of QR update you need, place the QR on the PDF,
          choose what people see when they scan it, then create the final PDF.
        </p>
      </div>

      {showProcessedNotice && document.processedFileUrl ? (
        <div className="rounded-[1.8rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(237,251,243,0.98),rgba(226,246,235,0.95))] p-6 text-emerald-950 shadow-[0_22px_48px_-36px_rgba(36,92,55,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Final PDF ready
          </p>
          <h2 className="mt-2 text-lg font-semibold">
            Your updated PDF has been created.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-900/80">
            You can download it now, open it for review, or test the QR link.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              className={buttonVariants({ variant: "primary", size: "sm" })}
              href={`${document.processedFileUrl}?download=1`}
            >
              Download final PDF
            </a>
            <a
              className={buttonVariants({ variant: "secondary", size: "sm" })}
              href={document.processedFileUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open final PDF
            </a>
            {management.qrTargetUrl ? (
              <a
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                href={management.qrTargetUrl}
                rel="noreferrer"
                target="_blank"
              >
                Test QR link
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 text-sm md:grid-cols-4">
        {[
          ["1", "Choose action"],
          ["2", "Place QR"],
          ["3", "Set scan result"],
          ["4", "Create PDF"],
        ].map(([number, label]) => (
          <div
            className="rounded-2xl border border-[color:oklch(0.89_0.015_74)] bg-white/76 p-3"
            key={number}
          >
            <p className="text-xs font-semibold text-[color:oklch(0.5_0.024_38)]">
              Step {number}
            </p>
            <p className="mt-1 font-medium text-zinc-950">{label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <StepLabel>Step 1</StepLabel>
          <h2 className="mt-2 text-2xl text-[color:oklch(0.245_0.026_41)]">
            What do you want to do?
          </h2>
          <HelpText>
            Choose replace if your PDF already has a QR code. Choose add if you
            want to place a new QR code somewhere on the PDF.
          </HelpText>
        </CardHeader>
        <CardContent>
          <DocumentWorkflowPicker
            activeWorkflowType={document.workflowType}
            publicId={document.publicId}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <StepLabel>Step 2</StepLabel>
          <h2 className="mt-2 text-2xl text-[color:oklch(0.245_0.026_41)]">
            Place the QR code
          </h2>
          <HelpText>
            Use the PDF preview to choose exactly where the QR code should go.
            For replacement, you can scan the page first or adjust the box by
            hand.
          </HelpText>
        </CardHeader>
        <CardContent>
          <PdfPreviewViewer
            fileUrl={document.fileUrl}
            allowQrEditing={
              document.status === "DRAFT" && !!document.workflowType
            }
            editingExperience={
              document.workflowType === "INSERT_NEW_QR" ? "insert" : "replace"
            }
            initialQrBounds={
              qrBounds.status === "success" ? qrBounds.bounds : undefined
            }
            publicId={document.publicId}
          />
        </CardContent>
      </Card>

      {document.status === "DRAFT" && document.workflowType ? (
        <QrSettingsCard
          publicId={document.publicId}
          initialSettings={
            qrSettings.status === "success" ? qrSettings.settings : undefined
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <StepLabel>Step 3</StepLabel>
            <h2 className="mt-2 text-2xl text-[color:oklch(0.245_0.026_41)]">
              What should happen when someone scans the QR?
            </h2>
            <HelpText>
              Choose an action in step 1 before setting scan behavior, access
              limits, or PIN protection.
            </HelpText>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <StepLabel>Step 4</StepLabel>
          <h2 className="mt-2 text-2xl text-[color:oklch(0.245_0.026_41)]">
            Create the final PDF
          </h2>
          <HelpText>
            When the QR position and scan settings are saved, create a new final
            PDF from the original upload.
          </HelpText>
        </CardHeader>
        <CardContent>
          {document.status === "DRAFT" && document.workflowType ? (
            <ProcessDocumentButton
              actionLabel="Create final PDF"
              confirmationMessage={
                document.workflowType === "INSERT_NEW_QR"
                  ? "This will add the QR code to the saved position and create a final PDF."
                  : "This will replace the selected QR area and create a final PDF."
              }
              confirmLabel="Click again to create PDF"
              processingLabel="Creating PDF..."
              publicId={document.publicId}
            />
          ) : (
            <div className="rounded-[1.4rem] border border-[color:oklch(0.89_0.015_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(246,241,233,0.62))] p-4 text-sm text-[color:oklch(0.45_0.024_39)]">
              {!document.workflowType
                ? "Start by choosing whether to replace an existing QR or add a new one."
                : document.status === "PROCESSED"
                  ? "Choose an action in step 1 if you want to edit this PDF again."
                  : "This document is not ready for a final PDF yet."}
            </div>
          )}
        </CardContent>
      </Card>

      <DetailPanel
        description="Download the original upload or the most recent final PDF."
        title="Files and current status"
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-[1.3rem] border border-[color:oklch(0.89_0.015_74)] bg-white/78 p-5">
            <h3 className="text-base font-medium text-zinc-950">
              Original PDF
            </h3>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[color:oklch(0.5_0.024_38)]">Filename</dt>
                <dd className="mt-1 truncate font-medium text-zinc-950 max-w-44">
                  {document.originalFilename}
                </dd>
              </div>
              <div>
                <dt className="text-[color:oklch(0.5_0.024_38)]">Uploaded</dt>
                <dd className="mt-1 font-medium text-zinc-950">
                  {formatDate(document.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[color:oklch(0.5_0.024_38)]">Edit type</dt>
                <dd className="mt-1 font-medium text-zinc-950">
                  {formatWorkflowType(document.workflowType)}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                href={`${document.originalFileUrl}?download=1`}
              >
                Download original
              </a>
              <a
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                href={document.originalFileUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open original
              </a>
            </div>
          </section>

          <section className="rounded-[1.3rem] border border-[color:oklch(0.89_0.015_74)] bg-white/78 p-5">
            <h3 className="text-base font-medium text-zinc-950">Final PDF</h3>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[color:oklch(0.5_0.024_38)]">Status</dt>
                <dd className="mt-1 font-medium text-zinc-950">
                  {document.status}
                </dd>
              </div>
              <div>
                <dt className="text-[color:oklch(0.5_0.024_38)]">
                  Last created
                </dt>
                <dd className="mt-1 font-medium text-zinc-950">
                  {formatDate(management.processedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[color:oklch(0.5_0.024_38)]">QR link</dt>
                <dd className="mt-1 font-medium text-zinc-950">
                  {management.qrTargetUrl ? "Ready" : "Not ready yet"}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              {showFinalPdfActions && document.processedFileUrl ? (
                <>
                  <a
                    className={buttonVariants({
                      variant: "primary",
                      size: "sm",
                    })}
                    href={`${document.processedFileUrl}?download=1`}
                  >
                    Download final PDF
                  </a>
                  <a
                    className={buttonVariants({
                      variant: "secondary",
                      size: "sm",
                    })}
                    href={document.processedFileUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open final PDF
                  </a>
                </>
              ) : (
                <span className="rounded-xl border border-[color:oklch(0.89_0.015_74)] bg-white/72 px-3 py-2 text-sm text-[color:oklch(0.45_0.024_39)]">
                  No final PDF yet
                </span>
              )}
            </div>
          </section>
        </div>
      </DetailPanel>

      <DetailPanel
        description="Access controls, usage counts, and document management actions."
        title="Advanced management"
      >
        <DocumentManagementSummary document={management} />
      </DetailPanel>
    </div>
  );
}
