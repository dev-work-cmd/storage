"use client";

// Owns interactive owner lifecycle controls for a single document.
// Requires explicit two-step confirmation for destructive actions.
// Server actions perform the ownership checks and audit writes.
import { startTransition, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  deleteDocument,
  disableDocument,
  enableDocument,
  regenerateDocument,
  restoreDocumentAccess,
  revokeDocument,
  type ManagementActionResult,
} from "@/features/documents/actions/document-management-actions";

type DocumentManagementActionsProps = {
  publicId: string;
  isEnabled: boolean;
  isRevoked: boolean;
  status: string;
};

type PendingAction =
  | "revoke"
  | "restore"
  | "disable"
  | "enable"
  | "delete"
  | "regenerate";

export function DocumentManagementActions({
  publicId,
  isEnabled,
  isRevoked,
  status,
}: DocumentManagementActionsProps) {
  const [confirming, setConfirming] = useState<PendingAction | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [result, setResult] = useState<ManagementActionResult | null>(null);

  function runAction(action: PendingAction) {
    if (confirming !== action) {
      setConfirming(action);
      return;
    }

    setPending(action);
    setResult(null);

    startTransition(async () => {
      let actionResult: ManagementActionResult | undefined;

      if (action === "revoke") {
        actionResult = await revokeDocument(publicId);
      } else if (action === "restore") {
        actionResult = await restoreDocumentAccess(publicId);
      } else if (action === "disable") {
        actionResult = await disableDocument(publicId);
      } else if (action === "enable") {
        actionResult = await enableDocument(publicId);
      } else if (action === "regenerate") {
        actionResult = await regenerateDocument(publicId);
      } else {
        await deleteDocument(publicId);
        return;
      }

      setResult(actionResult);
      setPending(null);
      setConfirming(null);
    });
  }

  const canRegenerate = status === "PROCESSED" || status === "FAILED";

  return (
    <div className="space-y-4">
      {result ? (
        <p
          className={
            result.status === "success"
              ? "rounded-[1.2rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(237,251,243,0.98),rgba(226,246,235,0.95))] px-4 py-3 text-sm text-emerald-900"
              : "rounded-[1.2rem] border border-red-200 bg-[linear-gradient(180deg,rgba(254,242,242,0.98),rgba(252,226,226,0.95))] px-4 py-3 text-sm text-red-900"
          }
        >
          {result.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {isRevoked ? (
          <button
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            disabled={pending !== null}
            onClick={() => runAction("restore")}
            type="button"
          >
            {confirming === "restore" ? "Confirm restore" : "Restore access"}
          </button>
        ) : (
          <button
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            disabled={pending !== null}
            onClick={() => runAction("revoke")}
            type="button"
          >
            {confirming === "revoke" ? "Confirm revoke" : "Revoke"}
          </button>
        )}

        {isEnabled ? (
          <button
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            disabled={pending !== null || isRevoked}
            onClick={() => runAction("disable")}
            type="button"
          >
            {confirming === "disable" ? "Confirm disable" : "Disable"}
          </button>
        ) : (
          <button
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            disabled={pending !== null || isRevoked}
            onClick={() => runAction("enable")}
            type="button"
          >
            {confirming === "enable" ? "Confirm enable" : "Enable"}
          </button>
        )}

        <button
          className={buttonVariants({ variant: "secondary", size: "sm" })}
          disabled={pending !== null || !canRegenerate}
          onClick={() => runAction("regenerate")}
          type="button"
        >
          {pending === "regenerate"
            ? "Regenerating..."
            : confirming === "regenerate"
              ? "Confirm regenerate"
              : "Regenerate PDF"}
        </button>

        <button
            className={buttonVariants({
              variant: "secondary",
              size: "sm",
              className:
                "border-red-300 text-red-700 hover:bg-red-50 focus-visible:outline-red-700",
            })}
          disabled={pending !== null}
          onClick={() => runAction("delete")}
          type="button"
        >
          {confirming === "delete" ? "Confirm delete" : "Delete"}
        </button>

        {confirming ? (
          <button
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            disabled={pending !== null}
            onClick={() => setConfirming(null)}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>

      {confirming ? (
        <p className="text-xs leading-5 text-[color:oklch(0.49_0.024_39)]">
          This action changes public access immediately and is written to the
          document audit trail.
        </p>
      ) : null}
    </div>
  );
}
