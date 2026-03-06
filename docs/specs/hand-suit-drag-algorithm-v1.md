# Hand Suit Drag Algorithm v1 (Implementation)

This document describes the current implementation of modifier-based suit-group drag reorder in `app.js`.

## Scope

- Applies in `hand` view when `rank sort = on`.
- Starts only with modifier held (`Shift`, `Ctrl`, or `Alt`).
- Includes joker-group drag (`jokers`) when jokers are present.

## Group Model

- Group keys: `hearts`, `diamonds`, `clubs`, `spades`, `jokers`.
- Jokers are treated as one draggable group.
- Group key resolution:
  - suited card => suit key
  - joker card => `jokers`

## Source of Truth Functions

- `beginPendingSuitDrag`
- `maybeActivateSuitDrag`
- `handleSuitDragPointerMove`
- `getSuitDragInsertionIndex`
- `updateSuitDragPreviewOrder`
- `applySuitDragVisual`
- `buildSuitDragLayoutPlan`
- `buildSuitDragShadowLayoutPlan`
- `buildSuitDragCurveSamples`
- `getSuitDragCurveSampleAtClientX`
- `getSuitDragTargetTiltDegFromLayoutEntries`
- `getSuitDragTargetCenterFromLayoutEntries`
- `handleSuitDragPointerEnd`
- `commitSuitDragOrder`

## Activation

- `pointerdown` creates pending suit drag state (`mode="suit"`).
- Drag activates after movement threshold (`CARD_DRAG_START_THRESHOLD_PX`).
- On activation:
  - current card order is captured
  - cards are partitioned into group order by first-seen sequence
  - dragged-group card ids are captured
  - dragged-group start center is captured in table coordinates
  - per-card tilt offsets relative to the dragged-group mean tilt are captured
  - per-card local center offsets are captured in dragged-group local frame (mean-tilt frame)
  - dragged-group start center X is captured from on-screen bounds

## Visual Movement

- Every selected card in the dragged group:
  - gets `pointer-events: none` during drag
  - primary model (shadow-final-layout):
    - build full-card-count shadow layouts for all insertion slots from the same preview group model
    - interpolate dragged-card `left/top/theta` between neighboring slot layouts using dragged center X
    - extrapolate beyond first/last slot layouts at hand edges to avoid hard-wall behavior
    - apply pointer `deltaY` lift on top of interpolated shadow `top`
  - uses a dynamic dragged-group center:
    - center X is interpolated from current hand curve samples at dragged center X and linearly extrapolated beyond hand edges
    - center Y is interpolated from current hand curve samples and linearly extrapolated beyond hand edges, with pointer `deltaY` applied as lift/drop offset
  - fallback model (if shadow layout is unavailable):
    - each card center is rebuilt via per-card curve sampling
    - card sample X = dragged-group center X + card local longitudinal offset
    - card center follows sampled curve center at that X
    - card local lateral offset is applied on the sampled local normal direction
  - uses dynamic tilt:
    - primary model uses shadow card tilt directly
    - fallback model samples each dragged card tilt from the curve at its card sample X and linearly extrapolates beyond hand edges
    - fallback keeps each dragged card's relative intra-group tilt offset from activation

### Shadow Interpolation Details

- Feature gate:
  - `SUIT_DRAG_SHADOW_MODEL_ENABLED` controls whether the primary shadow model is attempted.
- Slot-plan generation:
  - build one full-card-count plan per insertion slot (`0..groupOrderWithoutDragged.length`)
  - each slot plan maps every card id to `{left, top, thetaDeg}` in that hypothetical committed order
  - each slot plan also computes dragged-group center X in client space
- Continuous pose selection:
  - use current dragged center X as reference
  - pick bracketing slot plans by center X
  - interpolate dragged-card pose (`left/top/thetaDeg`) linearly between the two plans
  - when reference is outside slot range, extrapolate using first two or last two plans
- Vertical pointer lift:
  - final rendered `top` in primary model is `interpolatedTop + pointerDeltaY`
- Fallback trigger:
  - if any shadow precondition fails (invalid metrics/card ids/layout map), primary model is disabled for that frame
  - renderer automatically uses the curve-sampling fallback path for continuity and resilience

## Gap / Insertion Logic

Reference X:
- dragged group center X in client space:
  - `dragGroupStartClientCenterX + (lastClientX - startClientX)`

Candidate groups:
- derived from current preview order, excluding dragged group.

Hovered-group detection:
- `document.elementFromPoint(referenceX, lastClientY)` then card-to-group resolution.

Side rule (center-vs-center):
- compare dragged group center X with hovered group center X
- if dragged center is left of hovered center => insertion on left side
- else insertion on right side

Fallback:
- if no hovered group, clamp by left/right group edges
- if still ambiguous, keep previous insertion index

## Preview Update

- Group order is updated by insertion index.
- Card preview order is rebuilt from group order using stable per-group card lists.
- Cards outside supported groups remain as trailing stable ids.
- During active suit drag layout, the visual insertion gap is normalized to a fixed virtual width of 2 card slots (`SUIT_DRAG_GAP_SLOT_COUNT`), regardless of dragged-group size.

## Commit

- Drop commits `manualSuitOrder` (group-key order).
- If requested suit mode is `auto`, first successful suit-group drop coerces it to `manual`.
- Re-render applies `manualSuitOrder` in `manual_suits_ranked` mode.

## Notes

- Internal card order inside suited groups remains rank-sorted by active rank policy.
- Internal joker order remains stable in deal order.
