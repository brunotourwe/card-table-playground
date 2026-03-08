"use strict";

const { catalog } = require("@ctp/card-transition-contract");
const coverage = require("../transition-lab-feature-coverage.js");

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function run() {
  assert(Array.isArray(catalog), "Catalog must be an array.");
  assert(catalog.length > 0, "Catalog must not be empty.");
  assert(coverage && typeof coverage === "object", "Coverage map must be an object.");

  const idRe = /^[A-Z]\.([1-9][0-9]*)$/;
  const seen = new Set();
  const byLetter = new Map();

  for (const entry of catalog) {
    assert(entry && typeof entry === "object", "Catalog entries must be objects.");
    assert(typeof entry.id === "string", "Catalog entry id must be string.");
    const match = entry.id.match(idRe);
    assert(Boolean(match), `Invalid feature id format: ${entry.id}`);

    const letter = entry.id.split(".")[0];
    const nr = Number(match[1]);

    assert(!seen.has(entry.id), `Duplicate feature id: ${entry.id}`);
    seen.add(entry.id);

    if (!byLetter.has(letter)) {
      byLetter.set(letter, []);
    }
    byLetter.get(letter).push(nr);

    assert(typeof entry.category === "string" && entry.category.length > 0, `Missing category for ${entry.id}`);
    assert(entry.category.startsWith(`${letter}.`), `Category prefix mismatch for ${entry.id}: ${entry.category}`);
  }

  for (const [letter, numbers] of byLetter.entries()) {
    numbers.sort((a, b) => a - b);
    for (let i = 0; i < numbers.length; i += 1) {
      const expected = i + 1;
      const actual = numbers[i];
      assert(actual === expected, `Non-contiguous numbering for ${letter}: expected ${letter}.${expected}, got ${letter}.${actual}`);
    }
  }

  const allIds = new Set(catalog.map((entry) => entry.id));
  for (const [scenario, ids] of Object.entries(coverage)) {
    assert(Array.isArray(ids), `Coverage '${scenario}' must be array.`);
    const local = new Set();
    for (const id of ids) {
      assert(typeof id === "string", `Coverage id in '${scenario}' must be string.`);
      assert(allIds.has(id), `Coverage id '${id}' in scenario '${scenario}' missing in catalog.`);
      assert(!local.has(id), `Duplicate coverage id '${id}' in scenario '${scenario}'.`);
      local.add(id);
    }
  }

  const testableCount = catalog.filter((entry) => entry.testable !== false).length;
  const coveredUnion = new Set();
  Object.values(coverage).forEach((ids) => ids.forEach((id) => coveredUnion.add(id)));

  console.log("transition-feature-catalog-test: ok");
  console.log(`  catalog features: ${catalog.length}`);
  console.log(`  testable features: ${testableCount}`);
  console.log(`  covered feature ids in lab matrix: ${coveredUnion.size}`);
  console.log(`  scenarios in coverage map: ${Object.keys(coverage).length}`);
}

run();
