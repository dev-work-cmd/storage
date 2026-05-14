"use client";

// Owns the owner-facing action chooser for document QR editing.
// Switches a document into replacement or insertion mode from the shared detail page.
// Must keep the choice explicit so users can return later and re-edit the original PDF.
import { startTransition, useEffect, useState } from "react";
import {
  QrCodeIcon,
  QrCodeScanIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { selectDocumentWorkflow } from "@/features/documents/actions/document-management-actions";

type WorkflowType = "REPLACE_EXISTING_QR" | "INSERT_NEW_QR";

const WORKFLOW_OPTIONS: Record<
  WorkflowType,
  {
    title: string;
    description: string;
    icon: typeof QrCodeIcon;
    actionLabel: string;
  }
> = {
  REPLACE_EXISTING_QR: {
    title: "Replace existing QR",
    description:
      "Use QR detection or manual adjustment to replace the QR that is already printed on this document.",
    icon: QrCodeScanIcon,
    actionLabel: "Replace QR",
  },
  INSERT_NEW_QR: {
    title: "Insert new QR",
    description:
      "Choose a fresh rectangle on the original PDF and place a new app-hosted QR into that area.",
    icon: QrCodeIcon,
    actionLabel: "Insert QR",
  },
};

const WORKFLOW_TOAST_KEY = "document-workflow-toast";

export function DocumentWorkflowPicker({
  publicId,
  activeWorkflowType,
}: {
  publicId: string;
  activeWorkflowType: WorkflowType | null;
}) {
  const router = useRouter();
  const [pendingWorkflow, setPendingWorkflow] = useState<WorkflowType | null>(
    null,
  );
  const [result, setResult] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const rawToast = window.sessionStorage.getItem(WORKFLOW_TOAST_KEY);

    if (!rawToast) {
      return;
    }

    try {
      const parsed = JSON.parse(rawToast) as {
        publicId?: string;
        message?: string;
      };

      if (parsed.publicId === publicId && parsed.message) {
        setToastMessage(parsed.message);
        window.sessionStorage.removeItem(WORKFLOW_TOAST_KEY);
        const timeoutId = window.setTimeout(() => {
          setToastMessage(null);
        }, 3200);

        return () => window.clearTimeout(timeoutId);
      }
    } catch {
      window.sessionStorage.removeItem(WORKFLOW_TOAST_KEY);
    }
  }, [publicId, activeWorkflowType]);

  function activateWorkflow(workflowType: WorkflowType) {
    setPendingWorkflow(workflowType);
    setResult(null);

    startTransition(async () => {
      const response = await selectDocumentWorkflow(publicId, workflowType);

      if (response.status === "success") {
        setPendingWorkflow(null);
        window.sessionStorage.setItem(
          WORKFLOW_TOAST_KEY,
          JSON.stringify({
            publicId,
            message:
              workflowType === "INSERT_NEW_QR"
                ? "Insert mode is ready. Place the QR directly on the PDF preview."
                : "Replace mode is ready. Start with detection or switch to manual positioning if needed.",
          }),
        );
        router.refresh();
        return;
      }

      setPendingWorkflow(null);
      setResult(response.message);
    });
  }

  return (
    <div className="space-y-4">
      {toastMessage ? (
        <div className="fixed right-5 top-5 z-50 max-w-sm rounded-[1.2rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(237,251,243,0.98),rgba(226,246,235,0.95))] px-4 py-3 text-sm text-emerald-950 shadow-[0_20px_48px_-24px_rgba(36,92,55,0.35)]">
          {toastMessage}
        </div>
      ) : null}

      {result ? (
        <div className="rounded-[1.2rem] border border-red-200 bg-[linear-gradient(180deg,rgba(254,242,242,0.98),rgba(252,226,226,0.95))] px-4 py-3 text-sm text-red-900">
          {result}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {(Object.entries(WORKFLOW_OPTIONS) as Array<
          [WorkflowType, (typeof WORKFLOW_OPTIONS)[WorkflowType]]
        >).map(([workflowType, option]) => {
          const isActive = workflowType === activeWorkflowType;
          const isPending = pendingWorkflow === workflowType;

          return (
            <section
              className={`rounded-[1.8rem] border p-5 shadow-[0_18px_44px_-34px_rgba(85,58,34,0.3)] transition ${
                isActive
                  ? "border-[color:oklch(0.62_0.073_32.8)] bg-[linear-gradient(180deg,rgba(255,246,238,0.98),rgba(250,239,227,0.95))]"
                  : "border-[color:oklch(0.89_0.015_74)] bg-white/84"
              }`}
              key={workflowType}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/75 bg-white/72 text-[color:oklch(0.33_0.075_31.5)] shadow-[0_12px_28px_-24px_rgba(93,47,28,0.65)]">
                  <HugeiconsIcon icon={option.icon} size={20} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-base font-medium text-zinc-950">
                    {option.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
                    {option.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  className={buttonVariants({
                    variant: isActive ? "primary" : "secondary",
                    size: "sm",
                  })}
                  disabled={pendingWorkflow !== null}
                  onClick={() => activateWorkflow(workflowType)}
                  type="button"
                >
                  {isPending
                    ? "Preparing..."
                    : isActive
                      ? `${option.actionLabel} Mode`
                      : option.actionLabel}
                </button>
                {isActive ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Current mode
                  </span>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
