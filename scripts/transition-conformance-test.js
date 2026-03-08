"use strict";

const {
  examples,
  validateCardTransition,
  validateExamples
} = require("@ctp/card-transition-contract");

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value || 0)));
}

function resolveCommitGate(transition) {
  const policy = transition.stateCommitPolicy || { mode: "on_complete" };
  if (policy.mode === "on_start") {
    return 0;
  }
  if (policy.mode === "on_progress") {
    return clamp01(policy.progress);
  }
  return 1;
}

function resolveFlipGate(transition) {
  const policy = transition.visibilityPolicy || { mode: "face_up_always" };
  if (policy.mode === "face_up_always" || policy.mode === "face_down_always") {
    return null;
  }
  if (policy.mode === "flip_on_start") {
    return 0;
  }
  if (policy.mode === "flip_at_progress") {
    return clamp01(policy.flipProgress);
  }
  return 1;
}

function resolveDurations(transition, reducedMotionEnabled) {
  const baseDurationMs = Math.max(0, Number(transition.timing && transition.timing.durationMs || 0));
  let visualDurationMs = baseDurationMs;
  let authoritativeDurationMs = baseDurationMs;

  if (!reducedMotionEnabled || !transition.accessibility || transition.accessibility.reducedMotionMode === "none") {
    return { visualDurationMs, authoritativeDurationMs };
  }

  const reducedMode = transition.accessibility.reducedMotionMode || "shorten";
  const reducedDuration = typeof transition.accessibility.reducedDurationMs === "number"
    ? Math.max(0, transition.accessibility.reducedDurationMs)
    : Math.round(baseDurationMs * 0.45);
  const preserveAuthoritativeEvents = transition.accessibility.preserveAuthoritativeEvents !== false;

  if (reducedMode === "snap") {
    visualDurationMs = 0;
  } else if (reducedMode === "fade") {
    visualDurationMs = Math.min(140, reducedDuration);
  } else {
    visualDurationMs = reducedDuration;
  }

  if (!preserveAuthoritativeEvents) {
    authoritativeDurationMs = visualDurationMs;
  }

  return { visualDurationMs, authoritativeDurationMs };
}

function resolveBatchDelayMs(transition) {
  const timing = transition.timing || {};
  const sequence = transition.sequence || {};
  const concurrency = transition.concurrency || {};
  const baseDelayMs = Math.max(0, Number(timing.delayMs || 0));
  const staggerMs = Math.max(0, Number(sequence.staggerMs || 0));
  const orderIndex = Math.max(0, Number(sequence.orderIndex || 0));
  const batchSize = Math.max(1, Number(sequence.batchSize || 1));
  const explicitWaveIndex = Number(sequence.waveIndex);
  const mode = typeof concurrency.mode === "string" ? concurrency.mode : "independent";

  const waveIndex = Number.isInteger(explicitWaveIndex) && explicitWaveIndex > 0
    ? (explicitWaveIndex - 1)
    : Math.floor(orderIndex / batchSize);

  if (mode === "simultaneous" || mode === "wave") {
    return baseDelayMs + (waveIndex * staggerMs);
  }

  if (mode === "staggered" || mode === "sequential") {
    return baseDelayMs + (orderIndex * staggerMs);
  }

  return baseDelayMs + (orderIndex * staggerMs);
}

function resolvePacketMotion(transition) {
  const sequence = transition.sequence || {};
  if (typeof sequence.packetId !== "string" || sequence.packetId.length === 0) {
    return { enabled: false };
  }

  const hold = clamp01(sequence.holdFormationUntilProgress);
  if (hold <= 0) {
    return { enabled: false };
  }

  return {
    enabled: true,
    holdProgress: hold,
    compactness: clamp01(sequence.formationCompactness)
  };
}

function resolvePacketSpreadScale(packetMotion, visualProgress) {
  if (!packetMotion.enabled) {
    return 1;
  }

  const p = clamp01(visualProgress);
  const h = packetMotion.holdProgress;
  if (p <= h || h >= 1) {
    return packetMotion.compactness;
  }

  const tail = (p - h) / (1 - h);
  return packetMotion.compactness + (tail * (1 - packetMotion.compactness));
}

function simulateInterrupt(transition, progress, forcedMode) {
  const p = clamp01(progress);
  const flipGate = resolveFlipGate(transition);
  const commitGate = resolveCommitGate(transition);
  const mode = forcedMode || (transition.interruptPolicy && transition.interruptPolicy.mode) || "cancel";

  let flippedBefore = flipGate != null && p >= flipGate;
  let committedBefore = commitGate != null && p >= commitGate;

  if (mode === "cancel") {
    return {
      events: ["on_start", "on_interrupt"],
      final: { flipped: flippedBefore, committed: committedBefore, completed: false }
    };
  }

  if (flipGate != null && !flippedBefore) {
    flippedBefore = true;
  }
  if (!committedBefore) {
    committedBefore = true;
  }

  const events = ["on_start"];
  if (flipGate != null && p < flipGate) {
    events.push("on_flip");
  }
  if (p < commitGate) {
    events.push("on_commit");
  }
  events.push("on_complete");

  return {
    events,
    final: { flipped: flippedBefore, committed: committedBefore, completed: true }
  };
}

function buildPacketTransitions(blockSizes) {
  const transitions = [];
  let orderIndex = 0;
  for (let packetNr = 0; packetNr < blockSizes.length; packetNr += 1) {
    const size = blockSizes[packetNr];
    for (let slot = 0; slot < size; slot += 1) {
      transitions.push({
        sequence: {
          orderIndex,
          batchSize: size,
          waveIndex: packetNr + 1,
          packetId: `p${packetNr + 1}`,
          packetSlotIndex: slot,
          holdFormationUntilProgress: 0.75,
          formationCompactness: 0.04
        }
      });
      orderIndex += 1;
    }
  }
  return transitions;
}

