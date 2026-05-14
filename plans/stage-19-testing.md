# Stage 19: Testing

## Status

- State: `Not started`
- Phase: `Phase 6 - Security, Audit, and Quality`
- Owner: `Unassigned`

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

- Start date:
- Finish date:
- Notes:
- Blockers:
- Follow-ups:
