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

export default async function DocumentsPage() {
  const documents = await getOwnerDocuments();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Documents
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
          Manage document lifecycle
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Review every PDF record, public access status, and scan outcome from
          one protected owner-only view.
        </p>
      </div>
      <DocumentList documents={documents} />
    </div>
  );
}
