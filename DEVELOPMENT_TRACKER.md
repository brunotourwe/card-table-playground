# Development Tracker

Last updated: 2026-03-06 (session 9)
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
- [x] Implement fixed row-size matrix renderer with deterministic left-to-right fill.
  Meta: ID:CTP-WS02-02-1-05 | A:2026-02-25 | U:2026-03-03 | T:POC

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

### 02.2B Hand Layout Geometry (Demo Mode)
- [x] Add a second hand layout mode `demo` alongside the current circular fan hand.
  Meta: ID:CTP-WS02-02-2-09 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Define `demo` as a shallow center fan with flattened outer shoulders and a soft outward downward drift.
  Meta: ID:CTP-WS02-02-2-10 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] In `demo` mode, remove `phiDeg` from the active geometry model; keep only `visibilityFactor` and a reduced center gap-angle control.
  Meta: ID:CTP-WS02-02-2-11 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Narrow the `demo` gap-angle range to `0.3..2.0` degrees and interpret it as the center neighbor-to-neighbor angle, not as a global constant fan step.
  Meta: ID:CTP-WS02-02-2-12 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Make `demo` angle differences smoothly fall from the center toward `0` in the outer quarters so the edge cards become nearly parallel.
  Meta: ID:CTP-WS02-02-2-13 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Add `outer drop` control in `demo` mode as a percentage of card height (`0..5%`), where the configured value is the maximum outer-card per-step drop.
  Meta: ID:CTP-WS02-02-2-14 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Make `demo` vertical drop reduce smoothly toward the center and reach `0` around the inner third of the hand on both left and right sides.
  Meta: ID:CTP-WS02-02-2-15 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Update hand controls and diagnostics so `demo` exposes only the parameters relevant to its geometry and reports its custom path correctly.
  Meta: ID:CTP-WS02-02-2-16 | A:2026-03-02 | U:2026-03-02 | T:POC

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
- [x] Add optional card-under-shadow rendering in hand view to improve depth perception and stacking readability.
  Meta: ID:CTP-WS02-02-3-10 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Add a `shadow strength` control for hand depth shadows so users can scale the depth cue without disabling it.
  Meta: ID:CTP-WS02-02-3-11 | A:2026-03-03 | U:2026-03-03 | T:POC
- [x] Add a clock-style `shadow direction` control with 12-step selection for hand depth shadows.
  Meta: ID:CTP-WS02-02-3-12 | A:2026-03-03 | U:2026-03-03 | T:POC
- [x] Hide the current hand depth shadow controls and suppress the effect by default pending a hand-level shadow redesign.
  Meta: ID:CTP-WS02-02-3-13 | A:2026-03-03 | U:2026-03-03 | T:POC
- [x] Remove the visible `Draw` button and rely on the existing desktop `Enter` shortcut, with an explicit header hint for redraw discoverability.
  Meta: ID:CTP-WS02-02-3-14 | A:2026-03-03 | U:2026-03-03 | T:POC
- [x] Raise the card-height default to `300 px` with a `400 px` maximum, default the hand size to `13`, and start with fan animation disabled.
  Meta: ID:CTP-WS02-02-3-15 | A:2026-03-03 | U:2026-03-03 | T:POC
