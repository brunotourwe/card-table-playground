# Decision Log

Last updated: 2026-03-05 (session 6)
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

Status: Superseded
Date: 2026-02-25

Decision:
- Sorting applies in both matrix and hand views.
- Sorting is authoritative while active (manual reorder disabled).
- Sort trigger modes to support: `auto-apply` and `manual trigger`.

Superseded by:
- `CTP-DEC-027`

### CTP-DEC-010 Sorting policy

Status: Superseded
Date: 2026-02-25

Decision:
- Fixed multi-level sort order: `suit -> rank`.
- Rank policy options: `ace_high` and `ace_low` (default `ace_high`).
- Sort direction toggle required (`ascending` / `descending`).

Superseded by:
- `CTP-DEC-027`

### CTP-DEC-011 Suit-order profiles

Status: Superseded
Date: 2026-02-25

Decision:
- Required suit-order profiles:
  - `fixed1`: Harten, Klaveren, Ruiten, Schoppen
  - `fixed2`: Harten, Ruiten, Klaveren, Schoppen
  - dynamic largest-suit-first profile
  - `random`
- Dynamic largest-suit-first profile prefers opposite color in the second slot.

Superseded by:
- `CTP-DEC-027`

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

Status: Partially superseded
Date: 2026-03-01

Decision:
- Replace all V1 hand layout modes with a single geometry-driven hand renderer.
- Remove overlap, curvature, arch presets, auto-angle toggle, and hand-layout mode switches from the hand UI.
- Expose exactly three hand parameters:
  - `visibilityFactor` (`0..1`)
  - `alphaDeg` (`0..15`)
  - `phiDeg` (`0..90`)

Superseded scope:
- `CTP-DEC-028` adds a second `demo` hand layout mode with its own active parameter set.

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

### CTP-DEC-027 Hand sorting model revision

Status: Confirmed
Date: 2026-03-02

Decision:
- Semantic sorting applies only to `hand` view.
- `matrix` view remains unsorted.
- Hand sorting is independent from render direction:
  - `rtl` mirrors presentation only and does not reverse semantic order.
- v1 hand sorting uses suit groups plus per-suit rank sorting.
- Jokers always form a separate final group.
- v1 suit-group policy is a global alternating-color optimization with deterministic tie-breaks, not a greedy local rule.
- Suit-group strength is evaluated by full per-suit rank profile under the active rank policy; count is secondary to rank profile.
- Detailed algorithm is defined in:
  - `docs/specs/hand-sorting-v1.md`

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

### CTP-DEC-024 Fan animation model

Status: Confirmed
Date: 2026-03-01

Decision:
- Hand cards are revealed left-to-right via staggered opacity animation (no positional movement during the fan).
- Cards are placed at their final positions before the fan starts; the fan is a pure reveal effect.
- Fan triggers: Enter key redraw, card-count spinner change, deck switch, matrix→hand view switch, hand-layout slider release (from wireframe mode).
- Hand→matrix switch retains the existing `card-view-switch` keyframe (simultaneous fade-in with translate+scale).
- Right-to-left fan direction: deferred to backlog (CTP-WS02-02-4-06).

### CTP-DEC-025 Wireframe slider-drag mode

Status: Confirmed
Date: 2026-03-01

Decision:
- While an active hand-layout slider is pointer-held, the hand switches to wireframe mode.
- Wireframe: card content (`card-face`) hidden; card border visible as a rotated rectangle outline; CSS transitions disabled (`transition: none`).
- Layout updates are instant during wireframe mode (no CSS transition lag, no cascading jumps).
- `pointerdown` interrupts any running fan animation and enters wireframe immediately.
- `pointerup` exits wireframe and triggers a fan animation at the current (wireframe) positions.
- Keyboard-driven slider interaction (arrow keys) does not enter wireframe; CSS transitions remain active.

### CTP-DEC-026 Fan animation timing parameters

