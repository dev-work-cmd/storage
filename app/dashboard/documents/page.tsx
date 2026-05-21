// Owns the protected owner document management index.
// Lists all non-deleted documents with lifecycle status and access counters.
// Must never expose raw storage paths or public-only metadata beyond owner scope.
import type { Metadata } from "next";

import { DocumentList } from "@/features/documents/components/document-list";
import { getOwnerDocuments } from "@/features/documents/server/get-owner-documents";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Documents",
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.q)
    ? params.q[0] ?? ""
    : params.q ?? "";
  const documents = await getOwnerDocuments();

  return (
    <DocumentList
      key={initialQuery}
      documents={documents}
      initialQuery={initialQuery}
    />
  );
}
