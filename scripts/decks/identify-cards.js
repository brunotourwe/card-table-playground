"use strict";
/**
 * Identifies each exported card SVG by matching its background rect id to a
 * known grid position in the original set 4.svg, then outputs a rename map.
 *
 * Grid (confirmed by bounding-box analysis + user screenshot):
 *   row 0 = clubs, row 1 = hearts, row 2 = spades, row 3 = diamonds
 *   col 0 = A, col 1 = 2, …, col 12 = K
 */
const fs   = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Grid parameters (from bounding-box analysis of set 4.svg)
// ---------------------------------------------------------------------------
const ORIGIN_X = 68.10;
const ORIGIN_Y = 684.58;
const COL_STEP = 325.73;
const ROW_STEP = 435.35;
const SUITS    = ["clubs", "hearts", "spades", "diamonds"];
const RANKS    = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "10", "j", "q", "k"];

// ---------------------------------------------------------------------------
// SVG transform helpers (same as _find-row5.js)
// ---------------------------------------------------------------------------
function parseMatrix(str) {
  const m = str.match(/matrix\(([^)]+)\)/);
  if (m) return m[1].split(",").map(Number);
  const t = str.match(/translate\(([^)]+)\)/);
  if (t) { const p = t[1].split(/[\s,]+/).map(Number); return [1,0,0,1,p[0],p[1]||0]; }
  const s = str.match(/scale\(([^)]+)\)/);
  if (s) { const p = s[1].split(/[\s,]+/).map(Number); const sx=p[0],sy=p[1]!==undefined?p[1]:p[0]; return [sx,0,0,sy,0,0]; }
  return [1,0,0,1,0,0];
}
function compose(parent, child) {
  const [a1,b1,c1,d1,e1,f1] = parent;
  const [a2,b2,c2,d2,e2,f2] = child;
  return [a1*a2+c1*b2, b1*a2+d1*b2, a1*c2+c1*d2, b1*c2+d1*d2,
          a1*e2+c1*f2+e1, b1*e2+d1*f2+f1];
}
function applyMatrix(m, x, y) { return [m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5]]; }

// ---------------------------------------------------------------------------
// Build rect_id → global (gx, gy) map from original set 4.svg
// ---------------------------------------------------------------------------
const origSrc = fs.readFileSync(
  path.resolve(__dirname, "../../assets/examples/set 4.svg"), "utf8");

