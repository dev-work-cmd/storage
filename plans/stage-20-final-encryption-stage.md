# Stage 20: Final Encryption Stage

## Status

- State: `Not started`
- Phase: `Phase 7 - Final Encryption`
- Owner: `Unassigned`

## Core focus

Add application-level encryption for stored PDFs only after the non-encrypted platform works correctly end to end.

## Definition of done

- original and processed PDFs are encrypted before storage
- decryption happens only temporarily in memory after access approval
- encryption metadata is stored safely
- privacy wording is updated only after implementation is complete

## Deliverables

- encryption service
- envelope key management flow
- storage integration changes
- schema extension for encrypted file metadata

## Implementation Prompt

You are implementing Stage 20 only.

Goals:

- Add application-layer encryption using AES-256-GCM.
- Encrypt files before upload to storage.
- Decrypt only temporarily in memory after access policy checks pass.
- Extend the schema with fields such as:
  - encrypted file path
  - encryption IV
  - encryption tag
  - encrypted data key
  - encryption enabled flag
- Use envelope encryption:
  - random per-document data key
  - master key from env or KMS
  - encrypted data key stored in the database
- Update privacy wording only after this stage is working.

Constraints:

- This stage must remain last.
- Do not backport encryption claims into earlier stages.
- Preserve the same access-control behavior while changing only storage confidentiality mechanics.

## Tracking

- Start date:
- Finish date:
- Notes:
- Blockers:
- Follow-ups:
