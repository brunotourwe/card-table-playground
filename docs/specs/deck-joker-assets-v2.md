# Deck-Native Joker Discovery v2

This document defines the v2 setup model where joker assets stay inside deck folders and are discovered globally at runtime.

## Scope

- Deck source remains `assets/decks/*/deck.json`.
- User deck selector shows only 52-card base decks.
- Joker picker shows all joker designs discovered across valid deck manifests.
- Runtime joker count constraint: `0..4`.
- Runtime joker mode: one selected joker design duplicated `jokerCount` times.
- Default joker design on `jokersEnabled=true`: latest previously selected joker design.

## Folder Structure

```text
assets/
  decks/
    <deckFolder>/
      deck.json
      cards/
        *.svg
      .normalized/
        deck.normalized.json
        cards/
          *.svg
    decks.index.json
```

Notes:
- Joker assets remain native to each deck in `cards/`.
- No standalone `assets/jokers` directory is used.

## Deck Manifest Contract

`assets/decks/<deckFolder>/deck.json`

Current manifest schema remains unchanged (v1), including optional joker entries:
- `rank: "JOKER"`
- `suit: null`
- `asset: "cards/<joker-file>.svg"`

Runtime behavior:
- Base deck build always starts from canonical 52 rank+suit cards.
- Any deck-manifest joker entries are ignored for base deck size and are used as discoverable joker designs for setup.

## Derived Runtime Joker Catalog

The app builds a derived in-memory joker catalog by scanning all valid deck manifests:

- Include cards where `rank === "JOKER"` and `assetPath` resolves to a normalized SVG.
- Deduplicate by `deckId + cardId` (or fallback `deckId + assetPath`).
- Preserve source provenance for future recommendation logic.

Derived joker entry shape:

```json
{
  "jokerId": "standard54-english:JOKER-COLOR",
  "title": "Joker (Standard 54 English)",
  "sourceDeckId": "standard54-english",
  "cardId": "JOKER-COLOR",
  "assetPath": "assets/decks/standard54-english/.normalized/cards/joker_color.svg"
}
```

## Runtime Setup Contract (for UI wiring)

```json
{
  "selectedDeckId": "standard52-classic",
  "jokersEnabled": false,
  "jokerCount": 0,
  "selectedJokerId": null,
  "lastSelectedJokerId": "standard54-english:JOKER-COLOR"
}
```

Rules:
- `jokerCount` must clamp to integer `0..4`.
- When toggling jokers on and `selectedJokerId` is null, use `lastSelectedJokerId` if present.
- If no last selection exists, choose the first valid derived joker entry.

## Future Recommendation Mode

For future "best fitting joker" UX:
- Use `sourceDeckId` as the primary recommendation hint.
- If selected deck has native jokers, recommend those first.
- Otherwise, fall back to the latest-selected joker.