- [x] Split controls into a compact main row (`Number of cards` + sorting preset) and a collapsed `Advanced controls` section to free table canvas space.
  Meta: ID:CTP-WS02-02-3-16 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Move deck and joker setup controls into `Advanced controls` to keep primary interaction surface gameplay-focused.
  Meta: ID:CTP-WS02-02-3-17 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Set default hand setup profile to `demo` layout with `visibility factor = 0.36`, while keeping `card height = 300`, `gap angle = 0.8`, and fan animation off.
  Meta: ID:CTP-WS02-02-3-18 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Reposition `Advanced controls` below the table surface to keep the main top section focused and minimize pre-table vertical clutter.
  Meta: ID:CTP-WS02-02-3-19 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Expand hand-view table surface height target to `250%` of the rendered hand viewport while bottom-aligning the hand viewport so card bottoms stay at the same table-bottom reference.
  Meta: ID:CTP-WS02-02-3-20 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Persist card-height slider value in session storage so card size survives hard reloads within the current browser tab session.
  Meta: ID:CTP-WS02-02-3-21 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Freeze hand table-canvas height after initial hand render and keep cards bottom-anchored during card-height changes, so card scaling no longer resizes the canvas.
  Meta: ID:CTP-WS02-02-3-22 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Keep hand content bottom-anchored inside the fixed viewport and apply progressive downward offset by card height so overflow clips at the bottom (up to ~50% at max card height).
  Meta: ID:CTP-WS02-02-3-23 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Add viewport-height budgeting for fixed table height so hard reload keeps `Advanced controls` visible near the bottom and clamps orange-table height to the available vertical space.
  Meta: ID:CTP-WS02-02-3-24 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Enforce strict table/viewport height coupling so viewport height can never exceed the clamped orange-table content height.
  Meta: ID:CTP-WS02-02-3-25 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Remove remaining hand-geometry influence from table height and size the orange table exclusively from viewport budget + collapsed advanced-controls reserve.
  Meta: ID:CTP-WS02-02-3-26 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Replace below-table advanced-controls block with a top-row `Advanced pane` trigger and out-of-flow overlay panel so table width is never constrained by the controls pane.
  Meta: ID:CTP-WS02-02-3-27 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Update table height budgeting to ignore advanced-controls reserve and clamp only against viewport space below the table top edge.
  Meta: ID:CTP-WS02-02-3-28 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Add wheel-resize shortcut in hand view to resize card height directly while hovering hand cards (`8 px` step), without using modifier keys.
  Meta: ID:CTP-WS02-02-3-29 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Compress top-page vertical overhead (header/control spacing) and tighten table frame paddings so the orange table uses more available viewport height.
  Meta: ID:CTP-WS02-02-3-30 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Reduce bottom hand gutter target (`hand pad bottom`) to keep only a small visual lane between the orange border and the card cutoff line.
  Meta: ID:CTP-WS02-02-3-31 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Add subtle cloth/velvet shading layers to the table surface and smooth the page background gradient to remove visible horizontal seam artifacts.
  Meta: ID:CTP-WS02-02-3-32 | A:2026-03-06 | U:2026-03-06 | T:POC

### 02.4 Hand Animation

- [x] Fan animation: hand cards revealed left-to-right with staggered opacity on draw, deck switch, and matrix→hand view switch.
  Meta: ID:CTP-WS02-02-4-01 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Wireframe slider-drag mode: holding a hand-layout slider shows card outlines only (no content, no CSS transitions) for instant jank-free geometry feedback.
  Meta: ID:CTP-WS02-02-4-02 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Fan animation on slider release: exiting wireframe mode triggers fan animation at the correct final positions.
  Meta: ID:CTP-WS02-02-4-03 | A:2026-03-01 | U:2026-03-01 | T:POC
- [x] Fan animation timing controls: `fan duration (s)` slider (0.5–2.0 s, default 1.0 s) and `fan step (ms)` slider (10–100 ms, default 50); effective step = min(stepMs, durationMs / N).
  Meta: ID:CTP-WS02-02-4-04 | A:2026-03-01 | U:2026-03-03 | T:POC
- [x] Pointer-down on hand-layout slider interrupts any running fan animation and immediately enters wireframe mode.
  Meta: ID:CTP-WS02-02-4-05 | A:2026-03-01 | U:2026-03-01 | T:POC
- [ ] Right-to-left fan animation direction option.
  Meta: ID:CTP-WS02-02-4-06 | A:2026-03-01 | U:2026-03-01 | T:POC
- [ ] Improve hand reveal animation by exploring and comparing multiple animation modes instead of relying on a single staggered-opacity fan.
  Meta: ID:CTP-WS02-02-4-07 | A:2026-03-02 | U:2026-03-02 | T:POC

## WS-03 Sorting and Grouping (Backlog)

### 03.1 Hand Sort Engine
- [x] Implement semantic sorting for `hand` view only, based on the current hand snapshot, without drawing a new hand.
  Meta: ID:CTP-WS03-03-1-01 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Keep `matrix` view unsorted while allowing `hand` view to reorder the same current cards.
  Meta: ID:CTP-WS03-03-1-02 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Partition hands into suited groups plus a separate final joker group.
  Meta: ID:CTP-WS03-03-1-03 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Preserve original draw order only when cards remain equal after all explicit card-level sort rules.
  Meta: ID:CTP-WS03-03-1-04 | A:2026-03-02 | U:2026-03-02 | T:POC

### 03.2 Rank Policies
- [x] Implement rank policy `high_low` with `A K Q J 10 9 8 7 6 5 4 3 2`.
  Meta: ID:CTP-WS03-03-2-01 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Implement rank policy `low_high` with `2 3 4 5 6 7 8 9 10 J Q K A`.
  Meta: ID:CTP-WS03-03-2-02 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Compare suit strength by full ordered rank profile under the active rank policy, not only by the first card.
  Meta: ID:CTP-WS03-03-2-03 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] When two suit profiles start with the same highest card, use the second card, then third card, and so on before count-based tie-breaks.
  Meta: ID:CTP-WS03-03-2-05 | A:2026-03-02 | U:2026-03-02 | T:POC