function testAuthoritativeGates() {
  assert(resolveCommitGate({ stateCommitPolicy: { mode: "on_start" } }) === 0, "on_start commit gate must be 0.");
  assert(resolveCommitGate({ stateCommitPolicy: { mode: "on_progress", progress: 0.85 } }) === 0.85, "on_progress commit gate mismatch.");
  assert(resolveCommitGate({ stateCommitPolicy: { mode: "on_complete" } }) === 1, "on_complete commit gate must be 1.");

  assert(resolveFlipGate({ visibilityPolicy: { mode: "face_up_always" } }) === null, "face_up_always must not have flip gate.");
  assert(resolveFlipGate({ visibilityPolicy: { mode: "flip_on_start" } }) === 0, "flip_on_start gate must be 0.");
  assert(resolveFlipGate({ visibilityPolicy: { mode: "flip_at_progress", flipProgress: 0.8 } }) === 0.8, "flip_at_progress gate mismatch.");
  assert(resolveFlipGate({ visibilityPolicy: { mode: "flip_on_complete" } }) === 1, "flip_on_complete gate must be 1.");
}

function testReducedMotionInvariant() {
  const transition = {
    timing: { durationMs: 1000 },
    accessibility: {
      reducedMotionMode: "shorten",
      reducedDurationMs: 120,
      preserveAuthoritativeEvents: true
    }
  };

  const preserved = resolveDurations(transition, true);
  assert(preserved.visualDurationMs === 120, "Reduced visual duration mismatch.");
  assert(preserved.authoritativeDurationMs === 1000, "Authoritative duration must remain unchanged when preserveAuthoritativeEvents=true.");

  const notPreserved = resolveDurations({
    timing: { durationMs: 1000 },
    accessibility: {
      reducedMotionMode: "shorten",
      reducedDurationMs: 120,
      preserveAuthoritativeEvents: false
    }
  }, true);
  assert(notPreserved.authoritativeDurationMs === 120, "Authoritative duration should follow visual when preserveAuthoritativeEvents=false.");
}

function testInterruptPolicies() {
  const transition = {
    visibilityPolicy: { mode: "flip_at_progress", flipProgress: 0.8 },
    stateCommitPolicy: { mode: "on_complete" },
    interruptPolicy: { mode: "cancel" }
  };

  const cancelled = simulateInterrupt(transition, 0.4, "cancel");
  assert(cancelled.events.join(",") === "on_start,on_interrupt", "Cancel should emit interrupt and not complete.");
  assert(cancelled.final.completed === false, "Cancel should not complete transition.");

  const snap = simulateInterrupt(transition, 0.4, "snap_to_end");
  assert(snap.events.join(",") === "on_start,on_flip,on_commit,on_complete", "Snap-to-end should force terminal events.");
  assert(snap.final.completed === true, "Snap-to-end should complete transition.");

  const fast = simulateInterrupt(transition, 0.9, "complete_fast");
  assert(fast.events.join(",") === "on_start,on_commit,on_complete", "Complete-fast should skip already-passed flip gate.");
  assert(fast.final.flipped === true, "Complete-fast should end flipped.");
  assert(fast.final.committed === true, "Complete-fast should end committed.");
}

function testBatchDelayAndBlockDealing() {
  const batchTransition = {
    timing: { delayMs: 20 },
    sequence: { orderIndex: 7, batchSize: 4, waveIndex: 2, staggerMs: 430 },
    concurrency: { mode: "wave" }
  };
  assert(resolveBatchDelayMs(batchTransition) === 450, "Wave delay must use waveIndex grouping.");

  const oneBlock = buildPacketTransitions([4]);
  assert(oneBlock.length === 4, "One block of four should produce 4 transitions.");
  assert(oneBlock.every((t) => t.sequence.packetId === "p1"), "Single block should share one packetId.");

  const mixed = buildPacketTransitions([2, 5, 3]);
  assert(mixed.length === 10, "2-5-3 should produce 10 transitions.");
  assert(mixed.filter((t) => t.sequence.packetId === "p2").length === 5, "Second packet size mismatch.");

  const motion = resolvePacketMotion({
    sequence: {
      packetId: "pA",
      holdFormationUntilProgress: 0.75,
      formationCompactness: 0.04
    }
  });
  assert(motion.enabled === true, "Packet motion should be enabled when packetId + hold > 0.");
  assert(resolvePacketSpreadScale(motion, 0.5) === 0.04, "Before hold threshold cards should stay compact.");
  assert(resolvePacketSpreadScale(motion, 1) === 1, "At completion cards should be fully spread.");
}

function testSharedContractValidation() {
  assert(Array.isArray(examples) && examples.length > 0, "Shared examples must be a non-empty array.");

  const summary = validateExamples();
  assert(summary.valid, "Shared examples should pass package validation helper.");

  const first = validateCardTransition(examples[0]);
  assert(first.valid, "First shared example should be valid.");
}

function run() {
  testAuthoritativeGates();
  testReducedMotionInvariant();
  testInterruptPolicies();
  testBatchDelayAndBlockDealing();
  testSharedContractValidation();

  console.log("transition-conformance-test: ok");
  console.log("  suites: authoritative-gates, reduced-motion, interrupts, block-dealing, shared-contract-validation");
}

run();
