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
          className="mt-2 h-12 w-full rounded-2xl border border-[color:oklch(0.89_0.015_74)] bg-white/85 px-4 text-sm text-zinc-950 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition focus:border-[color:oklch(0.62_0.073_32.8)] focus:ring-4 focus:ring-[color:oklch(0.88_0.025_68)]"
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
          className="rounded-[1.2rem] border border-red-200 bg-[linear-gradient(180deg,rgba(254,242,242,0.98),rgba(252,226,226,0.95))] px-4 py-3 text-sm text-red-900"
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
