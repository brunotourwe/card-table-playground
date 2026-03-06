# Card Table Playground

A local, single-page visual playground for experimenting with playing card rendering and hand/table layout ideas.

## Lifecycle Mode

- This project is explicitly classified as `POC`.
- Primary archetype is `POC-Only Prototype`.
- Status, constraints, promotion triggers, and temporary exception are defined in `PROJECT_STATUS.md`.

---

## Run

Open `index.html` directly in a browser — no server or build step required.

For deck updates (adding cards, SVGs, metadata), use the deck pipeline commands below first.

---

## Features

### Card Drawing

- Select a deck from **Advanced controls**; the available card count updates to match the deck size.
- Draw a random hand of N cards from the selected deck (1 up to the deck's full size).
- Input is validated; invalid values show a status message.
- Auto-draw triggers on card-count spinner changes (150 ms debounce).
- Press **Enter** from anywhere on the page to draw (suppressed when an input or select has focus).

### Controls Surface

- Main controls are intentionally compact: `Number of cards` + `Sorting` preset selector.
- Sorting presets are presented in a single horizontal row.
- Remaining setup/tuning controls are opened via an `Advanced pane` button on the same top control row.
- The advanced pane is an overlay panel (out of normal page flow) so the table canvas keeps full horizontal space.

### Card Render Modes

- **Unicode** — card rank and suit rendered as text symbols, enlarged for legibility.
- **SVG** — card faces rendered from local SVG image assets.
- Toggle between modes without redrawing.

### Card Size

- Card height configurable via slider (90–400 px).
- Card width derives from height using a fixed aspect ratio.
- Card height selection persists across hard reloads in the current tab session.
- In hand view, use the mouse wheel over a hand card to resize card height quickly (`8 px` per wheel step).

### Table Views

- **Hand view** — cards laid out as a held hand (default on first load).
- **Matrix view** — cards arranged in a deterministic left-to-right grid with a fixed row-size target.
- Animated transitions between views.
- Selected view persists in `sessionStorage` across reloads.

### Hand Layout Geometry

Hand view supports two layout modes:

- **Classic** — circular fan using `visibilityFactor`, `alphaDeg`, and `phiDeg`.
- **Demo** — shallow center fan with flattened shoulders using `visibilityFactor`, `gap angle`, and `outer drop`.

#### Classic

The Classic hand renderer uses three continuous parameters:

| Parameter | Range | Effect |
|---|---|---|
| `visibilityFactor` (VF) | 0–1 | Fraction of card width visible for each card; 0 = fully stacked, 1 = fully spread |
| `alphaDeg` | 0–15° | Desired per-card angular step (rotation between consecutive cards) |
| `phiDeg` | 0–90° | Maximum total fan angle; caps `alphaDeg × (N−1)` |

**Geometry model:**

- Card anchor point is the midpoint of the card's bottom edge.
- Anchor points lie on a circle when `alphaEff > 0`, with constant arc-length spacing `d = VF × cardWidth` between consecutive anchors.
- Radius: `R = d / alphaEff`.
- If `alphaEff == 0`, layout falls back to a straight horizontal line with spacing `d`.
- Each card is rotated radially around its anchor (bottom-center pivot).
- For even hand sizes, the two center cards sit symmetrically at `±alphaEff/2` around the vertical axis.

**Auto-clamp:**

- When the computed hand width would overflow the table frame, VF is automatically reduced using the exact linear model `W = A·VF + B` — no iteration required.
- `B` is derived from `buildLayouts(0)` so it accounts for the rotated-card extents in arc mode (not just `cardWidth`).
- The clamp reference is the table's resolved CSS `max-width` (`getComputedStyle`), so the frame can always expand to full width before clamping kicks in.

#### Demo

The Demo hand layout uses:

| Parameter | Range | Effect |
|---|---|---|
| `visibilityFactor` (VF) | 0–1 | Fraction of card width visible for each card |
| `gap angle` | 0.3–2.0° | Center card-to-card angle difference |
| `outer drop` | 0–5% | Maximum extra downward step at the outer shoulders |

Demo behavior:

- The middle of the hand keeps a very shallow fan.
- Outer shoulders reduce the per-card angle difference toward 25% of the center gap angle instead of reaching zero.
- Shoulder descent comes from both residual card tilt and the configurable extra outer drop.
- `phiDeg` does not apply in Demo mode.
- Current startup defaults are tuned for play-surface space: `demo` layout, `visibilityFactor=0.36`, `gap angle=0.8`, `card height=300`, fan animation off.

### Hand Sorting

- Sorting applies only in **hand** view.
- `matrix` view remains unsorted.
- Hand sorting is semantic; future right-to-left hand rendering should mirror placement only, not reverse the sorted sequence.
- Current controls:
  - `Auto sort` (`auto_ranked`)
  - `Auto rank (manual suit)` (`manual_suits_ranked`)
  - `Manual sort` (`manual_free`)
- Advanced sub-control:
  - `Rank policy`: `high_low` or `low_high`
- Suit-group ordering is optimized globally for alternating color, then resolved by full per-suit rank profile, then suit count, then fallback suit priority.
- Jokers always remain in a separate final group.
- Hand direction control is temporarily disabled and forced to `LTR` pending deck orientation metadata (`poker` vs `bridge`).

Detailed rules are defined in `docs/specs/hand-sorting-v2.md`.

### Hand Drag and Reorder

- Drag interactions apply only in **hand** view and are reorder-only in v1 (no play/discard action yet).
- Card hover ejects the card in place (keeps fan position and tilt) with animated return.
- Single-card drag is available in all hand sorting states:
  - with `Rank sort=on`, dropping a card into a new position automatically switches `Rank sort` to `off`
  - non-dragged cards keep their current sorted sequence on that transition
- Suit-group drag is available while `Rank sort=on` and a modifier key is held (`Shift`, `Ctrl`, or `Alt`):
  - all cards in the hovered suit group move together (jokers are one group)
  - suit drag preview uses a normalized 2-slot visual gap
  - suit drag pose follows the current hand curve continuously, including edge extrapolation
- `Escape` cancels active drag and restores pre-drag order.

Interaction and algorithm specs:
- `docs/specs/hand-drag-interaction-v1.md`
- `docs/specs/hand-card-drag-algorithm-v1.md`
- `docs/specs/hand-suit-drag-algorithm-v1.md`

### Joker Setup

- Deck selector lists only 52-card base decks.
- Joker designs are discovered from joker cards inside deck-native assets.
- Joker toggle enables adding `0..4` jokers of one selected design to the base 52-card deck.
- Default joker selection on toggle-on is the latest previously selected design.

Detailed rules are defined in `docs/specs/deck-joker-assets-v2.md`.

### Table Frame Sizing

- Frame uses `width: fit-content` so it wraps card content exactly.
- `min-width` is tied to the control section width.
- `max-width` is `calc(100vw − 24px)` — frame never overflows the viewport.
- Frame is always centered on the page.
- `body { min-width: 640px }` — viewports narrower than the 4-column control grid get a horizontal scrollbar instead of layout collapse.
- In hand view, canvas height is fixed after the first hand render; cards stay bottom-anchored in the viewport, so oversized cards clip at the bottom.
- Table height is derived from viewport budget only (independent of card size and advanced pane state) so it can use full available page height.
- Table surface uses layered cloth shading to emulate subtle velvet texture without reducing card readability.

### Debug Overlays

- **Card bounds** — draws a visible outline around each card's bounding box.
- **Hand curve** — draws the active anchor-point arc or straight line through all card anchors.
- **Depth shadows** — optional stacking-aware under-card shadows in hand view to improve overlap readability.

Both overlays update live as hand parameters change.

### Diagnostics Harness

URL query parameters can lock slider values for repeatable visual debugging without touching the UI. Useful for filing and reproducing layout bugs.

---

## Deck Pipeline

Source decks live under `assets/decks/<deckFolder>/deck.json`.

### Commands

```
npm run decks:validate   # validate manifest schema, coverage, and SVG safety rules
npm run decks:normalize  # validate → write normalized assets, regenerate index and runtime bundle
npm run decks:index      # regenerate deck index from normalized manifests only
npm run hand:sort:test   # verify pure hand-sorting fixtures
```

### Artifacts

| Path | Description |
|---|---|
| `assets/decks/<deck>/deck.json` | Source manifest |
| `assets/decks/<deck>/.normalized/` | Normalized per-card metadata and geometry |
| `assets/decks/decks.index.json` | Runtime deck listing |
| `assets/decks/decks.runtime.js` | Preloaded globals bundle for direct `file://` usage |

At runtime, `decks.runtime.js` exposes `__CTP_DECK_INDEX__`, `__CTP_DECK_MANIFESTS__`, and `__CTP_DECK_SVG__` as globals. Card SVGs are inlined at startup via `DOMParser`.

### Available Decks

- `standard52-french` — standard 52-card deck without jokers.
- `standard54-english` — standard 54-card deck with two jokers.
- Default startup deck: `standard54-english`.

---

## Project Tracking

| File | Purpose |
|---|---|
| `DEVELOPMENT_TRACKER.md` | Feature delivery status |
| `DECISION_LOG.md` | Confirmed product decisions |
| `DEBUG_GLITCHES.md` | Defect and regression tracker |
| `PROJECT_STATUS.md` | POC lifecycle status, constraints, promotion triggers |
