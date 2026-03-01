# Development Tracker

Last updated: 2026-03-01 (session 2)
Source: matrix/hand roadmap and current implementation status.

## Tracking Model

Use this file as the primary feature tracker.

Decision records live in `DECISION_LOG.md`.
Defects/regressions live in `DEBUG_GLITCHES.md`.

Legend:
- `[x]` Done
- `[ ]` Planned / Open

Formatting rule:
- Keep description on the checklist line and keep metadata on a compact `Meta:` line below it.

Meta fields on each item:
- `A` (`AddedOn`): date this tracker item was added
- `U` (`UpdatedOn`): last tracker metadata update date
- `T` (`Target`): intended delivery lane (`POC`)
- `V` (`Version`, optional): release tag when available

## WS-01 Baseline Playground

### 01.1 Core Draw Flow
- [x] Draw random cards from a standard 52-card deck based on user count input (`1-52`).
  Meta: ID:CTP-WS01-01-1-01 | A:2026-02-25 | U:2026-02-25 | T:POC
- [x] Validate count input and show status message for invalid values.
  Meta: ID:CTP-WS01-01-1-02 | A:2026-02-25 | U:2026-02-25 | T:POC
- [x] Redraw current card set when render mode changes (without generating a new draw).
  Meta: ID:CTP-WS01-01-1-03 | A:2026-02-25 | U:2026-02-25 | T:POC

### 01.2 Card Rendering Modes
- [x] Unicode card rendering mode (text ranks/suit symbols).
  Meta: ID:CTP-WS01-01-2-01 | A:2026-02-25 | U:2026-02-25 | T:POC
- [x] SVG card image rendering mode (asset-backed).
  Meta: ID:CTP-WS01-01-2-02 | A:2026-02-25 | U:2026-02-25 | T:POC

## WS-02 Matrix and Hand Views

### 02.1 View Mode Foundation
- [x] Add table view selector with `matrix` and `hand` options.
  Meta: ID:CTP-WS02-02-1-01 | A:2026-02-25 | U:2026-02-25 | T:POC
- [x] Default view initializes to `hand` on first load.
  Meta: ID:CTP-WS02-02-1-02 | A:2026-02-25 | U:2026-03-01 | T:POC
- [x] Persist selected view mode in `sessionStorage`.
  Meta: ID:CTP-WS02-02-1-03 | A:2026-02-25 | U:2026-02-25 | T:POC
- [x] Animate transitions between matrix and hand views.
  Meta: ID:CTP-WS02-02-1-04 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Implement fixed row-size matrix renderer with deterministic left-to-right fill.
  Meta: ID:CTP-WS02-02-1-05 | A:2026-02-25 | U:2026-02-25 | T:POC

### 02.2 Hand Layout Geometry (Current)
- [x] Replace discrete hand-layout modes with a single geometry-driven hand renderer.
  Meta: ID:CTP-WS02-02-2-01 | A:2026-02-25 | U:2026-03-01 | T:POC
- [x] Add `visibilityFactor` control (`0..1`) to determine visible card width contribution.
  Meta: ID:CTP-WS02-02-2-02 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Add `alphaDeg` control (`0..15`) as desired per-card angular step.
  Meta: ID:CTP-WS02-02-2-03 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Add `phiDeg` control (`0..90`) as maximum allowed total fan angle.
  Meta: ID:CTP-WS02-02-2-04 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Use arc-length-consistent anchor placement on a circle, with automatic straight-line fallback when `alphaEff == 0`.
  Meta: ID:CTP-WS02-02-2-05 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Rotate each card radially around its bottom-center anchor, including correct `±alphaEff/2` middle-card behavior for even hand sizes.
  Meta: ID:CTP-WS02-02-2-06 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Keep hand debug overlays aligned to the new geometry model.
  Meta: ID:CTP-WS02-02-2-07 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Provide a URL-driven hand-layout diagnostics harness for repeatable visual debugging.
  Meta: ID:CTP-WS02-02-2-08 | A:2026-03-01 | U:2026-03-01 | T:POC

### 02.3 UI Refinements

- [x] Compact controls layout: remove box chrome while preserving grid structure; reduce gaps and spacing.
  Meta: ID:CTP-WS02-02-3-01 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Rearrange top-grid row order: Card style col 1, Table view col 2, Debug cols 3-4; hand sliders on row below.
  Meta: ID:CTP-WS02-02-3-02 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Dynamic table frame: `fit-content` width, min-width tied to control section, max-width = `100vw - 24px`, centered.
  Meta: ID:CTP-WS02-02-3-03 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Auto-clamp effective `visibilityFactor` when hand geometry exceeds the table frame's CSS `max-width`.
  Meta: ID:CTP-WS02-02-3-04 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Unicode symbols enlarged +60% (`font-size: 3.5rem`).
  Meta: ID:CTP-WS02-02-3-05 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Auto-draw on card count spinner change (debounced 150 ms).
  Meta: ID:CTP-WS02-02-3-06 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Global Enter key triggers draw (suppressed when focus is on an input/select).
  Meta: ID:CTP-WS02-02-3-07 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Body minimum page width 640 px (page scrolls horizontally below this instead of reflowing).
  Meta: ID:CTP-WS02-02-3-08 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Card height slider minimum raised to 90 px.
  Meta: ID:CTP-WS02-02-3-09 | A:2026-03-01 | U:2026-03-01 | T:POC

