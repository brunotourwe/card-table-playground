# Trick Play Animation v1

This document defines v1 gameplay flow and animation for playing cards from the hand into a trick.

## Scope

- Applies to `hand` view only.
- Human UI player is always the first player (lead) in v1.
- One trick consists of one played card per active player seat.
- Includes animation timeline, winner resolution, and interaction locks.

## Non-Goals (v1)

- Follow-suit enforcement (planned later).
- Trump suit rules (planned later).
- Network/multiplayer synchronization.
- Mobile/touch gesture design.

## Player Count Mapping (Per Deal)

Player count is derived from the dealt card count and remains fixed for that deal:

1. `1..13` cards: `4` players (`human + 3 bots`)
2. `14..17` cards: `3` players (`human + 2 bots`)
3. `18..26` cards: `2` players (`human + 1 bot`)
4. `27+` cards: `1` player (`human only`)

Recalculation moment:
- Recomputed only when cards are re-dealt (`Enter` redraw or hard refresh / re-init), not mid-hand.

## Seat Model and Bot Position Markers

Seat markers are colored bot circles inside the table canvas and are also the source anchors for bot-play animations.

- `4 players`: `W`, `N`, `E` bot seats (lateral + north anchor layout).
- `3 players`: `W`, `E` bot seats (top-left/top-right corner layout).
- `2 players`: `N` bot seat.
- `1 player`: no bot markers.

Human player remains at `S` (hand at bottom).

## Input Contract

### Play Intent

- Single short click on the currently hovered card commits play intent.
- Existing drag threshold arbitration still applies:
  - movement beyond drag threshold => drag reorder
  - pointer-up before threshold => short click => play intent

### Safety Gates

Play intent is ignored when:
- no hovered card,
- active drag is running,
- trick animation is running,
- current view is not `hand`,
- any hover-modifier key is held (`Shift`/`Ctrl`/`Alt`).

Modifier keys:
- No modifier is required for play.
- Modifier-assisted suit interactions still apply for drag mode and have precedence once drag threshold is crossed.

## Trick Winner Rules (v1)

Definitions:
- `leadCard`: first played card in trick (always human in v1).
- `leadSuit`: suit of `leadCard`.

Winner resolution order:

1. If trick contains jokers:
- Winner is the last played joker.

2. Else (no jokers):
- Only cards with `suit == leadSuit` are eligible.
- Highest rank among eligible cards wins.
- Off-suit cards always lose, regardless of rank.

Rank order source:
- Use current rank policy ordering already used by hand sorting.

## One-Player Mode Behavior (`27+` cards)

- Each played human card is a full trick with no bot responses.
- Card is treated as winner by definition.
- It still runs a shortened trick animation sequence for consistency.

## Requested Count Stale Indicator

The card-count input displays requested/deal count, not live remaining hand size.

- On first committed play in a deal:
  - set stale visual state (italic text).
  - set tooltip/title: `"Live hand changed after play. Press Enter to redeal."`
- Input remains editable at all times.
- Stale state clears on next re-deal (`Enter`) and on full re-init.

## State Model

Suggested high-level state machine:

- `deal_idle`: no trick in progress; hand interactions enabled.
- `trick_lock`: play accepted; interactions frozen.
- `trick_playing`: cards animate into trick slots.
- `trick_resolve`: winner computation + winner highlight.
- `trick_collect`: trick cards move to winner stack.
- `deal_idle` (next trick) or `deal_complete` (no human cards left).

## Interaction Lock Rules During Trick

While `trick_lock | trick_playing | trick_resolve | trick_collect`:

- Disable card hover eject updates.
- Disable card/suit drag reorder.
- Disable wheel card-size resize.
- Ignore additional play clicks.
- Keep card-count input editable (re-deal can be requested after current trick finishes).

## Animation Model

Animation speed profile:
- Configurable from Advanced pane with presets: `slow`, `medium`, `fast`.
- Default preset: `fast`.
- All trick-phase timings below are profile-driven.

### 1) Human Play Flight

Goal: feel human and slightly varied.

- Duration (`fast`): `180 ms`
- Easing: `cubic-bezier(0.22, 0.8, 0.24, 1)`
- Path: quadratic curve from card origin to trick slot anchor.
- Scale during flight: peak `1.03`, settle to `1.00`.

