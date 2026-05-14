# Stage 16: Document Management

## Status

- State: `Done`
- Phase: `Phase 5 - Public Delivery and Management`
- Owner: `Codex`

## Core focus

Give owners full lifecycle control over stored documents and visibility into access outcomes.

## Definition of done

- owner can view all documents
- status is visible
- access settings can be updated
- document can be revoked
- document can be deleted
- processed PDF can be regenerated when appropriate
- counters are visible

## Deliverables

- document list page
- document detail or management page
- owner actions for revoke, delete, update settings, and regenerate

## Implementation Prompt

You are implementing Stage 16 only.

Goals:

- Build owner document management features:
  - see all documents
  - view status
  - update access settings
  - revoke document
  - delete document
  - regenerate processed PDF if needed
  - see scan, open, download, success, and failure counts
- Make destructive actions explicit and auditable.

Constraints:

- Keep all management routes protected.
- Avoid accidental public exposure of document metadata beyond what stage 14 intentionally shows.
- Ensure revocation immediately affects public access checks.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Added protected /dashboard/documents list, owner document lifecycle/counter summaries, revoke/restore, enable/disable, soft delete, regenerate actions, audit writes for destructive controls, dashboard navigation link, and protected detail management controls.`
- Blockers: `None.`
- Follow-ups: `Stage 17 should expose audit log history and improve event visibility beyond the management summary counters.`
