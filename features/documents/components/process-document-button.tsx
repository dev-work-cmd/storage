"use client";

// Owns the "Process Document" button with confirmation and error handling.
// Triggers the end-to-end processing pipeline: QR replacement + storage.
// Must stay client-side for interactive confirmation; server action handles processing.
import { startTransition, useState } from "react";

import { processDocumentAction } from "@/features/documents/actions/process-document-action";

interface ProcessButtonProps {
  publicId: string;
}

export function ProcessDocumentButton({ publicId }: ProcessButtonProps) {
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
              ? "rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              : "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          }
        >
          {result.message}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          onClick={handleProcess}
          disabled={processing}
          className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white transition ${
            confirming
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-blue-600 hover:bg-blue-700"
          } disabled:cursor-not-allowed disabled:bg-zinc-300`}
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
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        ) : null}
      </div>

      {confirming ? (
        <p className="text-xs text-zinc-500">
          Processing will replace the selected QR area with a new QR code. This
          action cannot be undone.
        </p>
      ) : null}
    </div>
  );
}
