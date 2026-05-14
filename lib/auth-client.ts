"use client";

// Owns the browser Better Auth client for interactive auth features.
// Keeps WebAuthn and username plugin calls out of Server Components.
// Must not import server-only auth modules.
import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [usernameClient(), passkeyClient()],
});
