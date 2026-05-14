// Owns centralized QR target URL construction for the platform.
// Builds stable app-hosted verification URLs based on document publicId and QR mode.
// Must never embed raw Supabase storage URLs, internal paths, or secrets in the payload.
// Uses NEXT_PUBLIC_APP_URL as the stable base per platform rules.
import "server-only";

import { env } from "@/lib/env";

export type QrTargetMode = "VERIFY" | "OPEN" | "DOWNLOAD";

/**
 * Builds the public verification URL for a document's QR code.
 *
 * URL variants:
 *   VERIFY   → /verify/{publicId}
 *   OPEN     → /verify/{publicId}?mode=open
 *   DOWNLOAD → /verify/{publicId}?mode=download
 *
 * The base URL comes from NEXT_PUBLIC_APP_URL (already validated and trimmed in env.ts).
 */
export function buildQrTargetUrl(
  publicId: string,
  mode: QrTargetMode = "VERIFY",
): string {
  const base = env.NEXT_PUBLIC_APP_URL;
  const path = `/verify/${encodeURIComponent(publicId)}`;

  switch (mode) {
    case "OPEN":
      return `${base}${path}?mode=open`;
    case "DOWNLOAD":
      return `${base}${path}?mode=download`;
    case "VERIFY":
    default:
      return `${base}${path}`;
  }
}

/**
 * Returns the canonical verification path (without base URL).
 * Useful for internal routing and path-based checks.
 */
export function getVerificationPath(publicId: string): string {
  return `/verify/${encodeURIComponent(publicId)}`;
}

/**
 * Parses a QR mode from a URL search param string.
 * Returns VERIFY as the safe default for any unrecognized value.
 */
export function parseQrModeFromParam(param: string | null): QrTargetMode {
  if (param === "open") return "OPEN";
  if (param === "download") return "DOWNLOAD";
  return "VERIFY";
}
