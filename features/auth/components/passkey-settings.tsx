"use client";

// Owns authenticated passkey registration controls.
// WebAuthn must run in the browser, while Better Auth keeps challenge verification server-side.
// Must not expose credential material beyond the Better Auth client APIs.
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function PasskeySettings() {
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);

  async function addPasskey() {
    setPending(true);
    setMessage(undefined);

    const result = await authClient.passkey.addPasskey({
      name: "Owner passkey",
    });

    setPending(false);

    if (result.error) {
      setMessage("Passkey registration was not completed.");
      return;
    }

    setMessage("Passkey registered.");
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="mb-4 space-y-1">
        <h2 className="text-base font-semibold tracking-tight">Passkey</h2>
        <p className="text-sm leading-6 text-zinc-600">
          Add a passkey for passwordless sign-in on supported devices.
        </p>
      </div>
      <button
        className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={addPasskey}
        disabled={pending}
      >
        Add passkey
      </button>
      {message ? <p className="mt-3 text-sm text-zinc-600">{message}</p> : null}
    </div>
  );
}
