# Zone Render Profile v1

This document defines renderer-facing zone/layer policies that are intentionally out of scope for `CardTransition`.

Schema source of truth:
- `docs/specs/schemas/zone-render-profile.v1.schema.json`

Companion example:
- `docs/specs/examples/zone-render-profile.v1.example.json`

## Why This Contract Exists

`CardTransition` models card motion intent and authoritative event timing.

Clipping and masking are scene responsibilities:
- where card pixels are allowed to render,
- how overflow is handled,
- which layer stack owns a zone.

Keeping these concerns separate preserves cross-project portability of `CardTransition`.

## Core Model

One profile object defines:
- global render defaults,
- one or more `layers`,
- one or more `zones`.

Each zone binds to a layer and declares clipping policy.

## Zone Fields

- `zoneId`: stable domain identifier (`table.playfield`, `table.trick`, `hand.p1`)
- `layerId`: rendering layer owner
- `clipMode`:
  - `none`
  - `rect`
  - `rounded_rect`
  - `path`
  - `viewport`
- `overflowBehavior`:
  - `visible`
  - `clip`
  - `hide_when_outside`
- optional geometry hints:
  - `clipPaddingPx`
  - `clipRadiusPx`
  - `maskRef`

## Layer Fields

- `layerId`: unique layer key
- `zIndex`: deterministic layer ordering
- `compositeMode`: renderer compositing hint

## Integration with CardTransition

- `CardTransition.from.zoneId` and `CardTransition.to.zoneId` must match known zone IDs.
- The transition contract does not override zone clipping.
- Edge-launch animations are allowed; visibility while off-table is determined by zone clip policy.

## Determinism and Cross-Client Consistency

- Zone profile is part of renderer configuration and should be versioned.
- Clients in the same session should run compatible zone profiles.
- Differences in profile may alter visuals but must not change authoritative game events.
