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

- Select a deck from the deck selector; the available card count updates to match the deck size.
- Draw a random hand of N cards from the selected deck (1 up to the deck's full size).
- Input is validated; invalid values show a status message.
- Auto-draw triggers on card-count spinner changes (150 ms debounce).
- Press **Enter** from anywhere on the page to draw (suppressed when an input or select has focus).

### Card Render Modes

- **Unicode** — card rank and suit rendered as text symbols, enlarged for legibility.
- **SVG** — card faces rendered from local SVG image assets.
- Toggle between modes without redrawing.

### Card Size

- Card height configurable via slider (90–372 px).
- Card width derives from height using a fixed aspect ratio.

### Table Views

- **Hand view** — cards laid out as a held hand (default on first load).
- **Matrix view** — cards arranged in a left-to-right grid (fixed row-size target).
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

### Hand Sorting

- Sorting applies only in **hand** view.
- `matrix` view remains unsorted.
- Hand sorting is semantic; future right-to-left hand rendering should mirror placement only, not reverse the sorted sequence.
- Current controls:
  - `Enable sorting`
  - `Rank policy`: `high_low` or `low_high`
- Suit-group ordering is optimized globally for alternating color, then resolved by full per-suit rank profile, then suit count, then fallback suit priority.
- Jokers always remain in a separate final group.

Detailed rules are defined in `docs/specs/hand-sorting-v1.md`.

### Table Frame Sizing

- Frame uses `width: fit-content` so it wraps card content exactly.
- `min-width` is tied to the control section width.
- `max-width` is `calc(100vw − 24px)` — frame never overflows the viewport.
- Frame is always centered on the page.
- `body { min-width: 640px }` — viewports narrower than the 4-column control grid get a horizontal scrollbar instead of layout collapse.

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

### Current Deck

`standard52-classic` — one standard 52-card deck with SVG card faces.

---

## Project Tracking

| File | Purpose |
|---|---|
| `DEVELOPMENT_TRACKER.md` | Feature delivery status |
| `DECISION_LOG.md` | Confirmed product decisions |
| `DEBUG_GLITCHES.md` | Defect and regression tracker |
| `PROJECT_STATUS.md` | POC lifecycle status, constraints, promotion triggers |
