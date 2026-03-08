(function () {
  const stageEl = document.getElementById("lab-stage");
  const scenarioSelectEl = document.getElementById("scenario-select");
  const reducedMotionToggleEl = document.getElementById("reduced-motion-toggle");
  const runScenarioBtn = document.getElementById("run-scenario-btn");
  const resetLabBtn = document.getElementById("reset-lab-btn");
  const runCustomBtn = document.getElementById("run-custom-btn");
  const customTransitionInputEl = document.getElementById("custom-transition-input");
  const eventLogEl = document.getElementById("event-log");
  const splitterEl = document.getElementById("lab-splitter");
  const featureListEl = document.getElementById("feature-list");
  const featureCoverageSummaryEl = document.getElementById("feature-coverage-summary");

  const FEATURE_CATALOG = Array.isArray(window.TRANSITION_FEATURE_CATALOG)
    ? window.TRANSITION_FEATURE_CATALOG
    : [];
  const FEATURE_COVERAGE = (window.TRANSITION_LAB_FEATURE_COVERAGE && typeof window.TRANSITION_LAB_FEATURE_COVERAGE === "object")
    ? window.TRANSITION_LAB_FEATURE_COVERAGE
    : {};

  if (!(stageEl instanceof HTMLElement)) {
    throw new Error("Transition lab requires #lab-stage.");
  }

  const LAB_PANEL_WIDTH_STORAGE_KEY = "ctp:transition-lab-panel-width";
  const MIN_PANEL_WIDTH_PX = 280;
  const MAX_PANEL_WIDTH_PX = 760;
  const CARD_TRANSITION_SCHEMA_VERSION = "ctp.card-transition.v1";

  const zoneRenderProfile = {
    schemaVersion: "ctp.zone-render-profile.v1",
    profileId: "transition-lab-v1",
    defaults: {
      clipMode: "none",
      overflowBehavior: "visible",
      clipPaddingPx: 0
    },
    layers: [
      { layerId: "table_base", zIndex: 1 },
      { layerId: "trick_cards", zIndex: 20 },
      { layerId: "hand_cards", zIndex: 30 }
    ],
    zones: [
      {
        zoneId: "deck.main",
        layerId: "hand_cards",
        xPct: 12,
        yPct: 50,
        widthPct: 13,
        heightPct: 21,
        clipMode: "none"
      },
      {
        zoneId: "hand.p1",
        layerId: "hand_cards",
        xPct: 35,
        yPct: 76,
        widthPct: 52,
        heightPct: 20,
        clipMode: "none"
      },
      {
        zoneId: "hand.p2",
        layerId: "hand_cards",
        xPct: 35,
        yPct: 4,
        widthPct: 52,
        heightPct: 20,
        clipMode: "none"
      },
      {
        zoneId: "table.trick.slot1",
        layerId: "trick_cards",
        xPct: 46,
        yPct: 40,
        widthPct: 8,
        heightPct: 14,
        clipMode: "rounded_rect",
        clipRadiusPx: 10,
        overflowBehavior: "clip"
      },
      {
        zoneId: "table.trick.slot2",
        layerId: "trick_cards",
        xPct: 40,
        yPct: 46,
        widthPct: 8,
        heightPct: 14,
        clipMode: "rounded_rect",
        clipRadiusPx: 10,
        overflowBehavior: "clip"
      },
      {
        zoneId: "table.trick.slot3",
        layerId: "trick_cards",
        xPct: 52,
        yPct: 46,
        widthPct: 8,
        heightPct: 14,
        clipMode: "rounded_rect",
        clipRadiusPx: 10,
        overflowBehavior: "clip"
      },
      {
        zoneId: "table.trick.slot4",
        layerId: "trick_cards",
        xPct: 46,
        yPct: 52,
        widthPct: 8,
        heightPct: 14,
        clipMode: "rounded_rect",
        clipRadiusPx: 10,
        overflowBehavior: "clip"
      },
      {
        zoneId: "table.playfield",
        layerId: "trick_cards",
        xPct: 3,
        yPct: 3,
        widthPct: 94,
        heightPct: 94,
        clipMode: "rounded_rect",
        clipRadiusPx: 16,
        overflowBehavior: "clip"
      }
    ]
  };

  const scenarios = {
    draw() {
      return [
        {
          schemaVersion: CARD_TRANSITION_SCHEMA_VERSION,
          transitionId: "draw-lab-1",
          transactionId: "turn-1-draw",
          cardRef: { instanceId: "8h#1" },
          action: "draw",
          from: { zoneId: "deck.main", anchor: "center" },
          to: { zoneId: "hand.p1", anchor: "center", offsetPx: { x: 130, y: -18 } },
          timing: {
            durationMs: 420,
            easing: "ease-out",
            phases: [
              { name: "lift", durationMs: 100 },
              { name: "flight", durationMs: 250 },
              { name: "settle", durationMs: 70 }
            ]
          },
          path: { type: "arc", arcHeightPx: 80 },
          orientation: { startTiltDeg: -2, endTiltDeg: 8, endRotateDeg: 4 },
          visibilityPolicy: {
            mode: "face_down_until_arrival",
            startFace: "face_down",
            endFace: "face_up",
            flipAnimation: {
              durationMs: 280,
              easing: "ease-out",
              axis: "y",
              revealAtProgress: 0.56
            }
          },
          stateCommitPolicy: { mode: "on_complete" },
          insertPolicy: {
            mode: "ghost_until_commit",
            containerZoneId: "hand.p1",
            indexStrategy: "append"
          },
          interruptPolicy: { mode: "complete_fast", completeFastDurationMs: 90 },
          events: { emit: ["on_start", "on_flip", "on_commit", "on_complete"], channel: "lab" }
        }
      ];
    },

    deal1() {
      return [
        {
          schemaVersion: CARD_TRANSITION_SCHEMA_VERSION,
          transitionId: "deal1-lab-1",
          transactionId: "deal-round-1",
          cardRef: "qs#2",
          action: "deal",
          from: { zoneId: "deck.main" },
          to: { zoneId: "hand.p2", anchor: "center", offsetPx: { x: -120, y: 12 } },
          timing: { durationMs: 320, easing: "cubic-bezier(0.22, 0.8, 0.24, 1)" },
          path: { type: "bezier", controlPoints: [{ x: -10, y: -38 }, { x: 24, y: -60 }] },
          orientation: { startTiltDeg: 0, endTiltDeg: -6 },
          visibilityPolicy: { mode: "face_down_always" },
          stateCommitPolicy: { mode: "on_start" },
          interruptPolicy: { mode: "snap_to_end" }
        }
      ];
    },

    deal4() {
      const base = {
        schemaVersion: CARD_TRANSITION_SCHEMA_VERSION,
        transactionId: "deal-round-4-wave-1",
        action: "deal",
        from: { zoneId: "deck.main" },
        visibilityPolicy: { mode: "face_down_always" },
        stateCommitPolicy: { mode: "on_start" },
        interruptPolicy: { mode: "snap_to_end" },
        concurrency: { groupId: "deal-wave-1", mode: "simultaneous", maxParallel: 4 }
      };

      return [
        {
          ...base,
          transitionId: "deal4-a",
          cardRef: "7d#3",
          to: { zoneId: "hand.p1", anchor: "center", offsetPx: { x: -150, y: -12 } },
          timing: { durationMs: 300 },
          sequence: { orderIndex: 0, staggerMs: 60, batchSize: 4, waveIndex: 1 },
          path: { type: "arc", arcHeightPx: 55 },
          orientation: { endTiltDeg: -8 }
        },
        {
          ...base,
          transitionId: "deal4-b",
          cardRef: "9s#4",
          to: { zoneId: "hand.p2", anchor: "center", offsetPx: { x: -120, y: 12 } },
          timing: { durationMs: 300 },
          sequence: { orderIndex: 1, staggerMs: 60, batchSize: 4, waveIndex: 1 },
          path: { type: "arc", arcHeightPx: 65 },
          orientation: { endTiltDeg: 6 }
        },
        {
          ...base,
          transitionId: "deal4-c",
          cardRef: "ah#5",
          to: { zoneId: "table.trick.slot2", anchor: "center" },
          timing: { durationMs: 300 },
          sequence: { orderIndex: 2, staggerMs: 60, batchSize: 4, waveIndex: 1 },
          path: { type: "arc", arcHeightPx: 75 },
          orientation: { endTiltDeg: -2 }
        },
        {
          ...base,
          transitionId: "deal4-d",
          cardRef: "kc#6",
          to: { zoneId: "table.trick.slot3", anchor: "center" },
          timing: { durationMs: 300 },
          sequence: { orderIndex: 3, staggerMs: 60, batchSize: 4, waveIndex: 1 },
          path: { type: "arc", arcHeightPx: 75 },
          orientation: { endTiltDeg: 3 }
        }
      ];
    },

    deal4OnePlayer() {
      const base = {
        schemaVersion: CARD_TRANSITION_SCHEMA_VERSION,
        transactionId: "deal-round-4-single-player-wave-1",
        action: "deal",
        from: { zoneId: "deck.main" },
        to: { zoneId: "hand.p1", anchor: "center" },
        visibilityPolicy: { mode: "face_down_always" },
        stateCommitPolicy: { mode: "on_start" },
        interruptPolicy: { mode: "snap_to_end" },
        concurrency: { groupId: "deal-one-player-wave-1", mode: "simultaneous", maxParallel: 4 },
        timing: { durationMs: 320 }
      };

      return [
        {
          ...base,
          transitionId: "deal4p1-a",
          cardRef: "qh#9",
          to: { zoneId: "hand.p1", anchor: "center", offsetPx: { x: -170, y: -14 } },
          sequence: { orderIndex: 0, batchSize: 4, waveIndex: 1, staggerMs: 80 },
          path: { type: "arc", arcHeightPx: 65 },
          orientation: { endTiltDeg: -9 }
        },
        {
          ...base,
          transitionId: "deal4p1-b",
          cardRef: "9d#10",
          to: { zoneId: "hand.p1", anchor: "center", offsetPx: { x: -55, y: -18 } },
          sequence: { orderIndex: 1, batchSize: 4, waveIndex: 1, staggerMs: 80 },
          path: { type: "arc", arcHeightPx: 70 },
          orientation: { endTiltDeg: -3 }
        },
        {
          ...base,
          transitionId: "deal4p1-c",
          cardRef: "as#11",
          to: { zoneId: "hand.p1", anchor: "center", offsetPx: { x: 60, y: -18 } },
          sequence: { orderIndex: 2, batchSize: 4, waveIndex: 1, staggerMs: 80 },
          path: { type: "arc", arcHeightPx: 70 },
          orientation: { endTiltDeg: 4 }
        },
        {
          ...base,
          transitionId: "deal4p1-d",
          cardRef: "kc#12",
          to: { zoneId: "hand.p1", anchor: "center", offsetPx: { x: 175, y: -14 } },
          sequence: { orderIndex: 3, batchSize: 4, waveIndex: 1, staggerMs: 80 },
          path: { type: "arc", arcHeightPx: 65 },
          orientation: { endTiltDeg: 10 }
        }
      ];
    },

    deal4AsOneBlock() {
      const offsets = [-132, -44, 44, 132];
      const cards = ["6h#41", "10s#42", "ad#43", "qc#44"];
      return cards.map((cardRef, index) => ({
        schemaVersion: CARD_TRANSITION_SCHEMA_VERSION,
        transitionId: `deal4block-${index + 1}`,
        transactionId: "deal-4-one-block-seatS-round1",
        cardRef,
        action: "deal",
        from: { zoneId: "deck.main", anchor: "center" },
        to: { zoneId: "hand.p1", anchor: "center", offsetPx: { x: offsets[index], y: -16 } },
        timing: { durationMs: 360, easing: "cubic-bezier(0.22, 0.8, 0.24, 1)" },
        path: { type: "arc", arcHeightPx: 70 },
        visibilityPolicy: { mode: "face_down_always" },
        stateCommitPolicy: { mode: "on_start" },
        sequence: {
          orderIndex: index,
          batchSize: 4,
          waveIndex: 1,
          staggerMs: 0,
          packetId: "p1",
          packetSlotIndex: index,
          holdFormationUntilProgress: 0.8,
          formationCompactness: 0.02
        },
        concurrency: {
          groupId: "deal-4-one-block-seatS-round1",
          mode: "simultaneous",
          maxParallel: 4
        },
        interruptPolicy: { mode: "snap_to_end" }
      }));
    },

    deal445Blocks() {
      const handOffsets = [-228, -190, -152, -114, -76, -38, 0, 38, 76, 114, 152, 190, 228];
      const cardIds = ["7h#21", "8c#22", "kd#23", "2s#24", "9h#25", "ac#26", "10d#27", "3s#28", "jh#29", "4c#30", "qs#31", "5d#32", "as#33"];
      const packetByIndex = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3];
      const batchByPacket = { 1: 4, 2: 4, 3: 5 };
      const slotByPacket = { 1: 0, 2: 0, 3: 0 };

      return cardIds.map((cardRef, index) => {
        const packetNr = packetByIndex[index];
        const packetSlotIndex = slotByPacket[packetNr];
        slotByPacket[packetNr] += 1;
        return {
          schemaVersion: CARD_TRANSITION_SCHEMA_VERSION,
          transitionId: `deal445-${index + 1}`,
          transactionId: "deal-445-seatS-round1",
          cardRef,
          action: "deal",
          from: { zoneId: "deck.main", anchor: "center" },
          to: { zoneId: "hand.p1", anchor: "center", offsetPx: { x: handOffsets[index], y: -16 } },
          timing: { durationMs: 360, easing: "cubic-bezier(0.22, 0.8, 0.24, 1)" },
          path: { type: "arc", arcHeightPx: 72 },
          visibilityPolicy: { mode: "face_down_always" },
          stateCommitPolicy: { mode: "on_start" },
          sequence: {
            orderIndex: index,
            batchSize: batchByPacket[packetNr],
            waveIndex: packetNr,
            staggerMs: 430,
            packetId: `p${packetNr}`,
            packetSlotIndex,
            holdFormationUntilProgress: 0.72,
            formationCompactness: 0.03
          },
          concurrency: {
            groupId: "deal-445-seatS-round1",
            mode: "wave",
            maxParallel: 5
          },
          interruptPolicy: { mode: "snap_to_end" }
        };
      });
    },

    hiddenReveal() {
      return [
        {
          schemaVersion: CARD_TRANSITION_SCHEMA_VERSION,
          transitionId: "hidden-reveal-1",
          transactionId: "trick-4-seatE",
          cardRef: "jd#7",
          action: "play",
          from: { zoneId: "hand.p2", anchor: "center", offsetPx: { x: 120, y: 10 } },
          to: { zoneId: "table.trick.slot1", anchor: "center" },
          timing: {
            durationMs: 620,
            easing: "linear",
            phases: [
              { name: "launch", durationMs: 140 },
              { name: "flight", durationMs: 360 },
              { name: "land", durationMs: 120 }
            ]
          },
          path: { type: "linear" },
          visibilityPolicy: {
            mode: "flip_at_progress",
            flipProgress: 0.85,
            startFace: "face_down",
            endFace: "face_up",
            flipAnimation: {
              durationMs: 340,
              easing: "ease-out",
              axis: "y",
              revealAtProgress: 0.58
            },
            perAudience: [
              { audienceId: "seat:E", face: "face_up" },
              { audienceId: "observer", face: "face_down" }
            ]
          },
          stateCommitPolicy: { mode: "on_progress", progress: 0.85 },
          interruptPolicy: { mode: "cancel" },
          events: { emit: ["on_start", "on_flip", "on_commit", "on_complete"], channel: "lab" }
        }
      ];
    },

    flipOnStart() {
      return [
        {
          schemaVersion: CARD_TRANSITION_SCHEMA_VERSION,
          transitionId: "flip-on-start-1",
          transactionId: "flip-demo-start-1",
          cardRef: "kh#13",
          action: "reveal",
          from: { zoneId: "hand.p1", anchor: "center", offsetPx: { x: -160, y: -16 } },
          to: { zoneId: "table.trick.slot4", anchor: "center" },
          timing: { durationMs: 620, easing: "cubic-bezier(0.22, 0.8, 0.24, 1)" },
          path: { type: "arc", arcHeightPx: 64 },
          orientation: { startTiltDeg: -6, endTiltDeg: 3, endRotateDeg: 4 },
          visibilityPolicy: {
            mode: "flip_on_start",
            startFace: "face_down",
            endFace: "face_up",
            flipAnimation: {
              durationMs: 520,
              easing: "ease-in",
              axis: "y",
              revealAtProgress: 0.62
            }
          },
          stateCommitPolicy: { mode: "on_complete" },
          interruptPolicy: { mode: "snap_to_end" },
          events: { emit: ["on_start", "on_flip", "on_commit", "on_complete"], channel: "lab" }
        }
      ];
    },

    interruptReconnect() {
      return [
        {
          schemaVersion: CARD_TRANSITION_SCHEMA_VERSION,
          transitionId: "interrupt-lab-1",
          transactionId: "resync-1",
          cardRef: "qc#8",
          action: "draw",
          from: { zoneId: "deck.main", anchor: "center" },
          to: { zoneId: "hand.p1", anchor: "center", offsetPx: { x: -80, y: -18 } },
          timing: { durationMs: 1400, easing: "linear" },
          path: { type: "arc", arcHeightPx: 130 },
          orientation: { startTiltDeg: 0, endTiltDeg: 15 },
          visibilityPolicy: {
            mode: "flip_on_complete",
            startFace: "face_down",
            endFace: "face_up",
            flipAnimation: {
              durationMs: 420,
              easing: "ease-in",
              axis: "x",
              revealAtProgress: 0.5
            }
          },
          stateCommitPolicy: { mode: "on_complete" },
          interruptPolicy: { mode: "complete_fast", completeFastDurationMs: 140 },
          events: { emit: ["on_start", "on_interrupt", "on_commit", "on_complete"], channel: "lab" }
        }
      ];
    }
  };

  function getCoveredFeatureIdsForScenario(scenarioKey) {
    const ids = FEATURE_COVERAGE[scenarioKey];
    if (!Array.isArray(ids)) {
      return new Set();
    }
    return new Set(ids);
  }

  function renderFeatureCatalogForScenario(scenarioKey) {
    if (!(featureListEl instanceof HTMLElement)) {
      return;
    }
    const covered = getCoveredFeatureIdsForScenario(scenarioKey);
    const lines = [];
    let coveredCount = 0;

    featureListEl.innerHTML = "";
    for (const feature of FEATURE_CATALOG) {
      const row = document.createElement("div");
      row.className = "feature-item";
      const isCovered = covered.has(feature.id);
      if (isCovered) {
        row.dataset.covered = "true";
        coveredCount += 1;
      }

      const idEl = document.createElement("span");
      idEl.className = "feature-item__id";
      idEl.textContent = feature.id;

      const labelEl = document.createElement("span");
      labelEl.className = "feature-item__label";
      const tail = feature.testable === false ? " [not in lab yet]" : "";
      labelEl.textContent = `${feature.category} - ${feature.label}${tail}`;

      row.appendChild(idEl);
      row.appendChild(labelEl);
      featureListEl.appendChild(row);
      lines.push(feature.id);
    }

    if (featureCoverageSummaryEl instanceof HTMLElement) {
      featureCoverageSummaryEl.textContent = `Scenario '${scenarioKey}' covers ${coveredCount}/${FEATURE_CATALOG.length} feature IDs.`;
    }
  }

  function initializePanelResizer() {
    if (!(splitterEl instanceof HTMLElement)) {
      return;
    }

    const saved = Number(window.sessionStorage.getItem(LAB_PANEL_WIDTH_STORAGE_KEY));
    if (Number.isFinite(saved)) {
      const clamped = Math.max(MIN_PANEL_WIDTH_PX, Math.min(MAX_PANEL_WIDTH_PX, Math.round(saved)));
      document.documentElement.style.setProperty("--lab-panel-width", `${clamped}px`);
    }

    const handlePointerMove = (event) => {
      const viewportWidth = window.innerWidth || 1200;
      const maxByViewport = Math.max(MIN_PANEL_WIDTH_PX, Math.min(MAX_PANEL_WIDTH_PX, viewportWidth - 680));
      const width = Math.max(MIN_PANEL_WIDTH_PX, Math.min(maxByViewport, Math.round(event.clientX)));
      document.documentElement.style.setProperty("--lab-panel-width", `${width}px`);
      window.sessionStorage.setItem(LAB_PANEL_WIDTH_STORAGE_KEY, String(width));
    };

    const stop = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stop);
    };

    splitterEl.addEventListener("pointerdown", (event) => {
      if (window.matchMedia("(max-width: 1100px)").matches) {
        return;
      }
      event.preventDefault();
      splitterEl.setPointerCapture(event.pointerId);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stop);
    });
  }

  class TransitionEngine {
    constructor(config) {
      this.stageEl = config.stageEl;
      this.zoneProfile = config.zoneProfile;
      this.log = config.log;
      this.reducedMotion = false;
      this.layers = new Map();
      this.zoneElements = new Map();
      this.activeTransitions = new Map();
      this.committedTransitions = new Set();
      this.flipStates = new WeakMap();
      this._renderProfile();
    }

    setReducedMotion(next) {
      this.reducedMotion = Boolean(next);
    }

    reset() {
      for (const active of this.activeTransitions.values()) {
        active.cancel("reset");
      }
      this.activeTransitions.clear();
      this.committedTransitions.clear();
      for (const layerEl of this.layers.values()) {
        layerEl.innerHTML = "";
      }
      this.log("lab", "reset");
    }

    async runBatch(transitions) {
      const validated = transitions.map((transition) => this._validateTransition(transition));
      const tasks = validated.map((transition) => {
        const delayMs = this._resolveBatchDelayMs(transition);
        return this._delay(delayMs).then(() => this.runTransition(transition));
      });
      return Promise.all(tasks);
    }

    runTransition(transition) {
      const validated = this._validateTransition(transition);
      const sprite = this._createSprite(validated);
      const sequence = validated.sequence || {};
      if (Number.isInteger(sequence.packetSlotIndex)) {
        sprite.style.zIndex = String(100 + sequence.packetSlotIndex);
      } else if (Number.isInteger(sequence.orderIndex)) {
        sprite.style.zIndex = String(100 + sequence.orderIndex);
      }
      const layerId = this._resolveLayerId(validated.to.zoneId, validated.from.zoneId);
      const layerEl = this.layers.get(layerId);
      if (!(layerEl instanceof HTMLElement)) {
        throw new Error(`Missing layer '${layerId}'.`);
      }
      layerEl.appendChild(sprite);

      const fromAnchor = this._resolveAnchor(validated.from);
      const toAnchor = this._resolveAnchor(validated.to);
      const packetMotion = this._resolvePacketMotion(validated, toAnchor);
      const durations = this._resolveDurations(validated);
      const commitGate = this._resolveCommitGate(validated);
      const flipGate = this._resolveFlipGate(validated);
      const startAt = performance.now();
      let flipped = false;
      let committed = false;
      let interrupted = false;
      let finishing = false;
      let rafId = 0;

      this._setSpritePose(sprite, fromAnchor.x, fromAnchor.y, validated, 0);
      this._applyFaceForStart(sprite, validated);
      this._emitTransitionEvent(validated, "on_start", { progress: 0 });

      const complete = (nowMs) => {
        if (finishing) {
          return;
        }
        finishing = true;
        const now = Number.isFinite(nowMs) ? nowMs : performance.now();

        if (!flipped && flipGate != null) {
          this._flipSprite(sprite, validated, false, now);
          flipped = true;
          this._emitTransitionEvent(validated, "on_flip", { progress: 1 });
        }

        if (!committed) {
          committed = true;
          this.committedTransitions.add(validated.transitionId);
          this._emitTransitionEvent(validated, "on_commit", { progress: 1 });
        }

        const finalize = (stamp) => {
          this._updateFlipTween(sprite, validated, stamp);
          this._setSpritePose(sprite, toAnchor.x, toAnchor.y, validated, 1);
          if (this._isFlipAnimating(sprite)) {
            rafId = window.requestAnimationFrame(finalize);
            return;
          }
          this._emitTransitionEvent(validated, "on_complete", { progress: 1 });
          this.activeTransitions.delete(validated.transitionId);
        };

        rafId = window.requestAnimationFrame(finalize);
      };

      const cancel = (reason) => {
        interrupted = true;
        window.cancelAnimationFrame(rafId);
        this.activeTransitions.delete(validated.transitionId);
        sprite.remove();
        this._emitTransitionEvent(validated, "on_interrupt", { progress: 0, reason });
      };

      const finishFast = (durationFastMs) => {
        interrupted = true;
        window.cancelAnimationFrame(rafId);

        const fastStartX = Number(sprite.dataset.x || fromAnchor.x);
        const fastStartY = Number(sprite.dataset.y || fromAnchor.y);
        const fastStart = performance.now();

        const stepFast = (now) => {
          const elapsed = now - fastStart;
          const t = Math.max(0, Math.min(1, elapsed / Math.max(1, durationFastMs)));
          const nx = fastStartX + ((toAnchor.x - fastStartX) * t);
          const ny = fastStartY + ((toAnchor.y - fastStartY) * t);
          if (!flipped && flipGate != null && t >= flipGate) {
            this._flipSprite(sprite, validated, false, now);
            flipped = true;
            this._emitTransitionEvent(validated, "on_flip", { progress: t });
          }
          this._updateFlipTween(sprite, validated, now);
          this._setSpritePose(sprite, nx, ny, validated, t);
          if (t < 1) {
            rafId = window.requestAnimationFrame(stepFast);
            return;
          }
          complete(now);
        };

        rafId = window.requestAnimationFrame(stepFast);
      };

      const interrupt = (forcedMode) => {
        const mode = forcedMode || validated.interruptPolicy.mode;

        if (mode === "cancel") {
          cancel("cancel");
          return;
        }

        if (mode === "snap_to_end") {
          window.cancelAnimationFrame(rafId);
          complete();
          return;
        }

        if (mode === "complete_fast") {
          const fastMs = validated.interruptPolicy.completeFastDurationMs || 120;
          finishFast(fastMs);
          return;
        }
      };

      const step = (now) => {
        if (interrupted) {
          return;
        }

        const elapsed = now - startAt;
        const visualProgress = durations.visualDurationMs <= 0
          ? 1
          : Math.max(0, Math.min(1, elapsed / durations.visualDurationMs));
        const authoritativeProgress = durations.authoritativeDurationMs <= 0
          ? 1
          : Math.max(0, Math.min(1, elapsed / durations.authoritativeDurationMs));
        const eased = this._ease(visualProgress, validated.timing.easing);
        const pathToAnchor = packetMotion.enabled ? packetMotion.packetToAnchor : toAnchor;
        const pointBase = this._computePathPoint(validated, fromAnchor, pathToAnchor, eased);
        const point = this._applyPacketMotion(pointBase, packetMotion, visualProgress);

        if (!flipped && flipGate != null && authoritativeProgress >= flipGate) {
          this._flipSprite(sprite, validated, false, now);
          flipped = true;
          this._emitTransitionEvent(validated, "on_flip", { progress: authoritativeProgress });
        }
        this._updateFlipTween(sprite, validated, now);
        this._setSpritePose(sprite, point.x, point.y, validated, eased);

        if (!committed && commitGate != null && authoritativeProgress >= commitGate) {
          committed = true;
          this.committedTransitions.add(validated.transitionId);
          this._emitTransitionEvent(validated, "on_commit", { progress: authoritativeProgress });
        }

        if (authoritativeProgress >= 1) {
          complete(now);
          return;
        }

        rafId = window.requestAnimationFrame(step);
      };

      const task = new Promise((resolve) => {
        const stopWatch = window.setInterval(() => {
          if (!this.activeTransitions.has(validated.transitionId)) {
            window.clearInterval(stopWatch);
            resolve();
          }
        }, 16);
      });

      this.activeTransitions.set(validated.transitionId, {
        transition: validated,
        sprite,
        interrupt,
        cancel,
        commitGate,
        flipGate,
        getProgress: () => {
          const currentX = Number(sprite.dataset.x || fromAnchor.x);
          const total = Math.max(1, Math.abs(toAnchor.x - fromAnchor.x) + Math.abs(toAnchor.y - fromAnchor.y));
          const covered = Math.abs(currentX - fromAnchor.x);
          return Math.max(0, Math.min(1, covered / total));
        }
      });

      rafId = window.requestAnimationFrame(step);
      return task;
    }

    interruptTransition(transitionId, forcedMode) {
      const active = this.activeTransitions.get(transitionId);
      if (!active) {
        return false;
      }
      active.interrupt(forcedMode);
      return true;
    }

    reconcileTransition(transition) {
      const validated = this._validateTransition(transition);
      const layerId = this._resolveLayerId(validated.to.zoneId, validated.from.zoneId);
      const layerEl = this.layers.get(layerId);
      if (!(layerEl instanceof HTMLElement)) {
        return;
      }
      const sprite = this._createSprite(validated);
      const toAnchor = this._resolveAnchor(validated.to);
      this._setSpritePose(sprite, toAnchor.x, toAnchor.y, validated, 1);
      this._flipSprite(sprite, validated, true, performance.now());
      this._updateFlipTween(sprite, validated, performance.now());
      this._setSpritePose(sprite, toAnchor.x, toAnchor.y, validated, 1);
      layerEl.appendChild(sprite);
      this.committedTransitions.add(validated.transitionId);
      this._emitTransitionEvent(validated, "on_commit", { progress: 1, reconciled: true });
      this._emitTransitionEvent(validated, "on_complete", { progress: 1, reconciled: true });
    }

    _renderProfile() {
      this.stageEl.innerHTML = "";
      this.layers.clear();
      this.zoneElements.clear();

      for (const layer of this.zoneProfile.layers) {
        const layerEl = document.createElement("div");
        layerEl.className = "lab-layer";
        layerEl.style.zIndex = String(layer.zIndex || 1);
        layerEl.dataset.layerId = layer.layerId;
        this.stageEl.appendChild(layerEl);
        this.layers.set(layer.layerId, layerEl);
      }

      for (const zone of this.zoneProfile.zones) {
        const zoneEl = document.createElement("div");
        zoneEl.className = "lab-zone";
        zoneEl.dataset.zoneId = zone.zoneId;
        zoneEl.style.left = `${zone.xPct}%`;
        zoneEl.style.top = `${zone.yPct}%`;
        zoneEl.style.width = `${zone.widthPct}%`;
        zoneEl.style.height = `${zone.heightPct}%`;

        const zoneLabel = document.createElement("span");
        zoneLabel.className = "lab-zone__label";
        zoneLabel.textContent = zone.zoneId;
        zoneEl.appendChild(zoneLabel);
        this.stageEl.appendChild(zoneEl);
        this.zoneElements.set(zone.zoneId, zoneEl);

        const ownerLayer = this.layers.get(zone.layerId);
        if (!(ownerLayer instanceof HTMLElement)) {
          continue;
        }

        const clipMode = zone.clipMode || this.zoneProfile.defaults.clipMode || "none";
        const overflowBehavior = zone.overflowBehavior || this.zoneProfile.defaults.overflowBehavior || "visible";

        if (clipMode !== "none") {
          ownerLayer.style.overflow = overflowBehavior === "visible" ? "visible" : "hidden";
          if (clipMode === "rounded_rect") {
            ownerLayer.style.borderRadius = `${zone.clipRadiusPx || 0}px`;
          }
        }
      }
    }

    _validateTransition(raw) {
      if (!raw || typeof raw !== "object") {
        throw new Error("Transition must be an object.");
      }
      const required = [
        "schemaVersion",
        "transitionId",
        "cardRef",
        "action",
        "from",
        "to",
        "timing",
        "visibilityPolicy",
        "stateCommitPolicy",
        "interruptPolicy"
      ];

      for (const key of required) {
        if (!(key in raw)) {
          throw new Error(`Missing required field '${key}'.`);
        }
      }

      if (raw.schemaVersion !== CARD_TRANSITION_SCHEMA_VERSION) {
        throw new Error(`Unsupported schemaVersion '${raw.schemaVersion}'.`);
      }

      return raw;
    }

    _resolveLayerId(toZoneId, fromZoneId) {
      const toZone = this.zoneProfile.zones.find((zone) => zone.zoneId === toZoneId);
      if (toZone) {
        return toZone.layerId;
      }
      const fromZone = this.zoneProfile.zones.find((zone) => zone.zoneId === fromZoneId);
      if (fromZone) {
        return fromZone.layerId;
      }
      return this.zoneProfile.layers[0].layerId;
    }

    _resolveAnchor(zoneRef) {
      const zoneEl = this.zoneElements.get(zoneRef.zoneId);
      if (!(zoneEl instanceof HTMLElement)) {
        throw new Error(`Unknown zone '${zoneRef.zoneId}'.`);
      }
      const stageRect = this.stageEl.getBoundingClientRect();
      const zoneRect = zoneEl.getBoundingClientRect();
      const anchor = zoneRef.anchor || "center";
      const offset = zoneRef.offsetPx || { x: 0, y: 0 };

      let local = {
        center: [0.5, 0.5],
        top: [0.5, 0.0],
        right: [1.0, 0.5],
        bottom: [0.5, 1.0],
        left: [0.0, 0.5],
        top_left: [0.0, 0.0],
        top_right: [1.0, 0.0],
        bottom_left: [0.0, 1.0],
        bottom_right: [1.0, 1.0]
      }[anchor] || [0.5, 0.5];

      if (
        anchor === "custom" &&
        zoneRef.anchorVector &&
        typeof zoneRef.anchorVector.x === "number" &&
        typeof zoneRef.anchorVector.y === "number"
      ) {
        local = [
          Math.max(0, Math.min(1, (zoneRef.anchorVector.x + 1) / 2)),
          Math.max(0, Math.min(1, (zoneRef.anchorVector.y + 1) / 2))
        ];
      }

      return {
        x: (zoneRect.left - stageRect.left) + (zoneRect.width * local[0]) + (offset.x || 0),
        y: (zoneRect.top - stageRect.top) + (zoneRect.height * local[1]) + (offset.y || 0)
      };
    }

    _resolveDurations(transition) {
      const baseDurationMs = Math.max(0, transition.timing.durationMs || 0);
      let visualDurationMs = baseDurationMs;
      let authoritativeDurationMs = baseDurationMs;

      if (!this.reducedMotion || !transition.accessibility || transition.accessibility.reducedMotionMode === "none") {
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

    _resolveBatchDelayMs(transition) {
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

    _resolvePacketMotion(transition, toAnchor) {
      const sequence = transition.sequence || {};
      if (typeof sequence.packetId !== "string" || sequence.packetId.length === 0) {
        return { enabled: false };
      }

      const hold = Math.max(0, Math.min(1, Number(sequence.holdFormationUntilProgress || 0)));
      if (hold <= 0) {
        return { enabled: false };
      }

      const compactness = Math.max(0, Math.min(1, Number(sequence.formationCompactness || 0)));
      const packetToAnchor = this._resolveAnchor({ ...transition.to, offsetPx: { x: 0, y: 0 } });
      const finalOffset = {
        x: toAnchor.x - packetToAnchor.x,
        y: toAnchor.y - packetToAnchor.y
      };

      return {
        enabled: true,
        holdProgress: hold,
        compactness,
        packetToAnchor,
        finalOffset
      };
    }

    _resolvePacketSpreadScale(packetMotion, visualProgress) {
      if (!packetMotion || !packetMotion.enabled) {
        return 1;
      }
      const p = Math.max(0, Math.min(1, visualProgress));
      const h = packetMotion.holdProgress;
      if (p <= h) {
        return packetMotion.compactness;
      }
      if (h >= 1) {
        return packetMotion.compactness;
      }
      const tail = (p - h) / (1 - h);
      return packetMotion.compactness + (tail * (1 - packetMotion.compactness));
    }

    _applyPacketMotion(point, packetMotion, visualProgress) {
      if (!packetMotion || !packetMotion.enabled) {
        return point;
      }
      const spread = this._resolvePacketSpreadScale(packetMotion, visualProgress);
      return {
        x: point.x + (packetMotion.finalOffset.x * spread),
        y: point.y + (packetMotion.finalOffset.y * spread)
      };
    }

    _resolveCommitGate(transition) {
      const policy = transition.stateCommitPolicy || { mode: "on_complete" };
      if (policy.mode === "on_start") {
        return 0;
      }
      if (policy.mode === "on_progress") {
        return Math.max(0, Math.min(1, Number(policy.progress || 0)));
      }
      return 1;
    }

    _resolveFlipGate(transition) {
      const policy = transition.visibilityPolicy || { mode: "face_up_always" };
      if (policy.mode === "face_up_always" || policy.mode === "face_down_always") {
        return null;
      }
      if (policy.mode === "flip_on_start") {
        return 0;
      }
      if (policy.mode === "flip_at_progress") {
        return Math.max(0, Math.min(1, Number(policy.flipProgress || 0)));
      }
      return 1;
    }

    _createSprite(transition) {
      const sprite = document.createElement("div");
      sprite.className = "card-sprite";
      sprite.dataset.transitionId = transition.transitionId;

      const front = document.createElement("div");
      front.className = "card-sprite__face card-sprite__front";
      const cardLabel = typeof transition.cardRef === "string"
        ? transition.cardRef
        : transition.cardRef.instanceId || "card";
      const frontConcealed = document.createElement("span");
      frontConcealed.className = "card-sprite__front-concealed";
      frontConcealed.textContent = "concealed";
      const frontLabel = document.createElement("span");
      frontLabel.className = "card-sprite__front-label";
      frontLabel.textContent = cardLabel;
      front.appendChild(frontConcealed);
      front.appendChild(frontLabel);

      const back = document.createElement("div");
      back.className = "card-sprite__face card-sprite__back";
      back.textContent = "concealed";

      sprite.appendChild(front);
      sprite.appendChild(back);
      return sprite;
    }

    _applyFaceForStart(sprite, transition) {
      const state = this._ensureFlipState(sprite, transition);
      state.currentFace = state.startFace;
      state.toFace = state.startFace;
      state.fromAngleDeg = state.startFace === "face_down" ? 180 : 0;
      state.toAngleDeg = state.fromAngleDeg;
      state.angleDeg = state.fromAngleDeg;
      state.startedAtMs = 0;
      state.isAnimating = false;
      this._setFlipReveal(sprite, state.startFace === "face_up");
    }

    _flipSprite(sprite, transition, forceFaceUp, nowMs) {
      const state = this._ensureFlipState(sprite, transition);
      const targetFace = forceFaceUp ? "face_up" : state.endFace;
      const targetAngle = targetFace === "face_down" ? 180 : 0;
      const startAngle = Number(state.angleDeg);
      const hasDistance = Math.abs(targetAngle - startAngle) > 0.001;
      const instant = forceFaceUp === true;

      state.fromAngleDeg = startAngle;
      state.toAngleDeg = targetAngle;
      state.toFace = targetFace;
      state.startedAtMs = Number.isFinite(nowMs) ? nowMs : performance.now();
      state.isAnimating = !instant && hasDistance && state.durationMs > 0;

      if (!state.isAnimating) {
        state.angleDeg = targetAngle;
        state.currentFace = targetFace;
        this._setFlipReveal(sprite, targetFace === "face_up");
      }
    }

    _computePathPoint(transition, from, to, t) {
      const path = transition.path || { type: "linear" };
      const type = path.type || "linear";

      if (type === "teleport") {
        return t < 1 ? { x: from.x, y: from.y } : { x: to.x, y: to.y };
      }

      if (type === "bezier" && Array.isArray(path.controlPoints) && path.controlPoints.length >= 2) {
        const c1 = path.controlPoints[0];
        const c2 = path.controlPoints[1];
        const p0 = from;
        const p1 = { x: from.x + c1.x, y: from.y + c1.y };
        const p2 = { x: to.x + c2.x, y: to.y + c2.y };
        const p3 = to;
        return cubicBezierPoint(p0, p1, p2, p3, t);
      }

      const lx = from.x + ((to.x - from.x) * t);
      const ly = from.y + ((to.y - from.y) * t);

      if (type === "arc") {
        const arcHeight = Number(path.arcHeightPx || 50);
        return {
          x: lx,
          y: ly - (Math.sin(Math.PI * t) * arcHeight)
        };
      }

      return { x: lx, y: ly };
    }

    _setSpritePose(sprite, x, y, transition, t) {
      const orientation = transition.orientation || {};
      const startTilt = Number(orientation.startTiltDeg || 0);
      const endTilt = Number(orientation.endTiltDeg || 0);
      const startRotate = Number(orientation.startRotateDeg || 0);
      const endRotate = Number(orientation.endRotateDeg || 0);
      const tilt = startTilt + ((endTilt - startTilt) * t);
      const rot = startRotate + ((endRotate - startRotate) * t);
      const flipState = this._ensureFlipState(sprite, transition);
      const flipAxis = flipState.axis === "x" ? "X" : "Y";
      const flipAngleDeg = Number(flipState.angleDeg || 0);

      sprite.style.left = `${x}px`;
      sprite.style.top = `${y}px`;
      sprite.style.rotate = `${rot}deg`;
      sprite.style.transform = `translate(-50%, -50%) rotate${flipAxis}(${flipAngleDeg}deg) rotate(${tilt}deg)`;
      sprite.dataset.x = String(x);
      sprite.dataset.y = String(y);
    }

    _ensureFlipState(sprite, transition) {
      const known = this.flipStates.get(sprite);
      if (known) {
        return known;
      }
      const policy = transition.visibilityPolicy || { mode: "face_up_always" };
      const startFace = this._resolveStartFace(policy);
      const state = {
        startFace,
        endFace: this._resolveEndFace(policy, startFace),
        axis: this._resolveFlipAxis(policy.flipAnimation),
        durationMs: this._resolveFlipDurationMs(policy.flipAnimation),
        easing: this._resolveFlipEasing(policy.flipAnimation),
        revealAtProgress: this._resolveFlipRevealProgress(policy.flipAnimation),
        currentFace: startFace,
        toFace: startFace,
        fromAngleDeg: startFace === "face_down" ? 180 : 0,
        toAngleDeg: startFace === "face_down" ? 180 : 0,
        angleDeg: startFace === "face_down" ? 180 : 0,
        startedAtMs: 0,
        isAnimating: false
      };
      sprite.dataset.flipAxis = state.axis;
      this._setFlipReveal(sprite, startFace === "face_up");
      this.flipStates.set(sprite, state);
      return state;
    }

    _resolveStartFace(policy) {
      if (policy && (policy.startFace === "face_up" || policy.startFace === "face_down")) {
        return policy.startFace;
      }
      if (!policy) {
        return "face_up";
      }
      if (
        policy.mode === "face_down_always" ||
        policy.mode === "face_down_until_arrival" ||
        policy.mode === "flip_on_complete" ||
        policy.mode === "flip_at_progress" ||
        policy.mode === "flip_at_phase"
      ) {
        return "face_down";
      }
      return "face_up";
    }

    _resolveEndFace(policy, fallbackStartFace) {
      if (policy && (policy.endFace === "face_up" || policy.endFace === "face_down")) {
        return policy.endFace;
      }
      if (!policy) {
        return fallbackStartFace;
      }
      if (policy.mode === "face_down_always") {
        return "face_down";
      }
      if (policy.mode === "face_up_always") {
        return "face_up";
      }
      if (
        policy.mode === "flip_on_start" ||
        policy.mode === "flip_on_complete" ||
        policy.mode === "flip_at_progress" ||
        policy.mode === "flip_at_phase" ||
        policy.mode === "face_down_until_arrival"
      ) {
        return "face_up";
      }
      return fallbackStartFace;
    }

    _resolveFlipDurationMs(flipAnimation) {
      if (!flipAnimation || typeof flipAnimation.durationMs !== "number") {
        return 0;
      }
      return Math.max(0, flipAnimation.durationMs);
    }

    _resolveFlipEasing(flipAnimation) {
      if (!flipAnimation || typeof flipAnimation.easing !== "string" || flipAnimation.easing.length === 0) {
        return "linear";
      }
      return flipAnimation.easing;
    }

    _resolveFlipAxis(flipAnimation) {
      return flipAnimation && flipAnimation.axis === "x" ? "x" : "y";
    }

    _resolveFlipRevealProgress(flipAnimation) {
      if (!flipAnimation || typeof flipAnimation.revealAtProgress !== "number") {
        return 0.5;
      }
      return Math.max(0, Math.min(1, flipAnimation.revealAtProgress));
    }

    _setFlipReveal(sprite, isRevealed) {
      if (isRevealed) {
        sprite.classList.add("card-sprite--revealed");
      } else {
        sprite.classList.remove("card-sprite--revealed");
      }
    }

    _updateFlipTween(sprite, transition, nowMs) {
      const state = this._ensureFlipState(sprite, transition);
      if (!state.isAnimating) {
        return;
      }
      const elapsed = Math.max(0, nowMs - state.startedAtMs);
      const progress = state.durationMs <= 0
        ? 1
        : Math.max(0, Math.min(1, elapsed / state.durationMs));
      const eased = this._ease(progress, state.easing);

      state.angleDeg = state.fromAngleDeg + ((state.toAngleDeg - state.fromAngleDeg) * eased);

      if (progress >= state.revealAtProgress) {
        this._setFlipReveal(sprite, state.toFace === "face_up");
      } else {
        this._setFlipReveal(sprite, state.currentFace === "face_up");
      }

      if (progress >= 1) {
        state.angleDeg = state.toAngleDeg;
        state.currentFace = state.toFace;
        state.isAnimating = false;
        this._setFlipReveal(sprite, state.currentFace === "face_up");
      }
    }

    _isFlipAnimating(sprite) {
      const state = this.flipStates.get(sprite);
      return Boolean(state && state.isAnimating);
    }

    _emitTransitionEvent(transition, eventName, payload) {
      if (transition.events && Array.isArray(transition.events.emit)) {
        if (!transition.events.emit.includes(eventName)) {
          return;
        }
      }
      this.log(
        transition.transitionId,
        `${eventName} ${JSON.stringify(payload)}`
      );
    }

    _ease(t, easing) {
      if (typeof easing !== "string") {
        return t;
      }
      if (easing === "linear") {
        return t;
      }
      if (easing === "ease-out") {
        return 1 - Math.pow(1 - t, 3);
      }
      if (easing === "ease-in") {
        return t * t;
      }
      if (easing.startsWith("cubic-bezier")) {
        return t;
      }
      return t;
    }

    _delay(ms) {
      return new Promise((resolve) => {
        window.setTimeout(resolve, Math.max(0, ms));
      });
    }
  }

  function cubicBezierPoint(p0, p1, p2, p3, t) {
    const inv = 1 - t;
    const x =
      (inv * inv * inv * p0.x) +
      (3 * inv * inv * t * p1.x) +
      (3 * inv * t * t * p2.x) +
      (t * t * t * p3.x);
    const y =
      (inv * inv * inv * p0.y) +
      (3 * inv * inv * t * p1.y) +
      (3 * inv * t * t * p2.y) +
      (t * t * t * p3.y);
    return { x, y };
  }

  function createLogger(logEl) {
    const lines = [];
    return {
      push(tag, message) {
        const stamp = new Date().toLocaleTimeString("en-GB", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        lines.push(`${stamp} [${tag}] ${message}`);
        if (lines.length > 180) {
          lines.shift();
        }
        if (logEl instanceof HTMLElement) {
          logEl.textContent = lines.join("\n");
          logEl.scrollTop = logEl.scrollHeight;
        }
      },
      clear() {
        lines.length = 0;
        if (logEl instanceof HTMLElement) {
          logEl.textContent = "";
        }
      }
    };
  }

  const logger = createLogger(eventLogEl);
  const engine = new TransitionEngine({
    stageEl,
    zoneProfile: zoneRenderProfile,
    log: (tag, msg) => logger.push(tag, msg)
  });

  const defaultCustom = JSON.stringify(scenarios.draw()[0], null, 2);
  if (customTransitionInputEl instanceof HTMLTextAreaElement) {
    customTransitionInputEl.value = defaultCustom;
  }

  async function runSelectedScenario() {
    const key = scenarioSelectEl.value;
    const scenarioFactory = scenarios[key];
    if (typeof scenarioFactory !== "function") {
      logger.push("lab", `Unknown scenario '${key}'.`);
      return;
    }

    engine.setReducedMotion(reducedMotionToggleEl.checked);
    logger.push("lab", `running scenario '${key}' (reducedMotion=${engine.reducedMotion})`);

    if (key === "interruptReconnect") {
      const [transition] = scenarioFactory();
      engine.runTransition(transition);
      window.setTimeout(() => {
        const interrupted = engine.interruptTransition(transition.transitionId, "cancel");
        logger.push("lab", interrupted ? "transition interrupted" : "interrupt missed (not active)");

        window.setTimeout(() => {
          logger.push("lab", "reconnect snapshot arrived -> reconcile");
          engine.reconcileTransition(transition);
        }, 320);
      }, 520);
      return;
    }

    try {
      await engine.runBatch(scenarioFactory());
      logger.push("lab", `scenario '${key}' completed`);
    } catch (error) {
      logger.push("error", String(error && error.message ? error.message : error));
    }
  }

  runScenarioBtn.addEventListener("click", () => {
    runSelectedScenario();
  });

  scenarioSelectEl.addEventListener("change", () => {
    renderFeatureCatalogForScenario(scenarioSelectEl.value);
  });

  resetLabBtn.addEventListener("click", () => {
    engine.reset();
    logger.clear();
    logger.push("lab", "cleared");
  });

  runCustomBtn.addEventListener("click", async () => {
    if (!(customTransitionInputEl instanceof HTMLTextAreaElement)) {
      return;
    }
    engine.setReducedMotion(reducedMotionToggleEl.checked);

    try {
      const parsed = JSON.parse(customTransitionInputEl.value);
      const transitions = Array.isArray(parsed) ? parsed : [parsed];
      logger.push("lab", `running custom payload (${transitions.length} transition(s))`);
      await engine.runBatch(transitions);
      logger.push("lab", "custom payload completed");
    } catch (error) {
      logger.push("error", String(error && error.message ? error.message : error));
    }
  });

  logger.push("lab", "ready");
  initializePanelResizer();
  renderFeatureCatalogForScenario(scenarioSelectEl.value);
})();