const tokenRe = /<\/?[^>]+>/g;
const tStack  = [[1,0,0,1,0,0]];
const rectMap = {}; // rect_id → {gx, gy}
let tok;
while ((tok = tokenRe.exec(origSrc)) !== null) {
  const tag = tok[0];
  if (tag.startsWith("</")) { if (/<\/g/.test(tag)) tStack.pop(); continue; }
  const selfClose = tag.endsWith("/>");
  const name = (tag.match(/<(\w+)/) || [])[1];
  if (name === "g") {
    const ta = (tag.match(/transform="([^"]+)"/) || [])[1];
    const m  = ta ? parseMatrix(ta) : [1,0,0,1,0,0];
    const combined = compose(tStack[tStack.length-1], m);
    if (!selfClose) tStack.push(combined);
    continue;
  }
  if (name === "rect") {
    const rxA = (tag.match(/\brx="([^"]+)"/) || [])[1];
    if (!rxA) continue;
    const x = parseFloat((tag.match(/\bx="([^"]+)"/) || [])[1] || "0");
    const y = parseFloat((tag.match(/\by="([^"]+)"/) || [])[1] || "0");
    const w = parseFloat((tag.match(/\bwidth="([^"]+)"/) || [])[1] || "0");
    const h = parseFloat((tag.match(/\bheight="([^"]+)"/) || [])[1] || "0");
    if (w < 100 || h < 100) continue;
    const id = (tag.match(/\bid="([^"]+)"/) || [])[1];
    if (!id) continue;
    const cur = tStack[tStack.length-1];
    const [gx,gy]   = applyMatrix(cur, x, y);
    const [gx2,gy2] = applyMatrix(cur, x+w, y+h);
    rectMap[id] = { gx: Math.min(gx,gx2), gy: Math.min(gy,gy2) };
  }
}

function posToRowCol(gx, gy) {
  return {
    row: Math.round((gy - ORIGIN_Y) / ROW_STEP),
    col: Math.round((gx - ORIGIN_X) / COL_STEP),
  };
}

// ---------------------------------------------------------------------------
// Process each exported SVG
// ---------------------------------------------------------------------------
const SVG_DIR = path.resolve(__dirname, "../../assets/examples/Card Faces SVG");
const files   = fs.readdirSync(SVG_DIR).filter(f => f.endsWith(".svg")).sort();

const renameMap = []; // {from, to, note}
const unmapped  = [];

for (const file of files) {
  const src = fs.readFileSync(path.join(SVG_DIR, file), "utf8");

  // Special case: layer1-0.svg contains "Joker" text → color joker
  if (/<tspan[^>]*>Joker</.test(src)) {
    renameMap.push({ from: file, to: "joker_color.svg", note: "Joker text found" });
    continue;
  }

  // Find the background rect (card shape, has rx attribute, large dimensions)
  const rectTagMatch = src.match(/<rect[^>]+\brx=[^>]+>/);
  let identified = false;

  if (rectTagMatch) {
    const idMatch = rectTagMatch[0].match(/\bid="([^"]+)"/);
    const id = idMatch ? idMatch[1] : null;
    if (id && rectMap[id]) {
      const { gx, gy } = rectMap[id];
      const { row, col } = posToRowCol(gx, gy);
      if (row >= 0 && row < 4 && col >= 0 && col < 13) {
        const suit = SUITS[row];
        const rank = RANKS[col];
        renameMap.push({ from: file, to: `${rank}_of_${suit}.svg`, note: `row${row} col${col}` });
        identified = true;
      }
    }
  }

  if (!identified) {
    unmapped.push({ file, hasColor: /#d40000|#131f67|#e2cf00/.test(src) });
  }
}

// ---------------------------------------------------------------------------
// Handle unmapped files (blank + b/w joker)
// ---------------------------------------------------------------------------
// The b/w joker has no background rect with rx (or an unrecognised one) and no "Joker" text,
// but likely has MORE paths than the blank card.
unmapped.sort((a, b) => {
  // Proxy for complexity: count path elements
  const countPaths = ({ file }) =>
    (fs.readFileSync(path.join(SVG_DIR, file), "utf8").match(/<path/g) || []).length;
  return countPaths(b) - countPaths(a); // descending complexity
});

if (unmapped.length >= 1) {
  renameMap.push({ from: unmapped[0].file, to: "joker_bw.svg", note: "unmapped, most complex" });
}
for (let i = 1; i < unmapped.length; i++) {
  renameMap.push({ from: unmapped[i].file, to: `_unknown_${i}.svg`, note: "unmapped" });
}

// ---------------------------------------------------------------------------
// Output summary
// ---------------------------------------------------------------------------
console.log(`Mapped ${renameMap.filter(r => !r.to.startsWith("_unknown")).length} of 55 files\n`);

// Show unmapped separately
const unknowns = renameMap.filter(r => r.to.startsWith("_unknown"));
if (unknowns.length) {
  console.log("UNMAPPED (need manual check):");
  unknowns.forEach(r => console.log(`  ${r.from}  →  ${r.to}`));
  console.log("");
}

// Sort output by suit then rank for readability
const order = r => {
  const si = SUITS.indexOf(r.to.split("_of_")[1]?.replace(".svg","")) * 100;
  const ri = RANKS.indexOf(r.to.split("_of_")[0]);
  return si + ri;
};
const standard = renameMap.filter(r => r.to.includes("_of_")).sort((a,b) => order(a)-order(b));
const specials  = renameMap.filter(r => !r.to.includes("_of_") && !r.to.startsWith("_unknown"));

console.log("Special cards:");
specials.forEach(r => console.log(`  ${r.from}  →  ${r.to}  (${r.note})`));
console.log("\nStandard cards:");
standard.forEach(r => console.log(`  ${r.from}  →  ${r.to}`));

// ---------------------------------------------------------------------------
// Write shell copy script
// ---------------------------------------------------------------------------
const OUT_DIR = path.resolve(__dirname, "../../assets/decks/standard52-color/cards");
const lines   = [
  "#!/bin/sh",
  `# Auto-generated by identify-cards.js`,
  `SRC="${SVG_DIR.replace(/ /g, "\\ ")}"`,
  `DST="${OUT_DIR}"`,
  `mkdir -p "$DST"`,
  "",
  ...renameMap
    .filter(r => !r.to.startsWith("_unknown"))
    .map(r => `cp "$SRC/${r.from}" "$DST/${r.to}"`),
];
const scriptPath = path.resolve(__dirname, "../../scripts/decks/copy-renamed-cards.sh");
fs.writeFileSync(scriptPath, lines.join("\n") + "\n");
console.log(`\nShell script written to: scripts/decks/copy-renamed-cards.sh`);
