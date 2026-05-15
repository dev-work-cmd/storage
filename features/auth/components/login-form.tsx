"use client";

// Owns username/password and passkey login controls.
// Keeps browser-only WebAuthn calls in a client component.
// Must show one generic credential failure message to avoid username enumeration.
import { useActionState, useEffect, useState, startTransition } from "react";
import { Eye, EyeOff } from "lucide-react";

import { authClient } from "@/lib/auth-client";

import { loginWithUsername, type AuthActionState } from "../actions/auth-actions";

const initialState: AuthActionState = {
  status: "idle",
};

export function LoginForm() {
  const [state, action, pending] = useActionState(
    loginWithUsername,
    initialState,
  );
  const [passkeyMessage, setPasskeyMessage] = useState<string>();
  const [passkeyPending, setPasskeyPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (
      typeof PublicKeyCredential === "undefined" ||
      !PublicKeyCredential.isConditionalMediationAvailable
    ) {
      return;
    }

    startTransition(() => {
      void PublicKeyCredential.isConditionalMediationAvailable().then(
        (available) => {
          if (available) {
            void authClient.signIn.passkey({ autoFill: true });
          }
        },
      );
    });
  }, []);

  async function signInWithPasskey() {
    setPasskeyPending(true);
    setPasskeyMessage(undefined);

    const result = await authClient.signIn.passkey();

    setPasskeyPending(false);

    if (result.error) {
      setPasskeyMessage("Passkey sign-in was not completed.");
      return;
    }

    window.location.assign("/dashboard");
  }

  return (
    <div className="space-y-5">
      <form action={action} className="space-y-5">
        <FieldError message={state.message} />

        <label className="block space-y-2">
          <span className="text-sm font-medium">Username</span>
          <input
            className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-950"
            name="username"
            autoComplete="username webauthn"
            required
          />
          <FieldError message={state.fieldErrors?.username?.[0]} />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Password</span>
          <div className="relative">
            <input
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 pr-11 text-sm outline-none transition focus:border-zinc-950"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password webauthn"
              required
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={1.9} />
              ) : (
                <Eye size={16} strokeWidth={1.9} />
              )}
            </button>
          </div>
          <FieldError message={state.fieldErrors?.password?.[0]} />
        </label>

        <button
          className="h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          Sign in
        </button>
      </form>

      <div className="border-t border-zinc-200 pt-5">
        <button
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={signInWithPasskey}
          disabled={passkeyPending}
        >
          Sign in with passkey
        </button>
        <FieldError message={passkeyMessage} />
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-700">{message}</p>;
}