### 02.4 Hand Animation

- [x] Fan animation: hand cards revealed left-to-right with staggered opacity on draw, deck switch, and matrix→hand view switch.
  Meta: ID:CTP-WS02-02-4-01 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Wireframe slider-drag mode: holding a hand-layout slider shows card outlines only (no content, no CSS transitions) for instant jank-free geometry feedback.
  Meta: ID:CTP-WS02-02-4-02 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Fan animation on slider release: exiting wireframe mode triggers fan animation at the correct final positions.
  Meta: ID:CTP-WS02-02-4-03 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Fan animation timing controls: `fan step (s/card)` slider (0.02–0.10 s, default 0.05 s) and `fan max total (s)` slider (0.2–3.0 s, default 1.0 s); effective step = min(perCard, maxTotal/(N-1)).
  Meta: ID:CTP-WS02-02-4-04 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Pointer-down on hand-layout slider interrupts any running fan animation and immediately enters wireframe mode.
  Meta: ID:CTP-WS02-02-4-05 | A:2026-03-01 | U:2026-03-01 | T:POC
- [ ] Right-to-left fan animation direction option.
  Meta: ID:CTP-WS02-02-4-06 | A:2026-03-01 | U:2026-03-01 | T:POC

## WS-03 Sorting and Grouping (Backlog)

### 03.1 Sorting Engine
- [ ] Implement sort engine with fixed priority `suit -> rank`.
  Meta: ID:CTP-WS03-03-1-01 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Implement rank policy switch (`ace_high`, `ace_low`).
  Meta: ID:CTP-WS03-03-1-02 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Implement ascending/descending sort direction toggle.
  Meta: ID:CTP-WS03-03-1-03 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Apply sorting to both matrix and hand views.
  Meta: ID:CTP-WS03-03-1-04 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Keep sorting authoritative while active (manual reorder disabled).
  Meta: ID:CTP-WS03-03-1-05 | A:2026-02-25 | U:2026-02-25 | T:POC

### 03.2 Suit-Order Profiles
- [ ] Implement suit-order profile `fixed1` (Harten, Klaveren, Ruiten, Schoppen).
  Meta: ID:CTP-WS03-03-2-01 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Implement suit-order profile `fixed2` (Harten, Ruiten, Klaveren, Schoppen).
  Meta: ID:CTP-WS03-03-2-02 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Implement suit-order profile `largest-first`.
  Meta: ID:CTP-WS03-03-2-03 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Implement suit-order profile `random`.
  Meta: ID:CTP-WS03-03-2-04 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Implement largest-first alternate-color preference for second suit slot.
  Meta: ID:CTP-WS03-03-2-05 | A:2026-02-25 | U:2026-02-25 | T:POC

### 03.3 Grouping and Trigger Modes
- [ ] Add sort trigger mode selector (`auto-apply` vs `manual trigger`).
  Meta: ID:CTP-WS03-03-3-01 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Add optional suit-group header labels.
  Meta: ID:CTP-WS03-03-3-02 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Add optional suit-group spacing gaps.
  Meta: ID:CTP-WS03-03-3-03 | A:2026-02-25 | U:2026-02-25 | T:POC

## WS-04 Interaction and Mobile (Backlog)

### 04.1 Motion Controls
- [ ] Add animation duration selector and bind duration to transitions.
  Meta: ID:CTP-WS04-04-1-01 | A:2026-02-25 | U:2026-02-25 | T:POC

### 04.2 Mobile Strategy Controls
- [ ] Add mobile strategy selector (`swipe-scroll`, `pinch-zoom`, `fixed-fit`).
  Meta: ID:CTP-WS04-04-2-01 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Implement mobile strategy auto-suggestion on resize.
  Meta: ID:CTP-WS04-04-2-02 | A:2026-02-25 | U:2026-02-25 | T:POC

## WS-05 Persistence (Backlog)

- [ ] Persist sort settings in `sessionStorage` once sorting controls are implemented.
  Meta: ID:CTP-WS05-05-1-01 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Persist grouping settings in `sessionStorage` once grouping controls are implemented.
  Meta: ID:CTP-WS05-05-1-02 | A:2026-02-25 | U:2026-02-25 | T:POC
- [ ] Persist motion/mobile settings in `sessionStorage` once those controls are implemented.
  Meta: ID:CTP-WS05-05-1-03 | A:2026-02-25 | U:2026-02-25 | T:POC
