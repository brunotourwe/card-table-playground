# Decision Log

Last updated: 2026-03-01 (session 2)
Status: Active

## Goal

Capture confirmed and pending product decisions separately from feature implementation tracking.

`DEVELOPMENT_TRACKER.md` tracks delivery status.
`DEBUG_GLITCHES.md` tracks defects/regressions.

Entry format:
- `Status`
- `Date`
- `Decision`

## Decision Log

### CTP-DEC-001 Runtime scope

Status: Confirmed
Date: 2026-02-25

Decision:
- Single-user local page model (no multiplayer/shared server state for this project phase).

### CTP-DEC-002 Default table view

Status: Superseded
Date: 2026-02-25

Decision:
- Default table view is `matrix`.

Superseded by:
- `CTP-DEC-019`

### CTP-DEC-003 View persistence model

Status: Confirmed
Date: 2026-02-25

Decision:
- Preferences persist in `sessionStorage` (tab/session scoped).

### CTP-DEC-004 V1 hand scope

Status: Confirmed
Date: 2026-02-25

Decision:
- V1 hand scope includes visualization modes only.
- Manual reordering is out of scope.

### CTP-DEC-005 Hand visualization set

Status: Superseded
Date: 2026-02-25

Decision:
- Support four hand modes:
  - `fan-arch`
  - `fan-linear`
- `row-overlap`
- `row-spaced`
- Default hand mode is `fan-arch`.

Superseded by:
- `CTP-DEC-016`

### CTP-DEC-006 Arch curve controls

Status: Superseded
Date: 2026-02-25

Decision:
- Provide arch curve strength selector with options:
  - `subtle`
  - `medium`
  - `strong`

Superseded by:
- `CTP-DEC-016`

### CTP-DEC-007 Mobile fallback behavior

Status: Superseded
Date: 2026-02-25

Decision:
- On tight mobile space, `fan-arch` auto-falls back to `row-overlap`.
- Fallback decision is re-evaluated on window resize.

Superseded by:
- `CTP-DEC-016`

### CTP-DEC-008 Transition behavior

Status: Partially superseded
Date: 2026-02-25

Decision:
- Animate matrix/hand view switching.
- Animate hand-layout mode switching.

Superseded scope:
- Hand-layout mode switching no longer applies after the single hand-geometry model replaced V1 hand modes.

### CTP-DEC-009 Sorting scope

Status: Confirmed
Date: 2026-02-25

Decision:
- Sorting applies in both matrix and hand views.
- Sorting is authoritative while active (manual reorder disabled).
- Sort trigger modes to support: `auto-apply` and `manual trigger`.

### CTP-DEC-010 Sorting policy

Status: Confirmed
Date: 2026-02-25

Decision:
- Fixed multi-level sort order: `suit -> rank`.
- Rank policy options: `ace_high` and `ace_low` (default `ace_high`).
- Sort direction toggle required (`ascending` / `descending`).

### CTP-DEC-011 Suit-order profiles

Status: Confirmed
Date: 2026-02-25

Decision:
- Required suit-order profiles:
  - `fixed1`: Harten, Klaveren, Ruiten, Schoppen
  - `fixed2`: Harten, Ruiten, Klaveren, Schoppen
  - dynamic largest-suit-first profile
  - `random`
- Dynamic largest-suit-first profile prefers opposite color in the second slot.

### CTP-DEC-012 Grouping behavior

Status: Confirmed
Date: 2026-02-25

Decision:
- Grouping is optional.
- Grouping visuals should support both header labels and spacing gaps.

### CTP-DEC-013 Matrix ordering

Status: Confirmed
Date: 2026-02-25

Decision:
- Matrix order fills left-to-right.
- Matrix row-size target is fixed (not responsive) for this phase.

### CTP-DEC-014 Non-goals for this phase

Status: Confirmed
Date: 2026-02-25

Decision:
- Hidden/face-down card handling: out of scope.
- Keyboard accessibility for sort/reorder controls: deferred.
- Shareable URL/query state: out of scope.

### CTP-DEC-015 Largest-suit profile label

Status: Open
Date: 2026-02-25

Decision:
- Pending confirmation of short UI label for dynamic largest-suit-first profile.

Proposal:
- `largest-first`

### CTP-DEC-016 Hand layout model replacement

Status: Confirmed
Date: 2026-03-01

Decision:
- Replace all V1 hand layout modes with a single geometry-driven hand renderer.
- Remove overlap, curvature, arch presets, auto-angle toggle, and hand-layout mode switches from the hand UI.
- Expose exactly three hand parameters:
  - `visibilityFactor` (`0..1`)
  - `alphaDeg` (`0..10`)
  - `phiDeg` (`0..60`)

### CTP-DEC-017 Hand geometry model

Status: Confirmed
Date: 2026-03-01

Decision:
- Card anchor point is the midpoint of the card underside.
- Anchor points lie on a circle when `alphaEff > 0`, with constant arc length between consecutive cards.
- Effective angular step is:
  - `alphaEff = min(alphaDeg, phiDeg / (N - 1))`
- Radius follows from geometry:
  - `R = d / alphaEff`
  - where `d = visibilityFactor * cardWidth`
- If `alphaEff == 0`, layout falls back to a straight line with constant anchor spacing `d`.
- Card rotation is radial:
  - `rotation = theta_i`
- For even `N`, the two middle cards sit symmetrically at `±alphaEff / 2` around the vertical axis.

### CTP-DEC-018 Hand debug and diagnostics scope

Status: Confirmed
Date: 2026-03-01

Decision:
- Keep both existing debug options:
  - card bounds
  - hand curve
- The hand-curve debug overlay shows the active anchor-point arc/line only, not the full reference circle.
- Keep a URL-driven diagnostics harness for reproducing hand layout issues against fixed slider values.

### CTP-DEC-019 Default table view revision

Status: Confirmed
Date: 2026-03-01

Decision:
- Default table view is `hand`.
- `sessionStorage` persistence still applies after the first-load default.

### CTP-DEC-020 Table frame sizing model

Status: Confirmed
Date: 2026-03-01

Decision:
- Table frame (`section.table`) uses `width: fit-content` so it wraps card content.
- `min-width` equals the control section width (`min(1200px - ui-scale padding, 100vw - 24px)`).
- `max-width` is `calc(100vw - 24px)`.
- Frame is always centered relative to the page via `display: flex; justify-content: center` on `.table-container`.

### CTP-DEC-021 VF auto-clamp for viewport overflow

Status: Confirmed
Date: 2026-03-01

Decision:
- Effective `visibilityFactor` is automatically reduced when computed hand width exceeds the table frame's CSS `max-width`.
- Clamping uses the exact linear model `contentWidth = A × vf + B`, where `B = buildLayouts(0)` bounding box width (not `cardWidth`, which underestimates in arc mode due to rotated card extents).
- Effective VF restores toward the user-set value as the hand shrinks.
- The clamp reference is the table's resolved CSS `max-width` via `getComputedStyle` so the frame can expand to its full width before clamping applies.

### CTP-DEC-022 Body minimum page width

Status: Confirmed
Date: 2026-03-01

Decision:
- `body { min-width: 640px }` prevents the page from collapsing below the 4-column control grid breakpoint.
- Narrower viewports show a horizontal scrollbar instead of collapsing the layout.

### CTP-DEC-023 Card height slider minimum

Status: Confirmed
Date: 2026-03-01

Decision:
- Card height slider minimum is 90 px (raised from 50 px).
- Cards below 90 px are too small for the SVG artwork to remain legible.
