#!/usr/bin/env node

const path = require("path");
const {
  discoverDeckManifestPaths,
  validateDeckAtPath,
  toPosixPath,
  REPO_ROOT
} = require("./lib");

const manifestPaths = discoverDeckManifestPaths();

if (manifestPaths.length === 0) {
  console.error("No deck manifests found under assets/decks/*/deck.json");
  process.exit(1);
}

let hasErrors = false;

manifestPaths.forEach((manifestPath) => {
  const result = validateDeckAtPath(manifestPath, { writeAnalysis: true });
  const relativeManifestPath = toPosixPath(path.relative(REPO_ROOT, manifestPath));

  if (result.errors.length === 0) {
    console.log(`OK ${relativeManifestPath}`);
  } else {
    hasErrors = true;
    console.error(`ERROR ${relativeManifestPath}`);
    result.errors.forEach((error) => {
      console.error(`  - ${error}`);
    });
  }

  result.warnings.forEach((warning) => {
    console.warn(`WARN ${relativeManifestPath}`);
    console.warn(`  - ${warning}`);
  });
});

if (hasErrors) {
  process.exit(1);
}

console.log(`Validated ${manifestPaths.length} deck manifest(s).`);
