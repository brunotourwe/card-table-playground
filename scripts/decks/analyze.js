#!/usr/bin/env node

const path = require("path");
const {
  analyzeDeckAssetsFromDirectory,
  toPosixPath,
  REPO_ROOT,
  DEFAULT_ANALYSIS_ROOT
} = require("./lib");

function parseArg(flag, fallbackValue) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index === process.argv.length - 1) {
    return fallbackValue;
  }
  return process.argv[index + 1];
}

const sourceArg = parseArg("--source", "assets/decks/standard52/cards");
const outputArg = parseArg("--output", toPosixPath(path.relative(REPO_ROOT, DEFAULT_ANALYSIS_ROOT)));

const outputRoot = path.resolve(REPO_ROOT, outputArg);
const summaries = analyzeDeckAssetsFromDirectory(sourceArg, outputRoot);

let hasErrors = false;

summaries.forEach((summary) => {
  if (summary.errors.length > 0) {
    hasErrors = true;
    console.error(`ERROR ${summary.relativePath}`);
    summary.errors.forEach((error) => console.error(`  - ${error}`));
  } else {
    console.log(`OK ${summary.relativePath} -> ${summary.outputPath}`);
  }
});

if (hasErrors) {
  process.exit(1);
}

console.log(`Analyzed ${summaries.length} SVG file(s).`);
