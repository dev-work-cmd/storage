// Owns backward-compatible routing for the old dedicated insertion page.
// Redirects into the shared document detail workspace where editing modes now live together.
// Must avoid exposing a second primary editing surface after the UX consolidation.
import { redirect } from "next/navigation";
import { z } from "zod";

const routeParamsSchema = z.object({
  publicId: z.string().min(1).max(128),
});

export default async function LegacyInsertQrPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const parsedParams = routeParamsSchema.safeParse(await params);

  if (!parsedParams.success) {
    redirect("/dashboard/documents");
  }

  redirect(`/dashboard/documents/${parsedParams.data.publicId}`);
}