Status: Confirmed
Date: 2026-03-01

Decision:
- Two configurable parameters exposed as hand-layout controls:
  - `fan duration (s)`: soft cap for full-hand reveal timing. Range 0.5–2.0 s, default 1.0 s.
  - `fan step (ms)`: preferred delay between consecutive card reveals. Range 10–100 ms, default 50 ms.
- Effective reveal step is computed per hand as:
  - `effectiveStepMs = min(fanStepMs, fanDurationMs / N)`
- Cards are still revealed instantly at each step; there is no separate per-card fade-duration control in the current model.

### CTP-DEC-028 Demo hand layout mode

Status: Confirmed
Date: 2026-03-02

Decision:
- Add a second hand layout mode `demo` alongside the classic circular fan.
- `demo` keeps `visibilityFactor` but replaces classic `alphaDeg` / `phiDeg` behavior with:
  - a reduced center `gap angle`
  - an `outer drop` percentage control
- `demo` is a shallow center fan with flattened outer shoulders and a soft outward downward drift.
- `phiDeg` does not apply while `demo` mode is active.

### CTP-DEC-029 Joker asset split and setup rules

Status: Superseded
Date: 2026-03-05

Decision:
- Joker artwork is modeled as global assets under `assets/jokers`, not as deck-local cards.
- Setup uses a 52-card base deck plus optional joker injections at runtime.
- Max joker count is `4`.
- All injected jokers in one setup share the same single selected joker design.
- When jokers are toggled on, the default selected design is the latest previously selected joker.
- Future UX extension is planned for a deck-aware "best fitting joker" recommendation mode.

Superseded by:
- `CTP-DEC-030`

### CTP-DEC-030 Deck-native jokers with global discovery

Status: Confirmed
Date: 2026-03-05

Decision:
- Joker assets stay in their native deck folders to preserve provenance.
- Setup deck selection still builds from a 52-card base deck.
- Joker picker offers all joker designs discovered across valid deck manifests.
- Max joker count is `4`.
- All injected jokers in one setup use the same selected joker design.
- When jokers are toggled on, default to the latest previously selected joker design.
- Future recommendation mode should prioritize jokers native to the selected deck.

### CTP-DEC-031 Hand sorting control model v2

Status: Confirmed
Date: 2026-03-05

Decision:
- Add two sorting controls in hand view:
  - `Suit sort`: `auto` / `manual`
  - `Rank sort`: `on` / `off`
- Effective behavior matrix:
  - `auto + rank on` -> current semantic sort behavior.
  - `manual + rank on` -> suit-group order follows received/manual baseline; ranks are sorted within suit groups.
  - `rank off` -> no automatic sort (manual baseline), enabling future full manual arrangement.
- Coercion rule:
  - `auto + rank off` is not allowed; force effective mode to manual (`manual_free`).
- Introduce immutable per-card `dealIndex` as deterministic baseline for manual modes.
- Detailed algorithm and UI contract are defined in:
  - `docs/specs/hand-sorting-v2.md`

### CTP-DEC-032 Hand drag-reorder interaction v1

Status: Confirmed
Date: 2026-03-05

Decision:
- Add hover eject feedback in hand view:
  - default hover ejects the card under pointer.
  - modifier-hover (Shift/Ctrl/Alt) with `rank sort = on` ejects all cards of hovered suit.
- Reorder behavior by sorting state:
  - `rank sort = off`: allow single-card drag reorder and commit `manualCardOrder`.
  - `rank sort = on`: allow modifier-based suit-block drag reorder and commit `manualSuitOrder`.
- Suit drag is unavailable when `rank sort = off`.
- First committed manual suit drag should switch suit sort mode to `manual` if it was `auto`.
- Drag mode is latched on pointer-down and does not change until pointer-up.
- v1 drag is reorder-only; play/discard interaction is deferred.
- Detailed interaction contract is defined in:
  - `docs/specs/hand-drag-interaction-v1.md`
