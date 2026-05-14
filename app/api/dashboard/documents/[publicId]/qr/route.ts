// Owns owner-authorized QR PNG downloads for insertion and replacement workflows.
// Generates the PNG on demand from the persisted app-hosted QR target URL.
// Must never expose raw storage URLs or public QR assets outside app auth.
import { z } from "zod";

import { getOwnedDocumentQr } from "@/features/documents/server/get-owned-document-qr";

export const dynamic = "force-dynamic";

const routeParamsSchema = z.object({
  publicId: z.string().min(1).max(128),
});

function sanitizePngFilename(filename: string) {
  return filename
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/[\r\n]/g, " ")
    .trim();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const params = routeParamsSchema.safeParse(await context.params);

  if (!params.success) {
    return new Response("Not found", { status: 404 });
  }

  const result = await getOwnedDocumentQr(params.data.publicId);

  if (result.status === "unauthorized") {
    return new Response("Unauthorized", { status: 401 });
  }

  if (result.status === "not_found") {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(result.pngBuffer), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${sanitizePngFilename(
        result.filename,
      )}"`,
      "Content-Type": "image/png",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
