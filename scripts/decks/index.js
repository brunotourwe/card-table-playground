#!/usr/bin/env node

const path = require("path");
const {
  generateDeckIndex,
  generateDeckRuntimeBundle,
  toPosixPath,
  REPO_ROOT
} = require("./lib");

const indexResult = generateDeckIndex();
console.log(`INDEX ${toPosixPath(path.relative(REPO_ROOT, indexResult.indexPath))}`);
const runtimeResult = generateDeckRuntimeBundle(indexResult.payload);
console.log(`RUNTIME ${toPosixPath(path.relative(REPO_ROOT, runtimeResult.runtimePath))}`);
