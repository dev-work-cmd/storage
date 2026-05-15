# Stage 19: Testing

## Status

- State: `Done`
- Phase: `Phase 6 - Security, Audit, and Quality`
- Owner: `Codex`

## Core focus

Verify the platform behavior, especially the QR replacement guarantees and access-policy enforcement.

## Definition of done

- critical flows have automated coverage where practical
- manual verification checklist exists for PDF integrity-sensitive steps
- access-rule edge cases are tested
- dashboard protection is tested

## Deliverables

- test plan
- automated tests
- manual verification checklist for PDF replacement fidelity

## Implementation Prompt

You are implementing Stage 19 only.

Goals:

- Test:
  - upload valid PDF
  - reject non-PDF
  - QR auto-detection
  - manual QR selection
  - coordinate accuracy
  - only QR area changes
  - processed PDF visual comparison
  - open mode
  - download mode
  - expired document
  - access limit reached
  - revoked document
  - PIN-protected access
  - unauthenticated dashboard blocked
- Choose a testing strategy that fits this repo and can run in CI.
- Separate unit, integration, and manual PDF-fidelity checks where useful.

Constraints:

- PDF integrity assertions must focus on proving the rest of the document remains unchanged from a user-visible perspective.
- Avoid brittle tests that depend on unstable pixel output unless clearly justified.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Added a Vitest-based CI-friendly test runner, environment setup for server-side modules, focused unit coverage for PDF upload validation, QR coordinate validation/conversion, secure PDF response headers, short-lived file access grants, public document access policy decisions, and proxy-based dashboard protection. Added a manual PDF fidelity checklist to verify that only the QR area changes in processed output and that public access rules behave correctly.`
- Blockers: `This stage does not include browser E2E coverage or database-backed integration fixtures yet. Public access policy tests use mocked Prisma/argon2 boundaries rather than a live database.`
- Follow-ups: `A later quality pass can add browser-driven E2E flows for upload, preview, manual selection, and verification screens, plus seeded integration tests for Prisma-backed access-policy updates.`