- [ ] Reserve future extension point for alternate rank policies such as `ace_low` without changing the hand-sorting contract.
  Meta: ID:CTP-WS03-03-2-04 | A:2026-03-02 | U:2026-03-02 | T:POC

### 03.3 Suit-Group Ordering
- [x] Implement v1 suit-group policy `largest_first_alternating_color` by evaluating all permutations of present suits, not by greedy local selection.
  Meta: ID:CTP-WS03-03-3-01 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Score candidate suit orders by ordered tie-break chain: color alternation count, suit rank-profile vector under active rank policy, suit-count vector, then fixed fallback suit priority.
  Meta: ID:CTP-WS03-03-3-02 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Use final fallback suit priority `hearts > diamonds > clubs > spades` only as the last deterministic suit-group tie-break.
  Meta: ID:CTP-WS03-03-3-03 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Skip absent suits entirely when building and scoring suit-group orders.
  Meta: ID:CTP-WS03-03-3-04 | A:2026-03-02 | U:2026-03-02 | T:POC

### 03.4 View Integration and Direction
- [x] Keep semantic hand sort order fixed while mirroring only visual placement for `rtl` hand rendering.
  Meta: ID:CTP-WS03-03-4-01 | A:2026-03-02 | U:2026-03-03 | T:POC
- [x] Keep reveal direction tied to hand render direction, not to suit-group sort order.
  Meta: ID:CTP-WS03-03-4-02 | A:2026-03-02 | U:2026-03-03 | T:POC
- [x] Add hand-view sorting controls for v1 sort policy and rank policy.
  Meta: ID:CTP-WS03-03-4-03 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Hide or otherwise suppress hand-only sorting controls when `matrix` view is active.
  Meta: ID:CTP-WS03-03-4-04 | A:2026-03-02 | U:2026-03-02 | T:POC
- [x] Add a persisted `LTR` / `RTL` hand-direction control for hand view.
  Meta: ID:CTP-WS03-03-4-05 | A:2026-03-03 | U:2026-03-03 | T:POC
- [x] Temporarily disable hand-direction UI and force effective hand direction to `LTR` pending deck orientation metadata (`poker` vs `bridge`) support.
  Meta: ID:CTP-WS03-03-4-06 | A:2026-03-06 | U:2026-03-06 | T:POC

### 03.5 Future Extensions
- [ ] Add manual player-defined suit-group policy as a second suit-order mode after v1 semantic sorting is stable.
  Meta: ID:CTP-WS03-03-5-01 | A:2026-03-02 | U:2026-03-02 | T:POC
- [ ] Add optional interleaving between suit groups as a second-stage layout transform, disabled by default.
  Meta: ID:CTP-WS03-03-5-02 | A:2026-03-02 | U:2026-03-02 | T:POC
- [ ] Add optional suit-group header labels.
  Meta: ID:CTP-WS03-03-5-03 | A:2026-03-02 | U:2026-03-02 | T:POC
- [ ] Add optional suit-group spacing gaps.
  Meta: ID:CTP-WS03-03-5-04 | A:2026-03-02 | U:2026-03-02 | T:POC

### 03.6 Sorting Controls v2
- [x] Define v2 sorting controls spec with `suit sort` (`auto`/`manual`) and `rank sort` (`on`/`off`) including coercion and behavior matrix.
  Meta: ID:CTP-WS03-03-6-01 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Add hand-view UI controls for `suit sort` and `rank sort`, keeping current v1 behavior as `auto + rank on`.
  Meta: ID:CTP-WS03-03-6-02 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Add immutable per-card `dealIndex` and use it as deterministic baseline tie-break/manual-order source.
  Meta: ID:CTP-WS03-03-6-03 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Implement effective sorting modes: `auto_ranked`, `manual_suits_ranked`, and `manual_free`.
  Meta: ID:CTP-WS03-03-6-04 | A:2026-03-05 | U:2026-03-05 | T:POC
- [ ] Add diagnostics fields for requested/effective sort mode and manual-order activation flags.
  Meta: ID:CTP-WS03-03-6-05 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Replace primary hand sorting controls with a single 3-state preset selector (`auto sort`, `auto rank (manual suit)`, `manual sort`) mapped to existing effective modes.
  Meta: ID:CTP-WS03-03-6-06 | A:2026-03-06 | U:2026-03-06 | T:POC