Dynamic Z-axis rotation (`rotateZ`) from click point:

- `clickOffsetNorm = clamp((clickX - cardCenterX) / (cardWidth / 2), -1, 1)`
- dead zone: if `abs(clickOffsetNorm) < 0.12`, use `0`
- `playTiltDeg = clickOffsetNorm * 8`
- clamp final to `[-8, +8]`

Result:
- click near left edge => slight negative tilt
- click near right edge => slight positive tilt
- center click => near-straight lay-down

Landing naturalization:
- After computing play tilt, apply small random landing jitter (preset-scaled) for a less robotic table feel.
- Clamp final played-card tilt to readability-safe bounds.

### 2) Bot Play Flights

- Each bot card flies from its seat marker to a trick slot.
- Per-bot start stagger (`fast`): `130 ms`
- Duration per bot (`fast`): `170 ms`
- Easing: same as human

Seat style bias (before jitter):
- `W`: `-4 deg`
- `N`: `0 deg`
- `E`: `+4 deg`

Jitter:
- add random `[-1.5, +1.5] deg` for non-robotic feel.

### 3) Trick Resolve Highlight

After last card lands:
- Delay: `70 ms`
- Highlight winner for (`fast`) `220 ms`
- Visual: subtle glow/ring and slight raise (no large movement)

### 4) Trick Collect Sweep

- Duration (`fast`): `220 ms`
- Easing: `cubic-bezier(0.16, 0.84, 0.24, 1)`
- All trick cards move to winner stack anchor.
- Winner card is top-most in sweep z-order.

### 5) Cleanup

- Duration (`fast`): `100 ms`
- Remove played cards from active hands.
- Advance local turn/trick counters.
- Return to `deal_idle`.

## Timing Profiles

`fast`:
1. Human flight: `180 ms`
2. Bot flights with stagger:
- bot1 starts `+130 ms`
- bot2 starts `+260 ms`
- bot3 starts `+390 ms`
- last landing around `560 ms`
3. Resolve highlight: `220 ms`
4. Collect sweep: `220 ms`
5. Cleanup: `100 ms`

`medium`:
- Human `250 ms`, Bot `230 ms`, Stagger `170 ms`, Highlight `280 ms`, Collect `280 ms`, Cleanup `120 ms`

`slow`:
- Human `330 ms`, Bot `300 ms`, Stagger `220 ms`, Highlight `340 ms`, Collect `340 ms`, Cleanup `140 ms`

Typical trick wall time: about `1.1..1.3 s`.

## Rendering and Layering Contract

- Trick cards render in a dedicated trick layer above hand cards, anchored in full table-playfield coordinates.
- Hand cards keep stable transforms; played cards become detached sprites during flight.
- Z-order priority:
  1. active flying card,
  2. other trick cards,
  3. hand cards.

## Data Model Additions (v1)

Deal-level:
- `dealtCountRequested`
- `playerCountForDeal`
- `isDealCountStale`

Trick-level:
- `trickId`
- `trickPlays[]` (`playerId`, `cardId`, `playOrder`, `seatId`)
- `winnerPlayerId`
- `winnerCardId`
- `phase`

Animation-level:
- `animationLock` boolean
- seat anchor registry (`S`, `W`, `N`, `E`)
- trick slot anchors per active player count

## Edge Cases

- If user starts new deal while trick is animating:
  - either queue redraw after trick, or cancel animation and hard reset state.
  - v1 recommendation: cancel current animation and hard reset (simpler, deterministic).

- If no hovered card at click time:
  - ignore play intent.

- If card data becomes invalid during resolve:
  - fail safe by aborting trick animation and re-rendering current deal snapshot.

## Implementation Order

1. Add seat markers and anchor calculations.
2. Add play intent on short click (without breaking drag).
3. Add trick phase state and interaction lock.
4. Implement human flight to center.
5. Implement bot flights with stagger.
6. Implement winner resolver rules above.
7. Implement highlight + collect sweep.
8. Add stale card-count indicator with tooltip.

## Future Extension Compatibility

This v1 model is intentionally compatible with later additions:
- follow-suit legality checks,
- trump rules,
- trick lead rotation,
- multiplayer or server-authoritative sequencing.
