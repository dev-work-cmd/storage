# Stage 15: Secure File Streaming

## Status

- State: `Done`
- Phase: `Phase 5 - Public Delivery and Management`
- Owner: `Codex`

## Core focus

Serve PDFs through server-controlled routes with correct headers and no public storage URL leakage.

## Definition of done

- `/api/documents/[publicId]/file?mode=open` works
- `/api/documents/[publicId]/file?mode=download` works
- PDF streams are server-controlled
- correct content headers are applied
- storage paths remain private

## Deliverables

- file stream route handler
- storage download service
- header and filename policy

## Implementation Prompt

You are implementing Stage 15 only.

Goals:

- Build secure PDF streaming through app route handlers.
- Routes:
  - `/api/documents/[publicId]/file?mode=open`
  - `/api/documents/[publicId]/file?mode=download`
- For open:
  - `Content-Type: application/pdf`
  - `Content-Disposition: inline; filename="document.pdf"`
- For download:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="document.pdf"`
- Fetch the file server-side from storage and return the stream or buffer without exposing the underlying storage URL.

Constraints:

- Keep access control enforcement shared with stage 14.
- Do not bypass the app with signed URLs unless there is a deliberate and equivalent policy layer in front.
- Protect against missing file and unauthorized access edge cases.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Added /api/documents/[publicId]/file with mode=open/download support, shared access-policy enforcement, private Supabase processed-PDF download, inline/attachment PDF headers, safe filename policy, no storage URL exposure, and short-lived signed file grants for PIN-verified redirects.`
- Blockers: `None.`
- Follow-ups: `Stage 16 should add owner document management controls for revoke, disable, delete, and lifecycle visibility.`
