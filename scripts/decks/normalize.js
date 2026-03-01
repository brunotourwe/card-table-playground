#!/usr/bin/env node

const path = require("path");
const {
  discoverDeckManifestPaths,
  validateDeckAtPath,
  normalizeDeck,
  generateDeckIndex,
  generateDeckRuntimeBundle,
  toPosixPath,
  REPO_ROOT
} = require("./lib");

const manifestPaths = discoverDeckManifestPaths();

if (manifestPaths.length === 0) {
  console.error("No deck manifests found under assets/decks/*/deck.json");
  process.exit(1);
}

const validationResults = manifestPaths.map((manifestPath) =>
  validateDeckAtPath(manifestPath, { writeAnalysis: true })
);
const invalidDecks = validationResults.filter((result) => result.errors.length > 0);

if (invalidDecks.length > 0) {
  invalidDecks.forEach((result) => {
    console.error(`ERROR ${result.relativeManifestPath}`);
    result.errors.forEach((error) => console.error(`  - ${error}`));
  });
  process.exit(1);
}

validationResults.forEach((result) => {
  const normalized = normalizeDeck(result);
  const relativeNormalizedManifestPath = toPosixPath(
    path.relative(REPO_ROOT, normalized.normalizedManifestPath)
  );
  console.log(`NORMALIZED ${relativeNormalizedManifestPath}`);
});

const indexResult = generateDeckIndex();
console.log(`INDEX ${toPosixPath(path.relative(REPO_ROOT, indexResult.indexPath))}`);
const runtimeResult = generateDeckRuntimeBundle(indexResult.payload);
console.log(`RUNTIME ${toPosixPath(path.relative(REPO_ROOT, runtimeResult.runtimePath))}`);
