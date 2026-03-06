# Hand Sorting v2

This document defines the v2 sorting-control model and effective sorting behavior for hand view.

## Scope

- Applies only to `hand` view.
- `matrix` view remains unsorted.
- Sorting reorders the current hand snapshot only; it does not draw a new hand.
- Hand render direction (`ltr` / `rtl`) mirrors presentation only and does not change semantic order.

## Purpose

v2 adds two user controls:

- `suitSortMode`: `auto` or `manual`
- `rankSortEnabled`: `on` or `off`

and formalizes how these controls map to effective sort behavior.

## Input Controls

### `suitSortMode`

- `auto`: use semantic suit-group ordering algorithm (v1 model).
- `manual`: do not auto-optimize suit-group order; preserve manual/received baseline.

### `rankSortEnabled`

- `on`: rank sorting logic is active.
- `off`: rank sorting logic is disabled.

### `rankPolicy`

- `high_low`
- `low_high`

`rankPolicy` applies only when `rankSortEnabled = on`.

## Effective Mode Matrix

Requested combinations map to three effective modes:

1. `suitSortMode=auto`, `rankSortEnabled=on` -> `auto_ranked`
2. `suitSortMode=manual`, `rankSortEnabled=on` -> `manual_suits_ranked`
3. `rankSortEnabled=off` (any requested suit mode) -> `manual_free`

Coercion rule:

- `auto + rank off` is coerced to `manual_free`.
- UI should force `suitSortMode=manual` whenever `rankSortEnabled=off`.

## Card Model Requirements

Each drawn card instance must include:

- `dealIndex`: immutable integer position from initial deal sequence.

Planned future fields (not required for first v2 implementation):

- `manualSuitOrder`: explicit suit-group order chosen by user.
- `manualCardOrder`: full explicit card order chosen by user.

## Sorting Rules by Effective Mode

## `auto_ranked`

- Use the existing v1 semantic algorithm from `docs/specs/hand-sorting-v1.md`.
- Includes suit-group optimization and rank sorting.

## `manual_suits_ranked`

1. Partition suited cards by suit; keep jokers separate.
2. Determine suit-group order by manual baseline:
   - Current baseline: first suit appearance in `dealIndex` order.
   - Future override: `manualSuitOrder` when available.
3. Sort ranks within each suit according to `rankPolicy`.
4. Stability tie-break inside suit: `dealIndex`.
5. Append joker group at end, preserving joker `dealIndex`.

Result:

- Ranks are sorted.
- Suit-group order is not auto-optimized; it follows received/manual baseline.

## `manual_free`

Current baseline implementation:

- Preserve full `dealIndex` order (no rank sorting, no suit sorting).

Future override:

- If `manualCardOrder` exists, use it as canonical sequence.

Result:

- User can fully control arrangement in the future manual-move interaction.
- No automatic reshaping of order is applied.

## Joker Policy

- `auto_ranked` and `manual_suits_ranked`: jokers remain final group, stable by `dealIndex`.
- `manual_free`: jokers follow the same sequence rule as all other cards (`dealIndex` now, `manualCardOrder` later).

## Determinism

- Algorithm must not rely on engine sort stability for business logic.
- Explicit tie-break must use `dealIndex` wherever comparisons are otherwise equal.
- Coercion from invalid control combinations must be deterministic (`auto + rank off` -> `manual_free`).

## UI Contract

Required controls:

- `Suit sort`: selector with `auto` / `manual`
- `Rank sort`: toggle `on` / `off`
- `Rank policy`: selector `high_low` / `low_high`

UI state rules:

- When `Rank sort` is `off`, set and lock `Suit sort` to `manual`.
- Disable `Rank policy` when `Rank sort` is `off`.

## Diagnostics Contract

Expose for debug/test snapshots:

- `sortModeRequested`
- `sortModeEffective`
- `rankSortEnabled`
- `rankPolicy`
- `manualSuitOrderActive` (boolean)
- `manualCardOrderActive` (boolean)
