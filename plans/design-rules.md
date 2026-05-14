# Design Rules

This document keeps the app visually consistent and aligned with a minimal, premium, `shadcn/ui`-leaning product direction.

## Design intent

- Minimal, premium, quiet, and precise.
- Utility over decoration.
- Strong spacing, typography, and contrast.
- No generic startup gradients or glossy dashboard clutter.
- Every screen should feel deliberate, not auto-generated.

## Core visual style

- Base palette: neutral-first.
- Primary surfaces: white, near-white, charcoal, black, muted gray.
- Accent color: one restrained accent only when it carries meaning.
- Borders: subtle, crisp, and used intentionally.
- Shadows: light and rare.
- Radius: consistent and moderate.
- Motion: understated and fast.

## `shadcn/ui` usage rules

- Use `shadcn/ui` primitives as the base UI language.
- Extend styles through shared wrappers or class variants, not one-off overrides everywhere.
- If a `shadcn/ui` component is reused with custom variants, centralize that variant logic.
- Do not mix multiple competing design languages in the same app.

## Mobile-first layout rules

- Design for phone widths first.
- Stack by default.
- Enhance for tablet and desktop after the small-screen version works.
- Avoid horizontal scroll except where unavoidable for document preview tools.
- Any action bar or form should remain usable with thumb-sized targets.

## Spacing rules

- Prefer spacious layouts over cramped density.
- Use a predictable spacing scale.
- Default section rhythm should feel calm and editorial, not cramped admin boilerplate.
- Align cards, labels, controls, and data rows consistently.

## Typography rules

- Keep the type system small.
- Use one primary UI type style for body, one for headings, and one for metadata or labels.
- Headings should be confident but not oversized.
- Labels and helper text should remain readable on mobile.
- Avoid random font-size jumps between sections.

## Color rules

- Use color semantically.
- Do not use bright colors unless they communicate state.
- Success, warning, and destructive colors should be muted but clear.
- Status colors must remain readable in both light and dark text contexts if used.

## Surface rules

- Prefer flat surfaces with disciplined borders.
- Use cards only when they clarify grouping.
- Do not wrap everything in cards.
- Let whitespace do part of the structuring work.

## Form design rules

- Labels are always visible.
- Required fields should be obvious without visual noise.
- Validation errors should be specific and placed near the relevant field.
- Use clear input grouping and section titles for longer workflows.
- Legal confirmations and sensitive actions must be visually separated from ordinary form inputs.

## Dashboard rules

- The dashboard should feel operational, not decorative.
- Summary metrics should be scan-friendly.
- Recent items and tables should prioritize readability and action clarity.
- Important actions should be easy to reach on mobile and desktop.

## PDF workflow design rules

- Preview tools must emphasize precision.
- QR selection overlays must have strong contrast against the PDF preview.
- Coordinate-sensitive controls must be easy to understand.
- Zoom, page navigation, and confirmation actions must stay stable across screen sizes.

## Interaction rules

- Hover is an enhancement, not a dependency.
- Keyboard access must work for all primary controls.
- Focus states must always be visible.
- Loading states should be calm and informative.
- Destructive actions require clear confirmation.

## Empty, loading, and error states

- Empty states should explain the next action.
- Loading states should preserve layout where possible.
- Error states should be brief, useful, and non-technical.
- Avoid dead-end screens.

## Consistency rules

- Reuse the same page shell, section header pattern, button hierarchy, and form rhythm across the app.
- One concept should have one visual treatment.
- Do not create slightly different versions of the same component in multiple places.

## Component styling rules

- Shared components should expose a small variant API.
- Avoid large conditional class blocks in page files.
- If styles become hard to reason about, extract a wrapper component or utility.

## Premium minimal checklist

Before approving a screen, confirm:

- it works well on mobile first
- spacing is consistent
- typography is restrained
- accent color use is minimal and meaningful
- there is no unnecessary decoration
- controls look like part of one system
- the screen feels intentional, not template-like
