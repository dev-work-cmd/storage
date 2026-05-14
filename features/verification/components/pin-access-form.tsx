"use client";

// Owns the public PIN form for protected verification/open/download flows.
// Keeps PIN entry client-side only for form interactivity; validation remains server-owned.
// Must not display raw policy internals or distinguish missing PIN hash states.
import { useActionState } from "react";

import {
  verifyPinAndContinue,
  type VerificationPinState,
} from "@/features/verification/actions/verification-actions";
import { buttonVariants } from "@/components/ui/button";

const initialState: VerificationPinState = {
  status: "idle",
};

export function PinAccessForm({
  publicId,
  mode,
}: {
  publicId: string;
  mode: "verify" | "open" | "download";
}) {
  const [state, formAction, pending] = useActionState(
    verifyPinAndContinue,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input name="publicId" type="hidden" value={publicId} />
      <input name="mode" type="hidden" value={mode} />
      <div>
        <label className="text-sm font-medium text-zinc-950" htmlFor="pin">
          Access PIN
        </label>
        <input
          autoComplete="one-time-code"
          className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/10"
          id="pin"
          maxLength={64}
          minLength={1}
          name="pin"
          required
          type="password"
        />
      </div>
      {state.message ? (
        <p
          aria-live="polite"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </p>
      ) : null}
      <button
        className={buttonVariants({
          variant: "primary",
          className: "w-full sm:w-auto",
        })}
        disabled={pending}
        type="submit"
      >
        {pending ? "Checking..." : "Continue"}
      </button>
    </form>
  );
}
