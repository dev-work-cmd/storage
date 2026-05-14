# Stage 12: PDF QR Replacement

## Status

- State: `Done`
- Phase: `Phase 4 - PDF Mutation and Storage`
- Owner: `Codex`

## Core focus

Replace only the selected QR rectangle inside the original PDF by overlaying a white rectangle and the new QR image with `pdf-lib`.

## Definition of done

- replacement service exists
- only the selected QR area is altered
- output keeps the original PDF structure and visible content outside the QR bounds
- replacement works from stored coordinates and generated QR PNG data

## Deliverables

- `server/services/pdf/replace-qr.ts` or equivalent in the chosen repo structure
- typed replacement function
- processing tests or manual verification notes

## Implementation Prompt

You are implementing Stage 12 only.

Goals:

- Create a `replaceQrInPdf` service using `pdf-lib`.
- Inputs:
  - original PDF buffer
  - QR PNG buffer
  - page number
  - x
  - y
  - width
  - height
- Steps:
  - load original PDF
  - select target page
  - draw a white rectangle over the old QR area
  - embed the QR PNG
  - draw it in the same rectangle
  - save the PDF

Absolute constraints:

- Do not re-render full pages into images for final output.
- Do not rebuild the whole PDF from scratch.
- Do not modify text, fonts, metadata, layout, or other images beyond the QR area overlay.
- Preserve page size and non-QR visual content.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Implemented replaceQrInPdf service using pdf-lib. Overlays white rectangle to erase old QR area, embeds new QR PNG, and draws it in the same rectangle. Full input validation: checks buffer types, finite coordinates, positive dimensions, page existence, and bounds within page dimensions. Preserves original page size, fonts, metadata, and non-QR content via pdf-lib's native PDF manipulation (no image re-rendering). Uses PDF-space coordinates (bottom-left origin). TypeScript and ESLint pass.`
- Deliverables:
  - `server/services/pdf/replace-qr.ts`: Core replacement service with QrReplacementError class and full validation
  - `server/services/pdf/index.ts`: PDF service barrel exports (replacement + upload validation)
- Follow-ups: `Stage 13 will use this service to process the document end-to-end: load original from storage, generate QR PNG via Stage 11's service, call replaceQrInPdf, and store the result.`
