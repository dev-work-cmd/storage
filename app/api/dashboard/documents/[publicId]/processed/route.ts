// Owns owner-authorized streaming of processed PDFs for dashboard preview.
// Keeps private Supabase objects behind app auth and avoids exposing storage URLs.
// Must only serve successfully processed files while supporting owner download.
import type { NextRequest } from "next/server";
import { z } from "zod";

import { getOwnedProcessedPdf } from "@/features/documents/server/get-owned-processed-pdf";
import { buildPdfResponseHeaders } from "@/server/services/storage/file-response";

export const dynamic = "force-dynamic";

const routeParamsSchema = z.object({
  publicId: z.string().min(1).max(128),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ publicId: string }> },
) {
  const params = routeParamsSchema.safeParse(await context.params);

  if (!params.success) {
    return new Response("Not found", { status: 404 });
  }

  const result = await getOwnedProcessedPdf(params.data.publicId);

  if (result.status === "unauthorized") {
    return new Response("Unauthorized", { status: 401 });
  }

  if (result.status === "not_found") {
    return new Response("Not found", { status: 404 });
  }

  const disposition =
    request.nextUrl.searchParams.get("download") === "1"
      ? "attachment"
      : "inline";

  return new Response(result.blob.stream(), {
    headers: buildPdfResponseHeaders({
      disposition,
      filename: result.filename,
    }),
  });
}
