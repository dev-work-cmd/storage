// Owns authorization for private processed PDF preview downloads.
// Verifies document ownership before processed storage access and returns only stream-safe metadata.
// Must not be used for public processed-file delivery; the public verification route owns that flow.
import "server-only";

import { getCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { downloadProcessedPdf } from "@/server/services/storage/supabase-storage";

export type OwnedProcessedPdfResult =
  | { status: "unauthorized" }
  | { status: "not_found" }
  | {
      status: "success";
      blob: Blob;
      filename: string;
    };

export async function getOwnedProcessedPdf(
  publicId: string,
): Promise<OwnedProcessedPdfResult> {
  const session = await getCurrentSession();

  if (!session) {
    return { status: "unauthorized" };
  }

  const document = await prisma.document.findFirst({
    where: {
      publicId,
      ownerId: session.user.id,
      deletedAt: null,
      processedFilePath: {
        not: null,
      },
      status: "PROCESSED",
    },
    select: {
      processedFilePath: true,
      originalFilename: true,
    },
  });

  if (!document?.processedFilePath) {
    return { status: "not_found" };
  }

  const blob = await downloadProcessedPdf(document.processedFilePath);

  return {
    status: "success",
    blob,
    filename: document.originalFilename,
  };
}
