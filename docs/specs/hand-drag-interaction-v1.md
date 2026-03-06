# Hand Drag Interaction v1

This document defines v1 hover and drag behavior for manual hand arrangement.

Implementation details are documented in:
- `docs/specs/hand-card-drag-algorithm-v1.md`
- `docs/specs/hand-suit-drag-algorithm-v1.md`

## Scope

- Applies only to `hand` view.
- `matrix` view has no hover-eject or drag-reorder interaction.
- Interaction is reorder-only in v1.

## Non-Goals

- Playing/discarding cards.
- Rules validation for legal moves in card games.
- Touch/mobile gesture design.

## UX Goals

- Make hovered selection explicit by visually ejecting it from the hand fan.
- Support precise drag reorder with clear insertion preview.
- Separate single-card and whole-suit drag modes with an explicit modifier.

## Gating Rules

Interaction availability is tied to sorting controls:

1. `rankSortEnabled = off`
- Single-card drag reorder is enabled.
- Suit drag is disabled.

2. `rankSortEnabled = on`
- Single-card drag reorder is enabled when no modifier is held.
- Suit drag reorder is enabled only while a modifier is held.

Modifier policy:
- Primary modifier: `Shift`.
- Accepted modifiers for parity: `Shift`, `Ctrl`, or `Alt`.
- Drag mode is latched at pointer-down and does not change until pointer-up.

## Click vs Drag Arbitration

- Pointer-down does not immediately start drag.
- Drag activates only after pointer movement crosses a threshold from pointer-down.
- Recommended desktop threshold: `6..8 px` (`7 px` default).
- Pointer-up before threshold is treated as a short click only.
- In v1, short click is non-destructive and never plays/discards a card.
- Future play interaction must be explicit (for example: drop to play zone, double-click, or dedicated play control), not single short click.

## Data Model Requirements

Card-level fields:
- `cardId` unique per dealt card instance.
- `dealIndex` immutable baseline sequence.
- `suit` (`hearts|diamonds|clubs|spades|null` for jokers).

Manual order state:
- `manualCardOrder: string[] | null` (ordered `cardId` list).
- `manualSuitOrder: string[] | null` (ordered group list: suits plus optional `jokers` group).

Transient interaction state:
- `dragState` with:
  - `mode`: `card` | `suit` | `none`
  - `dragCardId`
  - `dragSuit` / `dragGroup`
  - `dragCardIds` (selected set in current drag)
  - `insertionIndex`
  - `pointerStart`

## Hover Behavior

### Base hover

- On pointer move over hand cards, eject hovered card slightly outward from fan.
- Suggested default magnitude: `8..16px` normal to local fan direction.
- No card selection is committed on hover alone.

### Suit-hover (modifier held, `rankSortEnabled=on`)

- If modifier is active while hovering a grouped card:
  - eject all cards of that group together.
- Group model:
  - standard suits are individual groups
  - jokers form a shared `jokers` group when present

## Drag Modes

## 1) Card Drag (`rankSortEnabled=off` or `rankSortEnabled=on` without modifier)

Start:
- pointer-down on hovered card enters pending card-drag intent.
- `mode=card` drag starts only after movement threshold is crossed.

During drag:
- dragged card follows pointer with elevated z-index.
- remaining cards animate to open/close a gap for current insertion slot.
- insertion slot updates continuously by pointer crossing card anchors.

Drop:
- pointer-up commits `manualCardOrder` using resulting sequence.
- if rank sort was on and card order changed, `rankSortEnabled` is switched to `off` on commit.
- when rank sort is switched off by this commit, all non-dragged cards preserve their current sorted sequence and only the moved card changes position.
- cards animate into final settled positions.

Cancel:
- `Escape` cancels drag and restores pre-drag order.

## 2) Suit Drag (`rankSortEnabled=on` + modifier)

Start:
- pointer-down while modifier held on a grouped card enters pending suit-drag intent.
- `mode=suit` drag starts only after movement threshold is crossed.
- all cards of that group are selected and dragged as a block.

During drag:
- selected suit block follows pointer as a grouped unit.
- selected suit block tilt tracks the hand curve at the dragged group center X while preserving internal relative card tilts.
- selected suit block vertical shape remaps to the current hand curve position (not frozen from drag start), while still allowing manual up/down lift via pointer Y movement.
- suit drag remap at edges uses linear extrapolation from the nearest curve samples to avoid hard-wall clamping at far left/right.
- primary drag pose model uses interpolated shadow final layouts (continuous between insertion slots, with edge extrapolation) plus pointer Y-lift; fallback is the prior per-card curve-sampling model.
- fallback automatically engages whenever shadow-layout construction is invalid in the current frame; drag remains continuous via curve-sampling.
- in `demo` mode, outer-drop direction adapts during suit drag through the primary shadow model, with per-card curve sampling retained as fallback.
- other suit groups shift to a preview destination with a normalized visual gap width of 2 card slots (independent of dragged-group size).

Drop:
- pointer-up commits `manualSuitOrder`.
- if requested suit sort is currently `auto`, switch to `manual` on first committed suit drag.

Cancel:
- `Escape` cancels drag and restores pre-drag order and suit mode.

## Insertion Preview Rules

Card drag:
- insertion index is computed against visible card anchor sequence.
- gap preview must be stable and deterministic when pointer is between anchors.

Suit drag:
- insertion index is computed against current group order.
- all cards in moved group are treated as one block for indexing.
- side decision is center-vs-center: compare dragged group center X with hovered group center X.

Tie-break baseline:
- when calculations tie, use `dealIndex` ascending.

## Rendering Contract

- Hover eject and drag transforms are visual overlays; canonical order changes only on drop commit.
- Dragging should suspend fan reveal animation and other transient card animations.
- Active dragged element(s) render above all other cards.

## Accessibility / Keyboard Safety

- `Escape` cancels active drag.
- Modifier detection should ignore auto-repeat noise and rely on current event modifier flags.

## Integration with Sorting v2

- `manual_free` effective mode uses `manualCardOrder` when present, otherwise `dealIndex`.
- `manual_suits_ranked` uses `manualSuitOrder` when present, otherwise first-suit-seen baseline from `dealIndex`.
- `auto_ranked` ignores manual drag order state.

## Diagnostics Contract

Expose in debug snapshot:
- `hoverMode`: `card` | `suit` | `none`
- `dragMode`: `card` | `suit` | `none`
- `dragActive`: boolean
- `dragSelectionSize`
- `insertionIndex`
- `manualCardOrderActive`: boolean
- `manualSuitOrderActive`: boolean

## Deferred Follow-up

- “Play card” action is explicitly deferred to a later feature after reorder interaction stabilizes.
