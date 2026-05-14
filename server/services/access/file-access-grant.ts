// Owns short-lived grants from public verification to the secure file route.
// Allows PIN-verified requests to stream without putting PIN values in URLs.
// Must stay server-only because it signs grants with the app auth secret.
import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "@/lib/env";
import type { PublicAccessMode } from "@/server/services/access/document-access";

const GRANT_TTL_SECONDS = 60;
const GRANT_PREFIX = "pdf_access";

export function fileAccessGrantCookieName(publicId: string, mode: PublicAccessMode) {
  return `${GRANT_PREFIX}_${publicId}_${mode}`;
}

function signPayload(payload: string) {
  return createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(payload)
    .digest("base64url");
}

export function createFileAccessGrant(input: {
  publicId: string;
  mode: PublicAccessMode;
}) {
  const expiresAt = Math.floor(Date.now() / 1000) + GRANT_TTL_SECONDS;
  const payload = `${input.publicId}.${input.mode}.${expiresAt}`;
  return `${payload}.${signPayload(payload)}`;
}

export function verifyFileAccessGrant(
  value: string | undefined,
  input: { publicId: string; mode: PublicAccessMode },
) {
  if (!value) {
    return false;
  }

  const parts = value.split(".");

  if (parts.length !== 4) {
    return false;
  }

  const [publicId, mode, expiresAtText, signature] = parts;
  const expiresAt = Number(expiresAtText);

  if (
    publicId !== input.publicId ||
    mode !== input.mode ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  const payload = `${publicId}.${mode}.${expiresAtText}`;
  const expected = signPayload(payload);

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
