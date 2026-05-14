-- Owns additive workflow classification for document QR processing.
-- Keeps replacement and insertion flows explicit without changing access policy storage.
-- Must default existing rows to replacement so current behavior stays unchanged.
CREATE TYPE "DocumentWorkflowType" AS ENUM (
  'REPLACE_EXISTING_QR',
  'INSERT_NEW_QR'
);

ALTER TABLE "Document"
ADD COLUMN "workflowType" "DocumentWorkflowType" NOT NULL DEFAULT 'REPLACE_EXISTING_QR';
