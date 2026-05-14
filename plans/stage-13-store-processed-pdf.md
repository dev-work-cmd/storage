# Stage 13: Store Processed PDF

## Status

- State: `Done`
- Phase: `Phase 4 - PDF Mutation and Storage`
- Owner: `Codex`

## Core focus

Persist the processed PDF, finalize the document record, and expose the owner-facing success state and management entry point.

## Definition of done

- processed PDF uploads to the processed bucket
- document record is updated with file path, status, coordinates, QR mode, target URL, and access settings
- owner can preview or download the processed result
- owner can copy the QR URL

## Deliverables

- processed upload flow
- document finalization action
- success or detail page for the processed document

## Implementation Prompt

You are implementing Stage 13 only.

Goals:

- Upload the processed PDF to Supabase Storage.
- Update the document record with:
  - processed file path
  - processed status
  - QR target URL
  - QR mode
  - access settings
  - coordinates
- Provide an owner-facing success or detail screen with:
  - processed PDF preview
  - processed PDF download
  - copy QR URL
  - access settings summary

Constraints:

- Keep processed file access server-mediated.
- Do not expose raw storage paths.
- Leave public verification behavior to later stages.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Implemented end-to-end document processing pipeline: downloads original from Supabase, generates QR PNG via Stage 11, replaces QR area via Stage 12, uploads processed PDF to processed bucket, and finalizes document record as PROCESSED. Added processed storage operations to supabase-storage.ts. Created "Process Document" button with double-click confirmation. Server action validates DRAFT status and all prerequisites. Pipeline is idempotent-guarded (only DRAFT documents).`
- Deliverables:
  - `server/services/pdf/process-document.ts`: Full orchestration pipeline with prerequisite checks
  - `server/services/storage/supabase-storage.ts`: Added createProcessedPdfStoragePath, uploadProcessedPdf, downloadProcessedPdf
  - `features/documents/actions/process-document-action.ts`: Server action boundary
  - `features/documents/components/process-document-button.tsx`: Client component with confirmation flow
- Follow-ups: `Stages 14-15 will build the public verification route and secure file streaming. Stage 16 adds document management (revoke, delete, download). Stage 17 adds audit logging for processing events.`
