# Stage 17: Audit Logs

## Status

- State: `Done`
- Phase: `Phase 6 - Security, Audit, and Quality`
- Owner: `Codex`

## Core focus

Capture the important authentication, document, and public-access events needed for accountability and incident review.

## Definition of done

- audit logging is implemented consistently
- key auth events are logged
- key document lifecycle events are logged
- key public-access allow and deny events are logged

## Deliverables

- audit log service
- reusable logging helper
- event coverage for required flows

## Implementation Prompt

You are implementing Stage 17 only.

Goals:

- Log at minimum:
  - login success
  - login failure
  - document upload
  - QR detection success
  - QR detection failure
  - manual QR selection
  - document processed
  - document opened
  - document downloaded
  - access denied
  - document revoked
  - document deleted
- Include timestamp, actor when known, and useful request metadata where safely available.

Constraints:

- Do not log secrets, PINs, passwords, raw passkey material, or private document content.
- Keep audit helpers server-only.

## Tracking

- Start date: 2026-05-14
- Finish date: 2026-05-14
- Notes: Added a server-only audit helper, QR-specific audit events, document processing audit writes, and an owner-scoped `/dashboard/audit` review page. Existing auth, upload, public access, revoke, and delete events remain covered.
- Blockers: Local `.env.local` is missing required runtime variables such as `DATABASE_URL`; Prisma validation/generation and build verification were run with safe dummy values where no database connection was required.
- Follow-ups: Stage 18 should harden metadata retention and consider pagination/export limits for longer audit histories.
