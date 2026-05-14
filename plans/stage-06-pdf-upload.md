# Stage 06: PDF Upload

## Status

- State: `Done`
- Phase: `Phase 2 - Dashboard and Intake`
- Owner: `Codex`

## Core focus

Allow authenticated users to upload valid PDFs only, persist the original file in Supabase Storage, and create a draft document record without exposing raw storage URLs.

## Definition of done

- `/dashboard/documents/new` exists
- client-side PDF validation exists
- server-side PDF validation exists
- file size limit is enforced
- original PDF uploads to the configured storage bucket
- draft document record is created
- raw storage URLs are not exposed in the UI or QR flow

## Deliverables

- upload page
- upload schema
- storage service
- document create action

## Implementation Prompt

You are implementing Stage 06 only.

Goals:

- Build `/dashboard/documents/new`.
- Accept PDF only.
- Reject all non-PDF uploads both client-side and server-side.
- Enforce the configured max size.
- Upload the original PDF to Supabase Storage.
- Create a `Document` record with draft status and the original file path.
- Keep storage private where possible and never treat bucket URLs as public share links.

Constraints:

- No QR processing yet.
- No final processed PDF yet.
- Do not expose Supabase raw URLs in the browser.
- Keep file handling server-owned wherever possible.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Added /dashboard/documents/new with client PDF checks, server Zod validation, PDF signature validation, bounded Server Action body size, private Supabase Storage upload, draft Document creation, upload audit logging, and no raw storage URL exposure.`
- Blockers: `None.`
- Follow-ups: `Stage 07 should add safe PDF preview for uploaded draft documents and route users from the upload success state into that preview flow.`
