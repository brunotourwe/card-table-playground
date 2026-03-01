#!/usr/bin/env node
/**
 * split-sheet.js
 *
 * Extracts individual card SVGs from a sheet SVG using viewBox cropping.
 *
 * The source sheet ("set 4.svg") contains 55 card faces laid out on a
 * 4320×3240 coordinate grid:
 *   - Rows 1–4: 13 cards each (clubs, hearts, spades, diamonds)
 *   - Row 5:    blank template, B&W joker, colour joker
 *
 * Grid parameters were derived by parsing the SVG element transforms:
 *   Origin (col 1, row 1):  x = 68.1,   y = 684.6
 *   Column step:            325.7 units
 *   Row step:               435.3 units
 *   Card size:              275.0 × 384.6 units
 *
 * Strategy: viewBox slicing — each output file is the full original SVG
 * with only its width/height/viewBox replaced to crop to one card.
 * All <defs> (gradients, filters, etc.) are retained automatically.
 */

"use strict";

const fs   = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const INPUT_SVG  = path.resolve(__dirname, "../../assets/examples/set 4.svg");
const OUTPUT_DIR = path.resolve(__dirname, "../../assets/decks/standard52-color/cards");

// Grid layout (SVG viewBox units)
const ORIGIN_X  = 68.1;
const ORIGIN_Y  = 684.6;
const COL_STEP  = 325.7;
const ROW_STEP  = 435.3;
const CARD_W    = 275.0;
const CARD_H    = 384.6;
const MARGIN    = 1;    // extra units around each card to avoid clipping

// Card identity maps (row index → suit, col index → rank prefix)
const SUITS = ["clubs", "hearts", "spades", "diamonds"];
const RANKS = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "10", "j", "q", "k"];

// Row 5 items (col index → filename stem)
const ROW5 = [
  { col: 0, stem: "blank" },
  { col: 1, stem: "joker_bw" },
  { col: 2, stem: "joker_color" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cardViewBox(col, row) {
  const x = ORIGIN_X + col * COL_STEP - MARGIN;
  const y = ORIGIN_Y + row * ROW_STEP - MARGIN;
  const w = CARD_W + 2 * MARGIN;
  const h = CARD_H + 2 * MARGIN;
  return { x, y, w, h };
}

/**
 * Replace width, height and viewBox in the SVG opening tag.
 * Uses separate targeted regexes so attribute order doesn't matter.
 */
function sliceSvg(svgStr, col, row) {
  const { x, y, w, h } = cardViewBox(col, row);
  const vb = `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`;

  let out = svgStr;
  out = out.replace(/\bwidth="[^"]*"/, `width="${CARD_W}"`);
  out = out.replace(/\bheight="[^"]*"/, `height="${CARD_H}"`);
  out = out.replace(/\bviewBox="[^"]*"/, `viewBox="${vb}"`);
  return out;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (!fs.existsSync(INPUT_SVG)) {
  console.error(`Input SVG not found: ${INPUT_SVG}`);
  process.exit(1);
}

const svgStr = fs.readFileSync(INPUT_SVG, "utf8");
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

let count = 0;

// Rows 1–4: standard 52 cards
for (let row = 0; row < 4; row++) {
  const suit = SUITS[row];
  for (let col = 0; col < 13; col++) {
    const rank     = RANKS[col];
    const filename = `${rank}_of_${suit}.svg`;
    const cardSvg  = sliceSvg(svgStr, col, row);
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), cardSvg, "utf8");
    console.log(`  ${filename}`);
    count++;
  }
}

// Row 5: blank + jokers
for (const { col, stem } of ROW5) {
  const filename = `${stem}.svg`;
  const cardSvg  = sliceSvg(svgStr, col, 4);
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), cardSvg, "utf8");
  console.log(`  ${filename}`);
  count++;
}

console.log(`\nDone. ${count} files written to:\n  ${OUTPUT_DIR}`);
