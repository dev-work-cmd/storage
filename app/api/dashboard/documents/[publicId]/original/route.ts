// Owns owner-authorized streaming of original PDFs for dashboard preview.
// Keeps private Supabase objects behind app auth and avoids exposing storage URLs.
// Must not be reused as the public processed-document streaming route.
import { z } from "zod";

import { getOwnedOriginalPdf } from "@/features/documents/server/get-owned-original-pdf";

export const dynamic = "force-dynamic";

const routeParamsSchema = z.object({
  publicId: z.string().min(1).max(128),
});

function safeInlineFilename(filename: string) {
  return filename.replace(/[\r\n"]/g, "_");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const params = routeParamsSchema.safeParse(await context.params);

  if (!params.success) {
    return new Response("Not found", { status: 404 });
  }

  const result = await getOwnedOriginalPdf(params.data.publicId);

  if (result.status === "unauthorized") {
    return new Response("Unauthorized", { status: 401 });
  }

  if (result.status === "not_found") {
    return new Response("Not found", { status: 404 });
  }

  return new Response(result.blob.stream(), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="${safeInlineFilename(
        result.filename,
      )}"`,
      "Content-Type": "application/pdf",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
