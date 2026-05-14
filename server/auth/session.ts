// Owns server-side session access and dashboard guards.
// Centralizes Better Auth session validation so pages and actions do not trust cookies alone.
// Must stay server-only because it reads request headers and auth internals.
import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth/better-auth";

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireCurrentSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
