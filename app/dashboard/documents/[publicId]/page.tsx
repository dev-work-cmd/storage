// Owns the shared document editing workspace for replacement and insertion.
// Loads the original PDF plus owner controls, then lets the user choose how to edit the QR.
// Must keep the original PDF as the editing source so owners can return and reprocess later.
import type { Metadata } from "next";
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
    ? "Insert new QR"
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
          Document workspace
        </p>
        <h1 className="mt-2 text-4xl text-[color:oklch(0.245_0.026_41)]">
          {document.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:oklch(0.49_0.024_39)]">
          Upload once, then return here anytime to replace an existing QR or
          insert a new one using the original PDF as the editing source.
        </p>
      </div>

      {showProcessedNotice && document.processedFileUrl ? (
        <div className="rounded-[1.8rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(237,251,243,0.98),rgba(226,246,235,0.95))] p-6 text-emerald-950 shadow-[0_22px_48px_-36px_rgba(36,92,55,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Process Complete
          </p>
          <h2 className="mt-2 text-lg font-semibold">
            The document was reprocessed and the current PDF is ready.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-900/80">
            Editing continues from the original upload below. Download the
            current processed PDF, verify the QR target, or switch modes and
            reprocess again later.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              className={buttonVariants({ variant: "primary", size: "sm" })}
              href={`${document.processedFileUrl}?download=1`}
            >
              Download processed PDF
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
              href={document.processedFileUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open processed PDF
            </a>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="space-y-2">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
              Step 1
            </p>
            <h2 className="text-2xl text-[color:oklch(0.245_0.026_41)]">
              Choose how to edit this document
            </h2>
            <p className="text-sm text-[color:oklch(0.49_0.024_39)]">
              Pick replacement when the PDF already has a QR code. Pick
              insertion when you need to place a new QR manually in open space.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <DocumentWorkflowPicker
            activeWorkflowType={document.workflowType}
            publicId={document.publicId}
          />
        </CardContent>
      </Card>

      {!document.workflowType ? (
        <Card>
          <CardHeader>
            <h2 className="text-2xl text-[color:oklch(0.245_0.026_41)]">
              Stored document preview
            </h2>
            <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
              This document is stored privately and has no QR edit mode selected
              yet. Choose Replace QR or Insert QR above whenever you want to
              start editing.
            </p>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="space-y-2">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
              Versions
            </p>
            <h2 className="text-2xl text-[color:oklch(0.245_0.026_41)]">
              Original source and latest processed output
            </h2>
            <p className="text-sm text-[color:oklch(0.49_0.024_39)]">
              This is one document record. The original upload stays preserved,
              and processing updates the latest output without overwriting the
              source PDF.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-[1.6rem] border border-[color:oklch(0.89_0.015_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(246,241,233,0.64))] p-5">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[color:oklch(0.5_0.024_38)]">
              Original PDF
            </p>
            <h3 className="mt-2 text-xl text-[color:oklch(0.245_0.026_41)]">
              Preserved source document
            </h3>
            <p className="mt-2 text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
              Every edit starts from this original upload. Replacing or
              inserting a QR never destroys the stored source file.
            </p>
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
                <dt className="text-[color:oklch(0.5_0.024_38)]">Workflow</dt>
                <dd className="mt-1 font-medium text-zinc-950">
                  {formatWorkflowType(document.workflowType)}
                </dd>
              </div>
              <div>
                <dt className="text-[color:oklch(0.5_0.024_38)]">
                  Editing source
                </dt>
                <dd className="mt-1 font-medium text-zinc-950">Original PDF</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                href={`${document.originalFileUrl}?download=1`}
              >
                Download original PDF
              </a>
              <a
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                href={document.originalFileUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open original PDF
              </a>
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-[color:oklch(0.89_0.015_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(246,241,233,0.64))] p-5">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[color:oklch(0.5_0.024_38)]">
              Latest Processed PDF
            </p>
            <h3 className="mt-2 text-xl text-[color:oklch(0.245_0.026_41)]">
              Current generated output
            </h3>
            <p className="mt-2 text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
              This is the most recent processed version for sharing,
              verification, and downloads. Choosing a mode below lets you edit
              again from the original source and publish a new latest output.
            </p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[color:oklch(0.5_0.024_38)]">Status</dt>
                <dd className="mt-1 font-medium text-zinc-950">
                  {document.status}
                </dd>
              </div>
              <div>
                <dt className="text-[color:oklch(0.5_0.024_38)]">
                  Last processed
                </dt>
                <dd className="mt-1 font-medium text-zinc-950">
                  {formatDate(management.processedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[color:oklch(0.5_0.024_38)]">QR target</dt>
                <dd className="mt-1 font-medium text-zinc-950">
                  {management.qrTargetUrl ? "Configured" : "Not configured yet"}
                </dd>
              </div>
              <div>
                <dt className="text-[color:oklch(0.5_0.024_38)]">Re-editing</dt>
                <dd className="mt-1 font-medium text-zinc-950">
                  Always starts from original
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              {document.processedFileUrl ? (
                <>
                  <a
                    className={buttonVariants({
                      variant: "primary",
                      size: "sm",
                    })}
                    href={`${document.processedFileUrl}?download=1`}
                  >
                    Download latest processed PDF
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
                    Open latest processed PDF
                  </a>
                </>
              ) : (
                <span className="rounded-xl border border-[color:oklch(0.89_0.015_74)] bg-white/72 px-3 py-2 text-sm text-[color:oklch(0.45_0.024_39)]">
                  No processed version yet
                </span>
              )}
            </div>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="grid gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-[color:oklch(0.5_0.024_38)]">Original file</p>
              <p className="mt-1 truncate font-medium text-zinc-950 max-w-44">
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
              <p className="text-[color:oklch(0.5_0.024_38)]">Mode</p>
              <p className="mt-1 font-medium text-zinc-950">
                {formatWorkflowType(document.workflowType)}
              </p>
            </div>
            <div>
              <p className="text-[color:oklch(0.5_0.024_38)]">Created</p>
              <p className="mt-1 font-medium text-zinc-950">
                {formatDate(document.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[color:oklch(0.5_0.024_38)]">Editing source</p>
              <p className="mt-1 font-medium text-zinc-950">Original PDF</p>
            </div>
          </div>
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
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
              Step 2
            </p>
            <h2 className="mt-2 text-2xl text-[color:oklch(0.245_0.026_41)]">
              QR behavior & access settings
            </h2>
            <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
              {!document.workflowType
                ? "Choose Replace QR or Insert QR above before setting access rules for a processed version."
                : "Choose an edit mode above to reopen this document in draft before changing access settings for the next processed version."}
            </p>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
            Step 3
          </p>
          <h2 className="mt-2 text-2xl text-[color:oklch(0.245_0.026_41)]">
            Processing
          </h2>
          <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
            Save bounds and access settings, then generate the next processed
            PDF from the original upload.
          </p>
        </CardHeader>
        <CardContent>
          {document.status === "DRAFT" && document.workflowType ? (
            <ProcessDocumentButton
              actionLabel={
                document.workflowType === "INSERT_NEW_QR"
                  ? "Insert QR into PDF"
                  : "Replace QR in PDF"
              }
              confirmationMessage={
                document.workflowType === "INSERT_NEW_QR"
                  ? "Processing will insert a new QR code into the saved rectangle and publish the new processed PDF for this document."
                  : "Processing will replace the selected QR area in the original PDF and publish the new processed version for this document."
              }
              confirmLabel={
                document.workflowType === "INSERT_NEW_QR"
                  ? "Click again to confirm insertion"
                  : "Click again to confirm replacement"
              }
              processingLabel={
                document.workflowType === "INSERT_NEW_QR"
                  ? "Inserting QR..."
                  : "Replacing QR..."
              }
              publicId={document.publicId}
            />
          ) : (
            <div className="rounded-[1.4rem] border border-[color:oklch(0.89_0.015_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(246,241,233,0.62))] p-4 text-sm text-[color:oklch(0.45_0.024_39)]">
              {!document.workflowType
                ? "This document is currently stored only. Choose Replace QR or Insert QR above when you want to begin editing."
                : document.status === "PROCESSED"
                  ? "Select Replace QR or Insert QR above to return this document to editable draft mode, then process a new version from the original PDF."
                  : "This document is not currently editable. Choose an edit mode above to prepare it for reprocessing."}
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentManagementSummary document={management} />
    </div>
  );
}
