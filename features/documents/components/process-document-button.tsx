"use client";

// Owns the "Process Document" button with confirmation and error handling.
// Triggers the end-to-end processing pipeline: QR replacement + storage.
// Must stay client-side for interactive confirmation; server action handles processing.
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { processDocumentAction } from "@/features/documents/actions/process-document-action";

interface ProcessButtonProps {
  publicId: string;
}

export function ProcessDocumentButton({ publicId }: ProcessButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);

  function handleProcess() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setConfirming(false);
    setProcessing(true);
    setResult(null);

    startTransition(async () => {
      const res = await processDocumentAction(publicId);

      if (res.status === "success") {
        router.replace(`/dashboard/documents/${publicId}?processed=1`);
        return;
      }

      setResult(res);
      setProcessing(false);
    });
  }

  function handleCancel() {
    setConfirming(false);
  }

  return (
    <div className="space-y-3">
      {result ? (
        <div
          className={
            result.status === "success"
              ? "rounded-[1.4rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(237,251,243,0.98),rgba(226,246,235,0.95))] p-4 text-sm text-emerald-900"
              : "rounded-[1.4rem] border border-red-200 bg-[linear-gradient(180deg,rgba(254,242,242,0.98),rgba(252,226,226,0.95))] p-4 text-sm text-red-900"
          }
        >
          {result.message}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          onClick={handleProcess}
          disabled={processing}
          className={
            confirming
              ? "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-[linear-gradient(180deg,rgba(251,191,36,0.95),rgba(217,119,6,0.95))] px-4 text-sm font-medium text-white shadow-[0_14px_32px_-22px_rgba(180,83,9,0.8)] transition hover:-translate-y-px disabled:pointer-events-none disabled:opacity-60"
              : buttonVariants()
          }
        >
          {processing
            ? "Processing..."
            : confirming
              ? "Click again to confirm processing"
              : "Process Document"}
        </button>

        {confirming ? (
          <button
            onClick={handleCancel}
            disabled={processing}
            className={buttonVariants({ variant: "secondary" })}
          >
            Cancel
          </button>
        ) : null}
      </div>

      {confirming ? (
        <p className="text-xs leading-5 text-[color:oklch(0.49_0.024_39)]">
          Processing will replace the selected QR area with a new QR code. This
          action cannot be undone.
        </p>
      ) : null}
    </div>
  );
}
