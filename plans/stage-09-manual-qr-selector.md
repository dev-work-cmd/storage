# Stage 09: Manual QR Selector

## Status

- State: `Done`
- Phase: `Phase 3 - QR Selection and Policy`
- Owner: `Codex`

## Core focus

Provide a precise manual QR bounding-box editor when automatic detection is missing or inaccurate.

## Definition of done

- `react-rnd` selector works on the PDF preview
- owner can drag and resize the box
- owner can switch pages
- exact PDF coordinates are saved
- conversion between preview space and PDF space is reliable

## Deliverables

- selector overlay component
- coordinate mapping utilities
- save and confirm flow

## Implementation Prompt

You are implementing Stage 09 only.

Goals:

- Use `react-rnd` to let the owner define the QR area manually.
- Support:
  - drag
  - resize
  - page selection
  - confirm action
- Persist exact coordinates in PDF coordinate space.
- Handle the coordinate-system mismatch:
  - browser origin: top-left
  - PDF origin: bottom-left

Constraints:

- Keep the UX precise and debuggable.
- Surface dimensions and page number clearly enough for troubleshooting.
- Do not process the PDF yet in this stage.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Implemented full manual QR selector with react-rnd drag/resize, coordinate system conversion (viewport ↔ PDF space), mode toggle between automatic detection and manual adjustment. Loads previously detected bounds from DB as starting point (Stage 08 integration). Displays live viewport and PDF coordinate debugging. Server function saves bounds through Stage 08's persist action.`
- Deliverables:
  - `qr-manual-selector.tsx`: React component with react-rnd integration, drag/resize, live coordinate display
  - `coordinate-system.ts`: Bidirectional viewport↔PDF coordinate conversion handling browser vs PDF origin mismatch
  - `get-document-qr-bounds.ts`: Server function to load previously detected bounds for prefilling selector
  - Updated `pdf-preview-viewer.tsx`: Mode toggle, existing bounds detection, page dimension tracking
- Follow-ups: `Stage 10 (QR behavior and access settings) will add policy configuration. Stages 11-12 will use saved bounds for final PDF mutation.`
