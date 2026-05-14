// Owns public processed-PDF streaming after verification policy passes.
// Downloads from private Supabase Storage server-side and applies safe PDF headers.
// Must not expose raw storage URLs, bucket paths, or privileged SDK responses.
import { cookies } from "next/headers";
import { z } from "zod";

import {
  evaluatePublicDocumentAccess,
  type PublicAccessMode,
} from "@/server/services/access/document-access";
import {
  fileAccessGrantCookieName,
  verifyFileAccessGrant,
} from "@/server/services/access/file-access-grant";
import { buildPdfResponseHeaders } from "@/server/services/storage/file-response";
import { downloadProcessedPdf } from "@/server/services/storage/supabase-storage";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  publicId: z.string().min(1).max(128),
});

const searchParamsSchema = z.object({
  mode: z.enum(["open", "download"]).optional(),
  disposition: z.enum(["inline", "download"]).optional(),
});

function getRequestMetadata(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  return {
    ipAddress,
    userAgent: request.headers.get("user-agent") ?? undefined,
  };
}

function modeFromUrl(request: Request): PublicAccessMode {
  const url = new URL(request.url);
  const parsed = searchParamsSchema.safeParse({
    mode: url.searchParams.get("mode") ?? undefined,
    disposition: url.searchParams.get("disposition") ?? undefined,
  });

  if (!parsed.success) {
    return "open";
  }

  if (parsed.data.mode === "download" || parsed.data.disposition === "download") {
    return "download";
  }

  return "open";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const parsedParams = paramsSchema.safeParse(await context.params);

  if (!parsedParams.success) {
    return new Response("Not found", { status: 404 });
  }

  const publicId = parsedParams.data.publicId;
  const mode = modeFromUrl(request);
  const cookieStore = await cookies();
  const grant = cookieStore.get(fileAccessGrantCookieName(publicId, mode));
  const hasGrant = verifyFileAccessGrant(grant?.value, { publicId, mode });
  const result = await evaluatePublicDocumentAccess({
    publicId,
    mode,
    metadata: getRequestMetadata(request),
    pinVerified: hasGrant,
    recordAccess: !hasGrant,
  });

  if (result.status === "pin_required" && !hasGrant) {
    return new Response("PIN required", { status: 403 });
  }

  if (result.status === "denied") {
    return new Response(result.message, {
      status: result.reason === "not_found" ? 404 : 403,
    });
  }

  if (result.status !== "allowed") {
    return new Response("Access denied", { status: 403 });
  }

  let pdfBlob: Blob;
  try {
    pdfBlob = await downloadProcessedPdf(result.document.processedFilePath);
  } catch {
    return new Response("The processed file is unavailable.", { status: 404 });
  }

  return new Response(pdfBlob.stream(), {
    headers: buildPdfResponseHeaders({
      disposition: mode === "download" ? "attachment" : "inline",
      filename: result.document.originalFilename,
    }),
  });
}
