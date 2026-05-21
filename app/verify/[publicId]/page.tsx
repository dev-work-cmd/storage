// Owns the public verification route reached by generated QR codes.
// Evaluates owner policy before redirecting to any secure file route.
// Must not stream files directly or expose private storage URLs.
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { PublicShell } from "@/components/layout/public-shell";
import { VerificationResult } from "@/features/verification/components/verification-result";
import {
  evaluatePublicDocumentAccess,
  type PublicAccessMode,
} from "@/server/services/access/document-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify Document",
};

const paramsSchema = z.object({
  publicId: z.string().min(1).max(128),
});

const searchParamsSchema = z.object({
  mode: z.enum(["open", "download"]).optional(),
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

export default async function VerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parsedParams = paramsSchema.safeParse(await params);

  if (!parsedParams.success) {
    return (
      <PublicShell className="flex items-center">
        <VerificationResult
          result={{
            status: "denied",
            mode: "verify",
            reason: "not_found",
            message: "This verification link is not available.",
          }}
        />
      </PublicShell>
    );
  }

  const rawSearchParams = await searchParams;
  const parsedSearchParams = searchParamsSchema.safeParse({
    mode: Array.isArray(rawSearchParams.mode)
      ? rawSearchParams.mode[0]
      : rawSearchParams.mode,
  });
  const mode = (parsedSearchParams.success
    ? parsedSearchParams.data.mode
    : undefined) as PublicAccessMode | undefined;
  const accessMode = mode ?? "verify";
  const headerList = await headers();
  const result = await evaluatePublicDocumentAccess({
    publicId: parsedParams.data.publicId,
    mode: accessMode,
    followDocumentQrMode: !mode,
    metadata: getRequestMetadata(headerList),
    recordAccess: accessMode === "verify",
  });

  if (result.status === "allowed" && result.fileRoute) {
    redirect(result.fileRoute);
  }

  return (
    <PublicShell className="mx-auto w-full max-w-3xl">
      <VerificationResult result={result} />
    </PublicShell>
  );
}
