# Hand Card Drag Algorithm v1 (Implementation)

This document describes the current implementation of single-card drag reorder in `app.js`.

It complements (does not replace) the behavior spec in `docs/specs/hand-drag-interaction-v1.md`.

## Scope

- Applies to hand view single-card drag in both:
  - `manual_free` (`rank sort = off`)
  - ranked modes (`rank sort = on`) when no suit-drag modifier is held
- Describes only single-card drag (`03.7-03`).
- Suit-block drag is out of scope.

## Source of Truth

Implementation is in these core functions in `app.js`:

- `beginPendingCardDrag`
- `maybeActivateCardDrag`
- `handleCardDragPointerMove`
- `getCardDragInsertionIndex`
- `updateCardDragPreviewOrder`
- `applyCardDragVisual`
- `getCardDragTargetTiltDegFromLayout`
- `handleCardDragPointerEnd`
- `commitCardDragOrder`
- `resetCardDragState`

## Constants

- `CARD_DRAG_START_THRESHOLD_PX = 7`
- `CARD_DRAG_DIRECTION_DEADZONE_PX = 2`

## State Model

Persistent manual order:

- `manualCardOrder: string[] | null`

Transient drag state:

- `cardDragState`
  - `mode` (`"card"`)
  - `active` (`boolean`)
  - `pointerId`
  - `dragCardId`
  - `dragCardElement`
  - `startClientX`, `startClientY`
  - `lastClientX`, `lastClientY`
  - `startOrderCardIds`
  - `previewOrderCardIds`
  - `insertionIndex`
  - `dragCardStartLeftPx`, `dragCardStartTopPx`
  - `dragCardWidthPx`
  - `dragCardStartClientCenterX`
  - `horizontalDirection` (`-1 | 0 | 1`)
  - `dragCardBaseTransform`
  - `dragCardZIndex`

## Event Pipeline

1. `pointerdown` (`beginPendingCardDrag`)
- Guard: left mouse button and `isCardDragEnabled()`.
- Create pending drag state (`active=false`).
- Capture pointer on the pressed card.

2. `pointermove` (`handleCardDragPointerMove`)
- Update `horizontalDirection` when per-event delta exceeds deadzone.
- Update latest pointer position.
- If not active yet: call `maybeActivateCardDrag`.
- If active:
  - compute insertion index (`getCardDragInsertionIndex`)
  - update preview order (`updateCardDragPreviewOrder`)
  - relayout (`layoutHandCards`)

3. Activation (`maybeActivateCardDrag`)
- Compute travel distance from pointer-down.
- Activate only after threshold (`7px`).
- Initialize preview order from current DOM order.
- Capture drag start geometry (`left/top`, width, client center).
- Freeze base card transform for dragged card.

4. `pointerup` (`handleCardDragPointerEnd`)
- If active and commit requested:
  - commit `manualCardOrder` from preview order
  - re-render cards
- Otherwise cancel and restore layout.

5. `pointercancel` or `Escape`
- Cancel active drag and restore layout.

## Visual Movement Model

Dragged card rendering (`applyCardDragVisual`):

- Position follows pointer delta from drag start via absolute `left/top`.
- Card tilt is dynamic: on each layout pass, tilt is derived from the current insertion gap.
  - left gap neighbor tilt + right gap neighbor tilt averaged when both exist
  - edge gaps use the single adjacent card tilt
  - empty-neighbor fallback is `0deg`
- Z-index is raised during drag.
- `pointer-events: none` is applied while dragging so hit-testing sees underlying cards.

Cleanup (`resetCardDragState`):

- Release pointer capture if held.
- Clear drag class.
- Remove temporary per-card `transition` and `pointer-events` overrides.

## Gap (Insertion) Algorithm

Function: `getCardDragInsertionIndex(pointerClientX)`

Reference point:

- Use dragged card center in client space:
  - `referenceX = dragCardStartClientCenterX + (lastClientX - startClientX)`

Candidate list:

- Build ordered non-dragged cards from current preview layout order.

Hovered-card detection:

- Probe DOM at `(referenceX, lastClientY)` with `document.elementFromPoint`.
- Resolve to card via `getHandCardElementFromTarget`.

Center-vs-center side rule:

- Compare dragged center X (`referenceX`) with hovered card center X.
- If dragged center is left of hovered center, insertion is on the hovered card's left side.
- Otherwise insertion is on the hovered card's right side.

Fallback rules:

- If pointer is outside all card areas, clamp to start/end by hand edges.
- If still ambiguous, keep previous insertion index.

## Preview Order Update

Function: `updateCardDragPreviewOrder(insertionIndex)`

- Remove dragged card id from current preview list.
- Insert at clamped insertion index.
- If order changed: update `previewOrderCardIds` and `insertionIndex`.

Layout uses preview order through `getCardElementsInCurrentLayoutOrder`.

## Commit Rules

Function: `commitCardDragOrder`

- Validate preview IDs against current hand card IDs.
- On valid drop: set `manualCardOrder`.
- If card order changed and rank sort was enabled at drag commit time:
  - set `rankSortEnabled` toggle to `off`
  - enforce sort-control coercion and refresh hand mode controls
- Canonical card order changes only on commit.

`getCardsForView` in `manual_free` mode consumes `manualCardOrder` via `getCardsByManualOrder`.

## Current Limitations / Follow-up

- Drag diagnostics fields are not fully published yet (`03.7-05` pending).
- No touch-specific tuning yet.
- Suit-group drag is documented separately in `docs/specs/hand-suit-drag-algorithm-v1.md`.