### 03.7 Drag Reorder Interaction v1
- [x] Define v1 hand drag interaction spec (hover eject, card drag in `rank off`, modifier-based suit drag in `rank on`).
  Meta: ID:CTP-WS03-03-7-01 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Implement hover eject visuals for card and suit-hover modes.
  Meta: ID:CTP-WS03-03-7-02 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Implement single-card drag reorder with gap preview and `manualCardOrder` commit in `manual_free`.
  Meta: ID:CTP-WS03-03-7-03 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Implement modifier-based suit-block drag reorder with `manualSuitOrder` commit in ranked modes.
  Meta: ID:CTP-WS03-03-7-04 | A:2026-03-05 | U:2026-03-05 | T:POC
- [ ] Add drag diagnostics fields and `Escape` drag-cancel behavior.
  Meta: ID:CTP-WS03-03-7-05 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Document current single-card drag movement/gap algorithm and state model for maintainability.
  Meta: ID:CTP-WS03-03-7-06 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Extend suit-block drag grouping to include a shared `jokers` group when jokers are present.
  Meta: ID:CTP-WS03-03-7-07 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Refine suit-block drag visual remap: fixed 2-slot preview gap plus curve-aligned dynamic center/tilt reconstruction (including per-card local offsets) to avoid frozen Y-shape artifacts.
  Meta: ID:CTP-WS03-03-7-08 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Remove hard edge-wall in suit drag remap by adding linear extrapolation of center/tilt beyond curve sample bounds.
  Meta: ID:CTP-WS03-03-7-09 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Adapt demo-mode outer-drop direction during suit drag via per-card curve sampling (longitudinal curve lookup + lateral normal offset), replacing rigid group-only remap.
  Meta: ID:CTP-WS03-03-7-10 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Add hybrid suit-drag pose model: primary shadow final-layout reconstruction (exact drop pose + pointer Y-lift) with automatic fallback to prior per-card curve-sampling remap.
  Meta: ID:CTP-WS03-03-7-11 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Refine hybrid shadow model to continuous suit-drag interpolation between insertion slots with edge extrapolation, removing discrete snapping and edge wall effects while keeping fallback path.
  Meta: ID:CTP-WS03-03-7-12 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Expand suit-drag docs with explicit shadow interpolation algorithm, edge extrapolation behavior, and frame-level fallback triggers.
  Meta: ID:CTP-WS03-03-7-13 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Enable single-card drag in ranked modes (without modifier) and, on changed drop, auto-switch `rank sort` to `off` while preserving current sorted sequence for non-dragged cards.
  Meta: ID:CTP-WS03-03-7-14 | A:2026-03-06 | U:2026-03-06 | T:POC
- [x] Add drag cursor affordance in hand view: keep idle cursor neutral and show `grab` while any drag is active via `.card-table--dragging`.
  Meta: ID:CTP-WS03-03-7-15 | A:2026-03-06 | U:2026-03-06 | T:POC

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

## WS-06 Deck and Joker Assets (In Progress)

### 06.1 Deck-Native Joker Discovery
- [x] Define deck-native joker contract: joker assets remain in deck folders while setup can select from all discovered jokers.
  Meta: ID:CTP-WS06-06-1-01 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Remove standalone `assets/jokers` scaffold and keep joker provenance deck-local.
  Meta: ID:CTP-WS06-06-1-02 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Add derived runtime joker catalog from deck manifests (all `rank=JOKER` entries).
  Meta: ID:CTP-WS06-06-1-03 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Ensure runtime deck selection shows 52-card base decks while jokers are injected separately.
  Meta: ID:CTP-WS06-06-1-04 | A:2026-03-05 | U:2026-03-05 | T:POC
- [x] Add runtime setup/state contract for jokers toggle + joker count (`0..4`) + latest-selection default.
  Meta: ID:CTP-WS06-06-1-05 | A:2026-03-05 | U:2026-03-05 | T:POC

### 06.2 Joker UX (Backlog)
- [ ] Add joker design picker UI with clear selected-state highlighting.
  Meta: ID:CTP-WS06-06-2-01 | A:2026-03-05 | U:2026-03-05 | T:POC
- [ ] Add optional future recommendation mode to suggest best-fitting joker per selected deck, prioritizing native jokers first.
  Meta: ID:CTP-WS06-06-2-02 | A:2026-03-05 | U:2026-03-05 | T:POC

### 06.3 Deck Orientation Metadata (Backlog)
- [ ] Distinguish poker-style (2-corner index) vs bridge-style (4-corner index) decks in deck metadata and use it to gate hand-direction behavior.
  Meta: ID:CTP-WS06-06-3-01 | A:2026-03-06 | U:2026-03-06 | T:POC
