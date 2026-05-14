# QR Insertion Feature Breakdown

This plan turns the QR insertion master prompt into a bounded additive implementation track without disturbing the original 20-stage roadmap.

## Purpose

Add a separate owner-only workflow for documents that do not already contain a QR code, while keeping the current QR replacement workflow unchanged.

## Scope boundary

- This is a feature extension, not a rewrite of the existing QR replacement system.
- Existing routes, actions, and processing logic for QR replacement must continue to work as-is unless a shared abstraction is clearly safer and cleaner.
- Any shared refactor must preserve current behavior first.

## Recommended implementation slices

### Slice 1: Architecture and data fit

Goals:

- inspect the current `Document` model
- decide whether a workflow discriminator is needed
- identify which existing QR fields can be reused unchanged
- define how QR PNG download will work without public exposure

Done when:

- schema decision is explicit
- route shape is chosen
- isolation from the replacement workflow is documented

### Slice 2: New owner route and page shell

Goals:

- add a dedicated owner page for QR insertion
- compose it inside the existing dashboard shell
- keep route file thin
- make the UI clearly distinct from QR replacement

Suggested route:

- `/dashboard/documents/[publicId]/insert-qr`

Done when:

- owner can enter a separate insertion page
- unauthorized access remains blocked
- the replacement page and insertion page are clearly separate

### Slice 3: Manual placement workflow

Goals:

- reuse the existing preview and manual rectangle selection model
- allow the owner to select where the new QR will be inserted
- persist exact PDF-space coordinates

Done when:

- the owner can select, adjust, and save a rectangle for insertion
- coordinates remain stable across reloads

### Slice 4: QR settings and QR PNG generation

Goals:

- reuse current QR mode and access settings
- generate a new QR image using the existing target URL logic
- provide owner-only QR PNG download

Done when:

- the QR target URL matches the existing public access model
- the owner can download only the generated QR image

### Slice 5: PDF insertion service

Goals:

- add a dedicated PDF insertion service, for example `insertQrIntoPdf(...)`
- insert the QR into the selected rectangle
- preserve page size and non-QR content

Done when:

- output PDF contains the new QR at the saved coordinates
- the rest of the visible PDF remains unchanged

### Slice 6: Processing and private storage

Goals:

- process the insertion workflow end-to-end
- store the processed PDF in private storage
- update the document record cleanly

Done when:

- processed PDF is persisted privately
- owner can preview and download it through app-controlled routes

### Slice 7: Management integration

Goals:

- expose insertion-produced documents in management views
- prevent confusion between replacement and insertion workflows
- keep revoke, disable, delete, regenerate, and counters coherent

Done when:

- owner management screens clearly represent inserted-QR documents
- current replacement-management flow still behaves the same

### Slice 8: Verification, security, and tests

Goals:

- ensure inserted-QR documents use the same public verification and secure file rules
- add tests for route protection, processing behavior, and QR PNG download
- add manual PDF fidelity checks

Done when:

- inserted-QR documents resolve through existing verification logic
- no storage URL leaks occur
- tests cover the additive workflow without weakening current coverage

## Implementation notes

- Prefer additive modules over condition-heavy branching inside current replacement modules.
- Reuse existing services where behavior is identical.
- Introduce a new low-level PDF service only where insertion semantics differ materially from replacement semantics.
- If a shared primitive is extracted, keep the API explicit enough that replacement and insertion remain distinguishable.

## Suggested verification checklist

1. Existing QR replacement flow still works unchanged.
2. Owner can open the new insertion page from a protected area.
3. Owner can select exact insertion coordinates manually.
4. Owner can save QR settings and generate a QR.
5. Owner can download the QR PNG alone.
6. Owner can process and preview the modified PDF.
7. Owner can download the processed PDF.
8. Public scan resolves through the same `/verify/*` logic already used today.
9. No public or signed raw storage URL is exposed.

## Deliverables

- `plans/master-build-prompt-qr-insertion.md`
- new route and feature modules for QR insertion
- tests and manual verification notes for the additive workflow
