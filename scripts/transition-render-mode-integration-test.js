"use strict";

const fs = require("fs");
const path = require("path");

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function readAppSource() {
  const appPath = path.join(__dirname, "..", "app.js");
  return fs.readFileSync(appPath, "utf8");
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} missing: ${needle}`);
}

function assertTimingBinding(source, transitionVar, label) {
  assertIncludes(
    source,
    `resolveTransitionRuntimeTiming(${transitionVar},`,
    `${label} timing binding`
  );
}

function assertOrientationBinding(source, transitionVar, label) {
  assertIncludes(
    source,
    `resolveTransitionRuntimeOrientation(${transitionVar},`,
    `${label} orientation binding`
  );
}

function assertConcealBinding(source, transitionVar, label) {
  assertIncludes(
    source,
    `resolveTransitionRuntimeStartConcealed(${transitionVar},`,
    `${label} conceal binding`
  );
}

function run() {
  const source = readAppSource();

  assertIncludes(
    source,
    'const DEFAULT_CARD_TRANSITION_RENDER_MODE = "contract";',
    "default render mode"
  );
  assertIncludes(
    source,
    'const urlMode = URL_PARAMS.get("ctmode");',
    "url ctmode selector"
  );
  assertIncludes(
    source,
    "window.__CTP_SET_CARD_TRANSITION_RENDER_MODE__ = (value) => setCardTransitionRenderMode(value, true);",
    "global render mode setter"
  );
  assertIncludes(
    source,
    "initializeCardTransitionRenderMode();",
    "render mode initialization"
  );
  assertIncludes(
    source,
    "function isContractTransitionRenderMode()",
    "render mode predicate"
  );

  assertTimingBinding(source, "drawFlightTransition", "TapTap human draw flight");
  assertOrientationBinding(source, "drawFlightTransition", "TapTap human draw flight");
  assertConcealBinding(source, "drawFlightTransition", "TapTap human draw flight");

  assertTimingBinding(source, "drawRevealTransition", "TapTap human draw reveal");
  assertTimingBinding(source, "drawInsertTransition", "TapTap human draw insert");

  assertTimingBinding(source, "botDrawTransition", "TapTap bot draw");
  assertOrientationBinding(source, "botDrawTransition", "TapTap bot draw");
  assertConcealBinding(source, "botDrawTransition", "TapTap bot draw");

  assertTimingBinding(source, "botPlayTransition", "TapTap bot play");
  assertOrientationBinding(source, "botPlayTransition", "TapTap bot play");
  assertConcealBinding(source, "botPlayTransition", "TapTap bot play");

  assertTimingBinding(source, "humanPlayTransition", "TapTap human play");

  assertTimingBinding(source, "whistHumanPlayTransition", "Whist human play");
  assertOrientationBinding(source, "whistHumanPlayTransition", "Whist human play");

  assertTimingBinding(source, "whistBotPlayTransition", "Whist bot play");
  assertOrientationBinding(source, "whistBotPlayTransition", "Whist bot play");
  assertIncludes(
    source,
    "resolveTransitionRuntimeEndsFaceUp(whistBotPlayTransition, true)",
    "Whist bot reveal gate binding"
  );

  assertTimingBinding(source, "whistCollectTransition", "Whist collect");

  console.log("transition-render-mode-integration-test: ok");
  console.log("  mode controls: legacy + contract");
  console.log("  mapped transition bindings: tap-tap + whist flows");
}

run();
