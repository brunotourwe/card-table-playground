# Card Table Playground

Minimal, disposable test project for Dev Hub governance and container reuse.

## Run
- Open `index.html` in a browser.
- Enter a number from 1 to 52 and click **Draw**.
- Reload to redraw the table and cards.

## Visual Representation

This project renders playing cards using either Unicode symbols or local static
image assets.

- Card images are stored in `assets/cards/`
- Filenames follow `{rank}_of_{suit}.svg`
- Image paths are derived at render time
- The card model remains semantic and logic-focused
- A toggle controls which visual mode is shown

This project is intentionally feature-limited and serves as a visual and architectural reference.