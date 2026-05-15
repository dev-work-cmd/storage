// Owns backward-compatible routing for the old insertion-only upload path.
// Redirects into the unified new-document entry so users only see one primary upload flow.
// Must not reintroduce a second competing intake screen.
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Document",
};

export default function NewInsertQrDocumentPage() {
  redirect("/dashboard/documents/new");
}
