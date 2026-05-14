"use server";

// Owns public verification actions that need form input, such as PIN-protected access.
// Reuses the central access-policy service before redirecting to any file route.
// Must never reveal whether a PIN hash exists or log raw PIN values.
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  evaluatePublicDocumentAccess,
  type PublicAccessMode,
} from "@/server/services/access/document-access";
import {
  createFileAccessGrant,
  fileAccessGrantCookieName,
} from "@/server/services/access/file-access-grant";

export type VerificationPinState = {
  status: "idle" | "error";
  message?: string;
};

const pinSchema = z.object({
  publicId: z.string().min(1).max(128),
  mode: z.enum(["verify", "open", "download"]),
  pin: z.string().min(1, "Enter the PIN."),
});

function getRequestMetadata(headerList: Headers) {
  const forwardedFor = headerList.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown";

  return {
    ipAddress,
    userAgent: headerList.get("user-agent") ?? undefined,
  };
}

export async function verifyPinAndContinue(
  _state: VerificationPinState,
  formData: FormData,
): Promise<VerificationPinState> {
  const parsed = pinSchema.safeParse({
    publicId: formData.get("publicId"),
    mode: formData.get("mode"),
    pin: formData.get("pin"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter the PIN to continue.",
    };
  }

  const headerList = await headers();
  const result = await evaluatePublicDocumentAccess({
    publicId: parsed.data.publicId,
    mode: parsed.data.mode as PublicAccessMode,
    pin: parsed.data.pin,
    metadata: getRequestMetadata(headerList),
  });

  if (result.status === "allowed") {
    if (result.fileRoute) {
      const cookieStore = await cookies();
      cookieStore.set({
        name: fileAccessGrantCookieName(
          parsed.data.publicId,
          parsed.data.mode as PublicAccessMode,
        ),
        value: createFileAccessGrant({
          publicId: parsed.data.publicId,
          mode: parsed.data.mode as PublicAccessMode,
        }),
        httpOnly: true,
        maxAge: 60,
        path: `/api/documents/${encodeURIComponent(parsed.data.publicId)}/file`,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      redirect(result.fileRoute);
    }

    redirect(`/verify/${encodeURIComponent(result.document.publicId)}`);
  }

  return {
    status: "error",
    message:
      result.status === "denied"
        ? result.message
        : "The PIN could not be verified.",
  };
}
