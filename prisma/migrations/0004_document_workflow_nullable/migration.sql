-- Owns the transition from upload-time workflow selection to document-first editing.
-- Allows documents to exist as neutral stored drafts before the owner chooses replace or insert.
ALTER TABLE "Document"
ALTER COLUMN "workflowType" DROP NOT NULL,
ALTER COLUMN "workflowType" DROP DEFAULT;
