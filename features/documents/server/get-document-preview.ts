// Owns owner-scoped document preview lookups for dashboard routes.
// Returns only safe metadata and app-controlled preview URLs for client rendering.
// Must not expose private Supabase Storage paths or raw SDK responses.
import "server-only";

import { requireCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

export type DocumentPreview = {
  publicId: string;
  title: string;
  originalFilename: string;
  status: string;
  workflowType: "REPLACE_EXISTING_QR" | "INSERT_NEW_QR" | null;
  createdAt: Date;
  fileUrl: string;
  originalFileUrl: string;
  processedFileUrl: string | null;
};

export async function getDocumentPreview(
  publicId: string,
): Promise<DocumentPreview | null> {
  const session = await requireCurrentSession();

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
      publicId: true,
      title: true,
      originalFilename: true,
      status: true,
      workflowType: true,
      createdAt: true,
      processedFilePath: true,
    },
  });

  if (!document) {
    return null;
  }

  const originalFileUrl = `/api/dashboard/documents/${document.publicId}/original`;
  const processedFileUrl =
    document.processedFilePath
      ? `/api/dashboard/documents/${document.publicId}/processed`
      : null;

  return {
    ...document,
    status: document.status,
    fileUrl: originalFileUrl,
    originalFileUrl,
    processedFileUrl,
  };
}
