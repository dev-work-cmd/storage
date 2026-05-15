# Manual PDF Fidelity Checklist

Use this checklist after any change that touches QR detection, QR replacement, QR insertion, preview rendering, or processed-file delivery.

## Preparation

1. Start the app with production-like env values.
2. Use a sample PDF with:
   - body text near the QR area
   - a page without a QR code
   - at least one multi-page document
3. Keep both the original file and the processed file available for side-by-side review.

## Upload and Validation

1. Upload a valid `.pdf` under the configured size limit and confirm a draft is created.
2. Attempt to upload:
   - a non-PDF file
   - a `.pdf` extension with non-PDF contents
   - an oversized PDF
3. Confirm each invalid upload is rejected with a safe user-facing error.

## QR Detection and Manual Selection

1. Open the draft preview and run automatic QR detection on a page with a QR code.
2. Confirm the detected rectangle visually covers the original QR area.
3. Run detection on a page without a QR code and confirm the failure state is clear and safe.
4. Switch to manual selection and adjust the rectangle.
5. Save the manual bounds and refresh the page to confirm the saved rectangle persists.

## QR Insertion Workflow

1. Upload a PDF through `/dashboard/documents/new/insert-qr` and confirm the success link opens `/dashboard/documents/[publicId]/insert-qr`.
2. Open an existing draft from the replacement flow, switch it into insertion mode, and confirm the dedicated page loads after activation.
3. On the insertion page, confirm:
   - automatic QR detection controls are hidden
   - the manual rectangle selector appears immediately
   - saved bounds persist after refresh
4. Save QR behavior settings, download the QR PNG, and confirm the file opens as a PNG image.
5. Process the insertion workflow and confirm the processed PDF download remains app-mediated.

## PDF Replacement Fidelity

1. Process the document and open the processed PDF in the dashboard preview.
2. Compare original vs processed PDF page by page.
3. Confirm only the QR area changed.
4. Confirm:
   - page count is unchanged
   - page order is unchanged
   - margins and layout are unchanged
   - non-QR text remains visually identical
   - images outside the QR area remain visually identical
5. Zoom to at least 200% around the QR area and confirm the replacement does not spill outside the selected rectangle.

## PDF Insertion Fidelity

1. Compare the original and inserted PDFs page by page.
2. Confirm the new QR appears only inside the saved insertion rectangle.
3. Confirm no white-out or erasure was added outside the QR image itself.
4. Confirm page count, layout, text, and non-QR graphics remain visually unchanged.

## Public Access Rules

1. Verify `VERIFY` mode shows the verification page without auto-opening the file.
2. Verify `OPEN` mode streams inline only when access is allowed.
3. Verify `DOWNLOAD` mode returns an attachment download only when access is allowed.
4. Test each denial path:
   - revoked document
   - disabled document
   - expired document
   - max access count reached
   - invalid PIN
5. Confirm denied access never exposes a storage URL.

## Protected Route Checks

1. Confirm `/dashboard` redirects to `/login` when signed out.
2. Confirm `/api/dashboard/...` returns `401` when signed out.
3. Confirm `/verify/...` and `/api/documents/[publicId]/file` remain publicly reachable but still enforce document policy.
