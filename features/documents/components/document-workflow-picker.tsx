"use client";

// Owns the owner-facing action chooser for document QR editing.
// Switches a document into replacement or insertion mode from the shared detail page.
// Must keep the choice explicit so users can return later and re-edit the original PDF.
import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { QrCode, ScanQrCode, type LucideIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { selectDocumentWorkflow } from "@/features/documents/actions/document-management-actions";

type WorkflowType = "REPLACE_EXISTING_QR" | "INSERT_NEW_QR";

const WORKFLOW_OPTIONS: Record<
  WorkflowType,
  {
    title: string;
    description: string;
    icon: LucideIcon;
    actionLabel: string;
  }
> = {
  REPLACE_EXISTING_QR: {
    title: "Replace existing QR",
    description:
      "Choose this if the PDF already has a QR code and you want to swap it for a new one.",
    icon: ScanQrCode,
    actionLabel: "Replace QR",
  },
  INSERT_NEW_QR: {
    title: "Add new QR",
    description:
      "Choose this if the PDF does not have a QR code yet, or you want to add another one.",
    icon: QrCode,
    actionLabel: "Add QR",
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
  const pathname = usePathname();
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
        window.sessionStorage.removeItem(WORKFLOW_TOAST_KEY);
        const showTimeoutId = window.setTimeout(() => {
          setToastMessage(parsed.message ?? null);
        }, 0);
        const hideTimeoutId = window.setTimeout(() => {
          setToastMessage(null);
        }, 3200);

        return () => {
          window.clearTimeout(showTimeoutId);
          window.clearTimeout(hideTimeoutId);
        };
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
                ? "Add QR is ready. Place the QR directly on the PDF preview."
                : "Replace mode is ready. Scan the page or place the box by hand.",
          }),
        );
        router.replace(pathname, { scroll: false });
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
          const OptionIcon = option.icon;

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
                  <OptionIcon size={20} strokeWidth={1.8} />
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
                      ? `${option.actionLabel} selected`
                      : option.actionLabel}
                </button>
                {isActive ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Selected
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
