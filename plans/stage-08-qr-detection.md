# Stage 08: QR Detection

## Status

- State: `Done`
- Phase: `Phase 3 - QR Selection and Policy`
- Owner: `Codex`

## Core focus

Automatically detect an existing QR code in preview-rendered PDF pages and translate the bounding box into accurate PDF coordinates.

## Definition of done

- QR scan pipeline exists
- detection attempts can run against rendered page canvases
- bounding box data is captured
- PDF coordinate conversion is stored
- success and failure states are visible in the UI

## Deliverables

- QR detection service
- coordinate conversion helper
- document update action for detected bounds

## Implementation Prompt

You are implementing Stage 08 only.

Goals:

- Render PDF pages to a detection-friendly canvas.
- Use `jsQR` or `zxing` to detect QR codes.
- Capture:
  - page number
  - x
  - y
  - width
  - height
- Convert browser or canvas coordinates into PDF coordinates correctly.
- If detection succeeds:
  - show the detected box
  - let the owner confirm or adjust later
- If detection fails:
  - hand off cleanly to the manual selector flow

Constraints:

- Detection rendering is allowed only for preview and analysis.
- Final PDF generation must remain vector-overlay based with `pdf-lib`.
- Coordinate accuracy matters more than UI polish in this stage.

## Tracking

- Start date: `2026-05-14`
- Update date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Added current-page QR detection with jsQR, preview overlay bounds, PDF.js viewport-to-PDF coordinate conversion, owner-scoped server action persistence, and visible success/failure states. Lint and TypeScript checks passed.`
- Improvements: `Created /server/services/qr service layer with coordinate bounds validation. Enhanced error handling: CoordinateConversionError class for precise coordinate issues, structured error responses from server functions, comprehensive bounds validation (sanity checks, dimension validation, page boundary checks). Improved detectQrOnCurrentPage with try-catch for conversion errors. Updated coordinate conversion to validate all inputs and outputs for non-finite values, zero dimensions, and boundary violations.`
- Remaining gaps: `No production/runtime test with actual Supabase PDF uploads. No rate-limiting enforcement at action level (Stage 18 concern). Manual selector UI doesn't exist yet (blocks clean UX handoff).`
- Follow-ups: `Stage 09 should reuse the stored QR bounds as the starting rectangle for manual adjustment when detection succeeds, and provide full manual selection when detection fails.`
