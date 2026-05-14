// Owns authorization for private original PDF preview downloads.
// Verifies document ownership before storage access and returns only stream-safe metadata.
// Must not be used for public processed-file delivery; later stages own that flow.
import "server-only";

import { getCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { downloadOriginalPdf } from "@/server/services/storage/supabase-storage";

export type OwnedOriginalPdfResult =
  | { status: "unauthorized" }
  | { status: "not_found" }
  | {
      status: "success";
      blob: Blob;
      filename: string;
    };

export async function getOwnedOriginalPdf(
  publicId: string,
): Promise<OwnedOriginalPdfResult> {
  const session = await getCurrentSession();

  if (!session) {
    return { status: "unauthorized" };
  }

  const document = await prisma.document.findFirst({
    where: {
      publicId,
      ownerId: session.user.id,
      deletedAt: null,
      originalFilePath: {
        not: null,
      },
    },
    select: {
      originalFilePath: true,
      originalFilename: true,
    },
  });

  if (!document?.originalFilePath) {
    return { status: "not_found" };
  }

  const blob = await downloadOriginalPdf(document.originalFilePath);

  return {
    status: "success",
    blob,
    filename: document.originalFilename,
  };
}
