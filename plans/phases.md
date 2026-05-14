# Phase Map

This roadmap groups the 20 requested stages into delivery phases so the work can be tracked at two levels: phase and stage.

## Phase 1: Foundation and Trust

- Stage 01: Base project setup
- Stage 02: Database and Prisma
- Stage 03: Auth
- Stage 04: Public legal pages

Core outcome: a secure app foundation with environment validation, persistence, auth gating, and legally clear public pages.

## Phase 2: Dashboard and Intake

- Stage 05: Dashboard shell
- Stage 06: PDF upload
- Stage 07: PDF preview

Core outcome: authenticated users can enter the dashboard, upload valid PDFs, and preview files safely.

## Phase 3: QR Selection and Policy

- Stage 08: QR detection
- Stage 09: Manual QR selector
- Stage 10: QR behavior and access settings

Core outcome: the owner can identify the QR area accurately and define how the processed document should behave.

## Phase 4: PDF Mutation and Storage

- Stage 11: QR generation
- Stage 12: PDF QR replacement
- Stage 13: Store processed PDF

Core outcome: a new QR is generated and overlaid into the original PDF without altering the rest of the document, then stored and linked to the document record.

## Phase 5: Public Delivery and Management

- Stage 14: Verification route
- Stage 15: Secure file streaming
- Stage 16: Document management

Core outcome: QR scans resolve through app-controlled access rules, and owners can manage lifecycle and visibility of processed documents.

## Phase 6: Security, Audit, and Quality

- Stage 17: Audit logs
- Stage 18: Security hardening
- Stage 19: Testing

Core outcome: the platform becomes operationally defendable, observable, and verifiable.

## Phase 7: Final Encryption

- Stage 20: Final encryption stage

Core outcome: encrypted-at-rest document handling is added only after the non-encrypted workflow is correct and stable.

## Dependency notes

- Stages 01 to 04 unblock all later work.
- Stages 08 to 10 depend on the upload and preview flow from stages 06 and 07.
- Stage 12 depends on confirmed coordinates from stages 08 or 09 and the target URL from stage 11.
- Stages 14 and 15 should be implemented together conceptually, but stage 14 owns access decisions and stage 15 owns the actual PDF stream path.
- Stage 20 must remain last. Do not merge encryption assumptions into earlier privacy or storage logic.
