"use client";

// Owns the first-owner setup form.
// Uses a Server Action so bootstrap authorization and cookie writes stay server-side.
// Must not collect email because the product uses username-first owner auth.
import { useActionState } from "react";

import { setupOwner, type AuthActionState } from "../actions/auth-actions";

const initialState: AuthActionState = {
  status: "idle",
};

export function SetupOwnerForm() {
  const [state, action, pending] = useActionState(setupOwner, initialState);

  return (
    <form action={action} className="space-y-5">
      <FieldError message={state.message} />

      <label className="block space-y-2">
        <span className="text-sm font-medium">Username</span>
        <input
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-950"
          name="username"
          autoComplete="username"
          required
        />
        <FieldError message={state.fieldErrors?.username?.[0]} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Password</span>
        <input
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-950"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError message={state.fieldErrors?.password?.[0]} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Confirm password</span>
        <input
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-950"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError message={state.fieldErrors?.confirmPassword?.[0]} />
      </label>

      <button
        className="h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        Create owner
      </button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-700">{message}</p>;
}
