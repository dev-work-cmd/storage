# Stage 10: QR Behavior and Access Settings

## Status

- State: `Done`
- Phase: `Phase 3 - QR Selection and Policy`
- Owner: `Codex`

## Core focus

Capture the owner’s intended QR behavior and access policy before the document is processed.

## Definition of done

- owner can choose verify, open, or download mode
- owner can configure expiration, max access count, PIN requirement, and revoke-ready status
- legal authority confirmation is required before processing

## Deliverables

- access settings form
- QR mode selector
- server validation schema
- document draft update logic

## Implementation Prompt

You are implementing Stage 10 only.

Goals:

- Before processing, collect:
  - QR behavior: verify, open, or download
  - access mode
  - expiration
  - max access count
  - PIN requirement
  - revoked or disabled state
- Add a required confirmation checkbox stating the owner has legal authority and will not use the platform for fraud, forgery, falsification, impersonation, or unlawful purposes.
- Persist settings safely on the draft document.

Constraints:

- Validate all inputs server-side.
- Do not yet expose the public verification route behavior.
- Keep terminology aligned with later enforcement logic.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Implemented full QR behavior and access settings form with: QR mode selector (verify/open/download), optional expiration date, optional max access count, PIN requirement with argon2 hashing, enable/disable toggle, and mandatory legal authority confirmation. All inputs validated server-side with Zod. Settings persisted via owner-scoped server function to DRAFT documents only. Integrated into document detail page as collapsible card.`
- Deliverables:
  - `qr-settings-schema.ts`: Zod validation with cross-field checks (PIN required when enabled, expiration must be future, legal confirmation mandatory)
  - `update-qr-settings.ts`: Server function that hashes PIN with argon2 and persists to DRAFT documents
  - `qr-settings-actions.ts`: Server action with proper error handling and path revalidation
  - `qr-settings-form.tsx`: Full form with radio cards for QR mode, datetime input for expiration, number input for max access, checkbox for PIN with conditional input, enable/disable toggle buttons, and required legal authority confirmation
  - `qr-settings-card.tsx`: Collapsible card wrapper that loads prefill data and shows saved state
  - `get-document-qr-settings.ts`: Server function to load existing settings for form prefill
  - Updated document detail page to include settings card below preview
- Follow-ups: `Stage 11 (QR generation) will need the qrTargetUrl field. Stage 14 (verification route) will enforce these policy settings. Stages 17-18 will add audit logging for settings changes.`
