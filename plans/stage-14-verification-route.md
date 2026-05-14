# Stage 14: Verification Route

## Status

- State: `Done`
- Phase: `Phase 5 - Public Delivery and Management`
- Owner: `Codex`

## Core focus

Build the public verification route that interprets QR mode and access policy before any document stream is released.

## Definition of done

- `/verify/[publicId]` exists
- default verification page exists
- `mode=open` and `mode=download` are handled
- access rules are enforced before any file stream
- counters and access outcomes update correctly

## Deliverables

- public verification page
- access-check service
- route-level mode handling

## Implementation Prompt

You are implementing Stage 14 only.

Goals:

- Create `/verify/[publicId]`.
- If no mode is present:
  - show a verification page with document metadata and owner-controlled actions
- If `mode=open`:
  - check access policy
  - stream inline behavior through the secure file route
- If `mode=download`:
  - check access policy
  - stream attachment behavior through the secure file route
- Enforce:
  - existence
  - not revoked
  - not expired
  - max access count not exceeded
  - PIN validity if required
  - processed file exists
- Update counters and outcomes consistently.

Constraints:

- Verification page presence does not imply legal or official authenticity.
- Keep policy logic reusable by file streaming routes.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Added /verify/[publicId], public verification UI, reusable access-policy service, PIN form flow, policy checks for existence/enabled/revoked/expired/access limit/PIN/processed file, audit writes, and scan/access/open/download counters before redirecting to the secure file route.`
- Blockers: `None.`
- Follow-ups: `Stage 15 must implement /api/documents/[publicId]/file so authorized open/download redirects stream the processed PDF inline or as an attachment.`
