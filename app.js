const cardTable = document.getElementById("card-table");
const tableSection = document.querySelector(".table");
const tableContainer = document.querySelector(".table-container");
const tableViewport = document.querySelector(".table-viewport");
const tableScroll = document.querySelector(".table-scroll");
const advancedControlsPanel = document.querySelector(".advanced-controls-panel");
const advancedControlsToggleButton = document.getElementById("advanced-controls-toggle");
const advancedControlsCloseButton = document.getElementById("advanced-controls-close");
const cardCountInput = document.getElementById("card-count");
const cardCountLabel = document.getElementById("card-count-label");
const deckSelect = document.getElementById("deck-select");
const jokersEnabledToggle = document.getElementById("jokers-enabled");
const jokerControls = document.getElementById("joker-controls");
const jokerCountInput = document.getElementById("joker-count");
const jokerDesignSelect = document.getElementById("joker-design-select");
const statusMessage = document.getElementById("status");
const trickDebugPanel = document.getElementById("trick-debug-panel");
const trickDebugText = document.getElementById("trick-debug-text");
const renderModeInputs = document.querySelectorAll(
  "input[name=\"render-mode\"]"
);
const viewModeInputs = document.querySelectorAll("input[name=\"view-mode\"]");
const handLayoutModeInputs = document.querySelectorAll("input[name=\"hand-layout-mode\"]");
const handDirectionInputs = document.querySelectorAll("input[name=\"hand-direction\"]");
const handSortPresetInputs = document.querySelectorAll("input[name=\"hand-sort-preset\"]");
const handLayoutControls = document.querySelectorAll(".hand-layout-control");
const cardSizeBox = document.getElementById("card-size-box");
const handSuitSortModeSelect = document.getElementById("hand-suit-sort-mode");
const rankSortEnabledToggle = document.getElementById("rank-sort-enabled");
const handRankPolicySelect = document.getElementById("hand-rank-policy");
const showCardBoundsToggle = document.getElementById("show-card-bounds");
const showHandCurveToggle = document.getElementById("show-hand-curve");
const cardSizeSlider = document.getElementById("card-size-px");
const cardSizeSliderValue = document.getElementById("card-size-px-value");
const visibilityFactorSlider = document.getElementById("visibility-factor");
const visibilityFactorSliderValue = document.getElementById("visibility-factor-value");
const alphaDegSlider = document.getElementById("alpha-deg");
const alphaDegSliderValue = document.getElementById("alpha-deg-value");
const alphaDegTitle = document.getElementById("alpha-deg-title");
const phiDegSlider = document.getElementById("phi-deg");
const phiDegSliderValue = document.getElementById("phi-deg-value");
const phiDegBox = document.getElementById("phi-deg-box");
const demoOuterDropBox = document.getElementById("demo-outer-drop-box");
const demoOuterDropSlider = document.getElementById("demo-outer-drop-pct");
const demoOuterDropSliderValue = document.getElementById("demo-outer-drop-pct-value");
const handDepthShadowToggle = document.getElementById("hand-depth-shadow-toggle");
const handDepthShadowStrengthSlider = document.getElementById("hand-depth-shadow-strength");
const handDepthShadowStrengthSliderValue = document.getElementById(
  "hand-depth-shadow-strength-value"
);
const handDepthShadowDirectionClock = document.getElementById("hand-depth-shadow-direction-clock");
const handDepthShadowDirectionValue = document.getElementById("hand-depth-shadow-direction-value");
const fanDurationSlider = document.getElementById("fan-duration-sec");
const fanDurationSliderValue = document.getElementById("fan-duration-sec-value");
const fanStepMsSlider = document.getElementById("fan-step-ms");
const fanStepMsSliderValue = document.getElementById("fan-step-ms-value");
const fanAnimateToggle = document.getElementById("fan-animate-toggle");
const trickAnimationSpeedSelect = document.getElementById("trick-animation-speed");
const trickBotAnimationModeSelect = document.getElementById("trick-bot-animation-mode");
const playMechanicModeSelect = document.getElementById("play-mechanic-mode");
const tapTapTurnDirectionSelect = document.getElementById("taptap-turn-direction");
const tapTapLogDownloadButton = document.getElementById("taptap-log-download");
const tapTapLogState = document.getElementById("taptap-log-state");

let currentCards = [];
let currentViewMode = "hand";
let availableDecks = [];
let availableJokers = [];
let activeDeck = null;
const VIEW_STORAGE_KEY = "ctp:view-mode";
const HAND_LAYOUT_MODE_STORAGE_KEY = "ctp:hand-layout-mode";
const HAND_DIRECTION_STORAGE_KEY = "ctp:hand-direction";
const CARD_HEIGHT_STORAGE_KEY = "ctp:card-height-px";
const JOKERS_ENABLED_STORAGE_KEY = "ctp:jokers-enabled";
const JOKER_COUNT_STORAGE_KEY = "ctp:joker-count";
const JOKER_SELECTED_STORAGE_KEY = "ctp:selected-joker-id";
const JOKER_LAST_SELECTED_STORAGE_KEY = "ctp:last-selected-joker-id";
const TRICK_ANIMATION_SPEED_STORAGE_KEY = "ctp:trick-animation-speed";
const TRICK_BOT_ANIMATION_MODE_STORAGE_KEY = "ctp:trick-bot-animation-mode";
const PLAY_MECHANIC_MODE_STORAGE_KEY = "ctp:play-mechanic-mode";
const TAPTAP_TURN_DIRECTION_STORAGE_KEY = "ctp:taptap-turn-direction";
const CARD_TRANSITION_RENDER_MODE_STORAGE_KEY = "ctp:card-transition-render-mode";
const HAND_DEPTH_SHADOW_STORAGE_KEY = "ctp:hand-depth-shadow";
const HAND_DEPTH_SHADOW_STRENGTH_STORAGE_KEY = "ctp:hand-depth-shadow-strength";
const HAND_DEPTH_SHADOW_DIRECTION_STORAGE_KEY = "ctp:hand-depth-shadow-direction";
const DECK_INDEX_PATH = "assets/decks/decks.index.json";
const DEFAULT_DECK_ID = "standard54-english";
const HAND_SORTING_API = globalThis.__CTP_HAND_SORTING__ ?? null;
const PRELOADED_DECK_INDEX = globalThis.__CTP_DECK_INDEX__;
const PRELOADED_DECK_MANIFESTS = globalThis.__CTP_DECK_MANIFESTS__;
const PRELOADED_SVG_MARKUP = globalThis.__CTP_DECK_SVG__;
const VIEW_SWITCH_ANIMATION_MS = 240;
const TABLE_HEIGHT_BUDGET_SAFETY_PX = 2;
const HAND_BASE_PADDING_TOP = 14;
const HAND_BASE_PADDING_BOTTOM = 14;
const HAND_BASE_CANVAS_HEIGHT = 230;
let viewSwitchTimeoutId = null;
let resizeRenderTimeoutId = null;
let handLayoutSyncTimeoutId = null;
let fanAnimationTimeoutId = null;
let renderRequestId = 0;
let isWireframeMode = false;
let fanCardTimeoutIds = [];
const normalizedDeckCache = new Map();
const svgMarkupCache = new Map();
const STANDARD_SUIT_CONFIG = [
  { suit: "spades", symbol: "♠︎" },
  { suit: "hearts", symbol: "♥︎" },
  { suit: "diamonds", symbol: "♦︎" },
  { suit: "clubs", symbol: "♣︎" }
];
const STANDARD_SUIT_SET = new Set(STANDARD_SUIT_CONFIG.map((entry) => entry.suit));
const JOKER_GROUP_KEY = "jokers";
const DEFAULT_RANK_LABELS = {
  A: "Ace",
  K: "King",
  Q: "Queen",
  J: "Jack",
  "10": "10",
  "9": "9",
  "8": "8",
  "7": "7",
  "6": "6",
  "5": "5",
  "4": "4",
  "3": "3",
  "2": "2",
  JOKER: "Joker"
};
const DEFAULT_SUIT_LABELS = {
  spades: "Spades",
  hearts: "Hearts",
  diamonds: "Diamonds",
  clubs: "Clubs"
};

const DEFAULT_VIEW_MODE = "hand";
const DEFAULT_CARD_COUNT = 13;
const DEFAULT_CARD_HEIGHT_PX = 300;
const MIN_CARD_HEIGHT_PX = 90;
const MAX_CARD_HEIGHT_PX = 400;
const DEFAULT_HAND_LAYOUT_MODE = "demo";
const DEFAULT_HAND_DIRECTION = "ltr";
const HAND_DIRECTION_CONTROL_ENABLED = false;
const DEFAULT_JOKERS_ENABLED = false;
const MIN_JOKER_COUNT = 1;
const MAX_JOKER_COUNT = 4;
const DEFAULT_JOKER_COUNT = 2;
const DEFAULT_HAND_SUIT_SORT_MODE = "auto";
const DEFAULT_RANK_SORT_ENABLED = true;
const DEFAULT_HAND_RANK_POLICY = "high_low";
const DEFAULT_VISIBILITY_FACTOR = 0.36;
const DEFAULT_ALPHA_DEG = 4;
const DEFAULT_PHI_DEG = 40;
const DEMO_MIN_ALPHA_DEG = 0.3;
const DEMO_MAX_ALPHA_DEG = 2.0;
const DEFAULT_DEMO_ALPHA_DEG = 0.8;
const DEFAULT_DEMO_OUTER_DROP_PCT = 2.0;
const DEFAULT_HAND_DEPTH_SHADOW_ENABLED = false;
const DEFAULT_HAND_DEPTH_SHADOW_STRENGTH_PCT = 100;
const MIN_HAND_DEPTH_SHADOW_STRENGTH_PCT = 0;
const MAX_HAND_DEPTH_SHADOW_STRENGTH_PCT = 200;
const DEFAULT_HAND_DEPTH_SHADOW_DIRECTION_HOUR_INDEX = 6;
const HAND_DEPTH_SHADOW_DIRECTION_STEPS = 12;
const DEFAULT_FAN_DURATION_SEC = 1.0;
const MIN_FAN_DURATION_SEC = 0.5;
const MAX_FAN_DURATION_SEC = 2.0;
const DEFAULT_FAN_STEP_MS = 50;
const MIN_FAN_STEP_MS = 10;
const MAX_FAN_STEP_MS = 100;
const CARD_ASPECT_RATIO = 0.6923076923;
const HAND_HOVER_EJECT_RATIO = 0.07;
const CARD_DRAG_START_THRESHOLD_PX = 7;
const CARD_DRAG_DIRECTION_DEADZONE_PX = 2;
const CARD_HEIGHT_WHEEL_STEP_PX = 8;
const HAND_BOTTOM_CLIP_MAX_RATIO = 0.5;
const SUIT_DRAG_GAP_SLOT_COUNT = 2;
const SUIT_DRAG_SHADOW_MODEL_ENABLED = true;
const TRICK_PHASE_DEAL_IDLE = "deal_idle";
const TRICK_PHASE_TRICK_LOCK = "trick_lock";
const TRICK_PHASE_TRICK_PLAYING = "trick_playing";
const TRICK_PHASE_TRICK_RESOLVE = "trick_resolve";
const TRICK_PHASE_TRICK_COLLECT = "trick_collect";
const LOCKED_TRICK_PHASES = new Set([
  TRICK_PHASE_TRICK_LOCK,
  TRICK_PHASE_TRICK_PLAYING,
  TRICK_PHASE_TRICK_RESOLVE,
  TRICK_PHASE_TRICK_COLLECT
]);
const DEFAULT_PLAY_MECHANIC_MODE = "whist";
const DEFAULT_TAPTAP_TURN_DIRECTION = "clockwise";
const DEFAULT_CARD_TRANSITION_RENDER_MODE = "contract";
const DEFAULT_TRICK_ANIMATION_SPEED_PRESET = "fast";
const DEFAULT_TRICK_BOT_ANIMATION_MODE = "seat_launch";
const TAPTAP_ACTION_LOG_FILENAME = "taptap-action-log.txt";
const TRICK_ANIMATION_SPEED_PRESETS = Object.freeze({
  slow: Object.freeze({
    humanFlightMs: 330,
    botFlightMs: 300,
    botStaggerMs: 220,
    highlightMs: 340,
    collectMs: 340,
    cleanupMs: 140,
    tableTiltJitterDeg: 2.8
  }),
  medium: Object.freeze({
    humanFlightMs: 250,
    botFlightMs: 230,
    botStaggerMs: 170,
    highlightMs: 280,
    collectMs: 280,
    cleanupMs: 120,
    tableTiltJitterDeg: 2.3
  }),
  fast: Object.freeze({
    humanFlightMs: 180,
    botFlightMs: 170,
    botStaggerMs: 130,
    highlightMs: 220,
    collectMs: 220,
    cleanupMs: 100,
    tableTiltJitterDeg: 1.9
  })
});
const TAPTAP_ANIMATION_SPEED_DURATION_MULTIPLIERS = Object.freeze({
  fast: 1,
  medium: 2,
  slow: 4
});
const BOT_SEAT_VISUALS = {
  W: { color: "#7bc5c8", label: "W" },
  N: { color: "#d2c27c", label: "N" },
  E: { color: "#d48ab8", label: "E" }
};
const HUMAN_SEAT_VISUAL = { xPct: 50, yPct: 92, label: "S" };
const SEAT_BORDER_MARGIN_PX = 24;
const TRICK_FLIGHT_EASING = "cubic-bezier(0.22, 0.8, 0.24, 1)";
const TRICK_COLLECT_EASING = "cubic-bezier(0.16, 0.84, 0.24, 1)";
const CARD_TRANSITION_SCHEMA_VERSION = "ctp.card-transition.v1";
const CARD_TRANSITION_LOG_LIMIT = 240;
const URL_PARAMS = new URLSearchParams(window.location.search);
const TEST_MODE = URL_PARAMS.get("test") === "1";
const TEST_SCENARIO = URL_PARAMS.get("scenario") ?? "";
const testScenarioHistory = [];
let classicAlphaDegValue = DEFAULT_ALPHA_DEG;
let demoAlphaDegValue = DEFAULT_DEMO_ALPHA_DEG;
let jokersEnabled = DEFAULT_JOKERS_ENABLED;
let jokerCount = DEFAULT_JOKER_COUNT;
let selectedJokerId = null;
let lastSelectedJokerId = null;
let handSuitSortModeBeforeRankSortOff = null;
let handHoverMode = "none";
let hoveredCardId = null;
let hoveredGroupKey = null;
let manualCardOrder = null;
let manualSuitOrder = null;
let cardDragState = null;
let trickPhase = TRICK_PHASE_DEAL_IDLE;
let dealRequestedCount = DEFAULT_CARD_COUNT;
let playerCountForDeal = 4;
let lastPlayIntentCardId = null;
let lastPlayIntentAtIso = null;
let playIntentStatusTimeoutId = null;
let trickAnimationRunToken = 0;
let trickAnimationSpeedPreset = DEFAULT_TRICK_ANIMATION_SPEED_PRESET;
let trickBotAnimationMode = DEFAULT_TRICK_BOT_ANIMATION_MODE;
let playMechanicMode = DEFAULT_PLAY_MECHANIC_MODE;
let tapTapTurnDirection = DEFAULT_TAPTAP_TURN_DIRECTION;
let trickSweepContinueCleanup = null;
let trickSweepContinueResolve = null;
let trickDebugMouseX = null;
let trickDebugMouseY = null;
let trickDebugTableCenterX = null;
let trickDebugTableCenterY = null;
let trickDebugPlayedAnchorsBySeatId = new Map();
let tapTapDrawPile = [];
let tapTapPlayedPile = [];
let tapTapHandsBySeatId = new Map();
let tapTapTurnSeatId = "S";
let tapTapTurnHasDrawn = false;
let tapTapStateActive = false;
let tapTapBotRunToken = 0;
let tapTapBotRunActive = false;
let tapTapActionRunToken = 0;
let tapTapActionInFlight = false;
let tapTapCenterPilesRenderToken = 0;
let tapTapPileAnchorsByKind = new Map();
let tapTapActionLogLines = [];
let tapTapActionLogBlobUrl = null;
let cardTransitionRenderMode = DEFAULT_CARD_TRANSITION_RENDER_MODE;
let mappedCardTransitionLogEntries = [];
let mappedCardTransitionIdCounter = 0;
let mappedCardTransitionTransactionCounter = 0;

function isFiniteAnchor(anchor) {
  return Boolean(anchor) &&
    Number.isFinite(anchor.x) &&
    Number.isFinite(anchor.y);
}

function setTapTapPileAnchor(kind, anchor) {
  if (typeof kind !== "string" || kind.length === 0) {
    return;
  }

  if (!isFiniteAnchor(anchor)) {
    tapTapPileAnchorsByKind.delete(kind);
    return;
  }

  tapTapPileAnchorsByKind.set(kind, { x: anchor.x, y: anchor.y });
}

function getTapTapPileAnchorFromCache(kind) {
  const cachedAnchor = tapTapPileAnchorsByKind.get(kind);
  return isFiniteAnchor(cachedAnchor) ? cachedAnchor : null;
}

function resetTapTapPileAnchors() {
  tapTapPileAnchorsByKind = new Map();
}

function getTapTapActionLogEntryCount() {
  if (!Array.isArray(tapTapActionLogLines) || tapTapActionLogLines.length === 0) {
    return 0;
  }

  return tapTapActionLogLines.reduce((count, line) => (
    typeof line === "string" && line.startsWith("[") ? count + 1 : count
  ), 0);
}

function updateTapTapLogControls() {
  const isTapTapHandMode = isTapTapMode() && getViewMode() === "hand";
  const entryCount = getTapTapActionLogEntryCount();
  const hasLogDownload = Boolean(tapTapActionLogBlobUrl);

  if (tapTapLogDownloadButton) {
    tapTapLogDownloadButton.disabled = !isTapTapHandMode || !hasLogDownload;
  }

  if (tapTapLogState) {
    if (!isTapTapHandMode) {
      tapTapLogState.textContent = "TapTap mode only";
      return;
    }

    tapTapLogState.textContent = hasLogDownload
      ? `Entries: ${entryCount}`
      : "No log yet";
  }
}

function refreshTapTapActionLogArtifacts() {
  const logText = Array.isArray(tapTapActionLogLines)
    ? tapTapActionLogLines.join("\n")
    : "";
  window.__CTP_TAPTAP_ACTION_LOG__ = logText;

  if (
    tapTapActionLogBlobUrl &&
    typeof URL !== "undefined" &&
    typeof URL.revokeObjectURL === "function"
  ) {
    URL.revokeObjectURL(tapTapActionLogBlobUrl);
  }
  tapTapActionLogBlobUrl = null;

  if (
    typeof Blob !== "undefined" &&
    typeof URL !== "undefined" &&
    typeof URL.createObjectURL === "function"
  ) {
    const logBlob = new Blob([logText], { type: "text/plain;charset=utf-8" });
    tapTapActionLogBlobUrl = URL.createObjectURL(logBlob);
  }

  window.__CTP_TAPTAP_ACTION_LOG_URL__ = tapTapActionLogBlobUrl;
  window.__CTP_DOWNLOAD_TAPTAP_ACTION_LOG__ = () => {
    if (!tapTapActionLogBlobUrl || typeof document === "undefined") {
      return false;
    }

    const anchor = document.createElement("a");
    anchor.href = tapTapActionLogBlobUrl;
    anchor.download = TAPTAP_ACTION_LOG_FILENAME;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return true;
  };
  updateTapTapLogControls();
}

function resetTapTapActionLog(reasonLabel = "deal initialized") {
  const reasonText = typeof reasonLabel === "string" && reasonLabel.trim().length > 0
    ? reasonLabel.trim()
    : "deal initialized";
  tapTapActionLogLines = [
    "TapTap action log",
    `Session started: ${new Date().toISOString()}`,
    `Reason: ${reasonText}`,
    ""
  ];
  refreshTapTapActionLogArtifacts();
}

function appendTapTapActionLogEntry({
  seatId,
  action,
  card = null,
  note = ""
}) {
  const actionText = typeof action === "string" && action.trim().length > 0
    ? action.trim()
    : "action";
  if (!Array.isArray(tapTapActionLogLines) || tapTapActionLogLines.length === 0) {
    resetTapTapActionLog("log auto-initialized");
  }

  const actorLabel = formatSeatTurnLabel(seatId);
  const cardText = card ? getCardPlayLabel(card) : "";
  const noteText = typeof note === "string" && note.trim().length > 0
    ? ` (${note.trim()})`
    : "";
  const cardSuffix = cardText.length > 0 ? ` ${cardText}` : "";
  tapTapActionLogLines.push(
    `[${new Date().toISOString()}] ${actorLabel} ${actionText}${cardSuffix}${noteText}`
  );
  refreshTapTapActionLogArtifacts();
}

function nextMappedCardTransitionId(prefix = "transition") {
  mappedCardTransitionIdCounter += 1;
  const safePrefix = typeof prefix === "string" && prefix.length > 0 ? prefix : "transition";
  return `${safePrefix}-${String(mappedCardTransitionIdCounter).padStart(6, "0")}`;
}

function nextMappedCardTransitionTransactionId(scope = "tx") {
  mappedCardTransitionTransactionCounter += 1;
  const safeScope = typeof scope === "string" && scope.length > 0 ? scope : "tx";
  return `${safeScope}-${String(mappedCardTransitionTransactionCounter).padStart(6, "0")}`;
}

function createCardTransitionCardRef(card, fallbackCardId = "") {
  if (card && typeof card === "object" && typeof card.cardId === "string" && card.cardId.length > 0) {
    const ref = { instanceId: card.cardId };
    if (activeDeck && typeof activeDeck.deckId === "string" && activeDeck.deckId.length > 0) {
      ref.deckId = activeDeck.deckId;
    }
    if (typeof card.rank === "string" && card.rank.length > 0) {
      ref.rank = card.rank;
    }
    if (typeof card.suit === "string" && card.suit.length > 0) {
      ref.suit = card.suit;
    }
    return ref;
  }

  if (typeof fallbackCardId === "string" && fallbackCardId.length > 0) {
    return fallbackCardId;
  }

  return "card-token";
}

function createCardTransitionZoneRef({
  zoneId,
  seatId,
  anchor = "center",
  offsetPx
}) {
  const ref = { zoneId };
  if (typeof seatId === "string" && seatId.length > 0) {
    ref.seatId = seatId;
  }
  if (typeof anchor === "string" && anchor.length > 0) {
    ref.anchor = anchor;
  }
  if (offsetPx && Number.isFinite(offsetPx.x) && Number.isFinite(offsetPx.y)) {
    ref.offsetPx = { x: offsetPx.x, y: offsetPx.y };
  }
  return ref;
}

function mapGameEventToCardTransition(event) {
  if (!event || typeof event !== "object") {
    return null;
  }

  const fromZoneId = typeof event.fromZoneId === "string" ? event.fromZoneId : "";
  const toZoneId = typeof event.toZoneId === "string" ? event.toZoneId : "";
  if (fromZoneId.length === 0 || toZoneId.length === 0) {
    return null;
  }

  const action = typeof event.action === "string" && event.action.length > 0
    ? event.action
    : "move";
  const sourceScope = typeof event.sourceScope === "string" && event.sourceScope.length > 0
    ? event.sourceScope
    : "game";
  const seatScope = typeof event.seatId === "string" && event.seatId.length > 0
    ? event.seatId
    : "seat";
  const timingDurationMs = Number.isFinite(event.durationMs)
    ? Math.max(0, Math.round(event.durationMs))
    : 180;
  const easing = typeof event.easing === "string" && event.easing.length > 0
    ? event.easing
    : TRICK_FLIGHT_EASING;

  const transition = {
    schemaVersion: CARD_TRANSITION_SCHEMA_VERSION,
    transitionId: nextMappedCardTransitionId(`${sourceScope}-${action}`),
    transactionId: typeof event.transactionId === "string" && event.transactionId.length > 0
      ? event.transactionId
      : nextMappedCardTransitionTransactionId(`${sourceScope}-${seatScope}-${action}`),
    cardRef: createCardTransitionCardRef(event.card, event.cardId),
    action,
    from: createCardTransitionZoneRef({
      zoneId: fromZoneId,
      seatId: event.fromSeatId,
      anchor: event.fromAnchor,
      offsetPx: event.fromOffsetPx
    }),
    to: createCardTransitionZoneRef({
      zoneId: toZoneId,
      seatId: event.toSeatId,
      anchor: event.toAnchor,
      offsetPx: event.toOffsetPx
    }),
    timing: {
      durationMs: timingDurationMs,
      easing
    },
    visibilityPolicy: event.visibilityPolicy && typeof event.visibilityPolicy === "object"
      ? event.visibilityPolicy
      : { mode: "face_up_always" },
    stateCommitPolicy: event.stateCommitPolicy && typeof event.stateCommitPolicy === "object"
      ? event.stateCommitPolicy
      : { mode: "on_complete" },
    interruptPolicy: event.interruptPolicy && typeof event.interruptPolicy === "object"
      ? event.interruptPolicy
      : { mode: "cancel" }
  };

  if (event.path && typeof event.path === "object") {
    transition.path = event.path;
  }
  if (event.orientation && typeof event.orientation === "object") {
    transition.orientation = event.orientation;
  }
  if (event.insertPolicy && typeof event.insertPolicy === "object") {
    transition.insertPolicy = event.insertPolicy;
  }
  if (event.sequence && typeof event.sequence === "object") {
    transition.sequence = event.sequence;
  }
  if (event.concurrency && typeof event.concurrency === "object") {
    transition.concurrency = event.concurrency;
  }
  if (event.audience && typeof event.audience === "object") {
    transition.audience = event.audience;
  }
  if (event.accessibility && typeof event.accessibility === "object") {
    transition.accessibility = event.accessibility;
  }
  if (event.events && typeof event.events === "object") {
    transition.events = event.events;
  }
  if (event.metadata && typeof event.metadata === "object") {
    transition.metadata = event.metadata;
  }

  return transition;
}

function appendMappedCardTransitionLogEntry(source, transition) {
  if (!transition || typeof transition !== "object") {
    return;
  }

  mappedCardTransitionLogEntries.push({
    atIso: new Date().toISOString(),
    source: typeof source === "string" && source.length > 0 ? source : "game",
    transition
  });

  if (mappedCardTransitionLogEntries.length > CARD_TRANSITION_LOG_LIMIT) {
    mappedCardTransitionLogEntries.splice(
      0,
      mappedCardTransitionLogEntries.length - CARD_TRANSITION_LOG_LIMIT
    );
  }

  window.__CTP_CARD_TRANSITION_LOG__ = mappedCardTransitionLogEntries.slice();
  window.__CTP_LAST_CARD_TRANSITION__ = transition;
}

function resetMappedCardTransitionLog() {
  mappedCardTransitionLogEntries = [];
  window.__CTP_CARD_TRANSITION_LOG__ = [];
  window.__CTP_LAST_CARD_TRANSITION__ = null;
}

function emitMappedCardTransitionFromGameEvent(event, source = "game") {
  try {
    const transition = mapGameEventToCardTransition(event);
    if (!transition) {
      return null;
    }
    appendMappedCardTransitionLogEntry(source, transition);
    return transition;
  } catch (error) {
    console.warn("CardTransition mapper error:", error);
    return null;
  }
}

function normalizeCardTransitionRenderMode(value) {
  return value === "contract" ? "contract" : "legacy";
}

function getStoredCardTransitionRenderMode() {
  return normalizeCardTransitionRenderMode(
    getStoredString(CARD_TRANSITION_RENDER_MODE_STORAGE_KEY)
  );
}

function setStoredCardTransitionRenderMode(value) {
  const normalized = normalizeCardTransitionRenderMode(value);
  setStoredStringOrClear(CARD_TRANSITION_RENDER_MODE_STORAGE_KEY, normalized);
}

function setCardTransitionRenderMode(value, persist = true) {
  const normalized = normalizeCardTransitionRenderMode(value);
  cardTransitionRenderMode = normalized;
  if (persist) {
    setStoredCardTransitionRenderMode(normalized);
  }
  window.__CTP_CARD_TRANSITION_RENDER_MODE__ = normalized;
  return normalized;
}

function initializeCardTransitionRenderMode() {
  const urlMode = URL_PARAMS.get("ctmode");
  const hasUrlOverride = typeof urlMode === "string" && urlMode.length > 0;
  const resolved = hasUrlOverride
    ? normalizeCardTransitionRenderMode(urlMode)
    : getStoredCardTransitionRenderMode();
  setCardTransitionRenderMode(resolved, true);
}

function isContractTransitionRenderMode() {
  return cardTransitionRenderMode === "contract";
}

function resolveTransitionRuntimeTiming(transition, fallback) {
  const fallbackDurationMs = Number.isFinite(fallback?.durationMs)
    ? Math.max(0, fallback.durationMs)
    : 0;
  const fallbackEasing = typeof fallback?.easing === "string" && fallback.easing.length > 0
    ? fallback.easing
    : TRICK_FLIGHT_EASING;

  if (!isContractTransitionRenderMode() || !transition || typeof transition !== "object") {
    return { durationMs: fallbackDurationMs, easing: fallbackEasing };
  }

  const mappedDurationMs = Number(transition.timing?.durationMs);
  const mappedEasing = transition.timing?.easing;
  return {
    durationMs: Number.isFinite(mappedDurationMs) ? Math.max(0, mappedDurationMs) : fallbackDurationMs,
    easing: typeof mappedEasing === "string" && mappedEasing.length > 0 ? mappedEasing : fallbackEasing
  };
}

function resolveTransitionRuntimeOrientation(transition, fallback) {
  const startTiltFallback = Number.isFinite(fallback?.startTiltDeg) ? fallback.startTiltDeg : 0;
  const endTiltFallback = Number.isFinite(fallback?.endTiltDeg) ? fallback.endTiltDeg : startTiltFallback;

  if (!isContractTransitionRenderMode() || !transition || typeof transition !== "object") {
    return { startTiltDeg: startTiltFallback, endTiltDeg: endTiltFallback };
  }

  const startTiltMapped = Number(transition.orientation?.startTiltDeg);
  const endTiltMapped = Number(transition.orientation?.endTiltDeg);
  return {
    startTiltDeg: Number.isFinite(startTiltMapped) ? startTiltMapped : startTiltFallback,
    endTiltDeg: Number.isFinite(endTiltMapped) ? endTiltMapped : endTiltFallback
  };
}

function resolveTransitionRuntimeStartConcealed(transition, fallbackConcealed) {
  if (!isContractTransitionRenderMode() || !transition || typeof transition !== "object") {
    return Boolean(fallbackConcealed);
  }

  const policy = transition.visibilityPolicy || {};
  if (policy.startFace === "face_down") {
    return true;
  }
  if (policy.startFace === "face_up") {
    return false;
  }

  return (
    policy.mode === "face_down_always" ||
    policy.mode === "face_down_until_arrival" ||
    policy.mode === "flip_on_complete" ||
    policy.mode === "flip_at_progress" ||
    policy.mode === "flip_at_phase"
  );
}

function resolveTransitionRuntimeEndsFaceUp(transition, fallbackFaceUp = true) {
  if (!isContractTransitionRenderMode() || !transition || typeof transition !== "object") {
    return Boolean(fallbackFaceUp);
  }

  const policy = transition.visibilityPolicy || {};
  if (policy.endFace === "face_up") {
    return true;
  }
  if (policy.endFace === "face_down") {
    return false;
  }
  if (policy.mode === "face_down_always") {
    return false;
  }
  if (policy.mode === "face_up_always") {
    return true;
  }
  if (
    policy.mode === "face_down_until_arrival" ||
    policy.mode === "flip_on_start" ||
    policy.mode === "flip_on_complete" ||
    policy.mode === "flip_at_progress" ||
    policy.mode === "flip_at_phase"
  ) {
    return true;
  }

  return Boolean(fallbackFaceUp);
}

window.__CTP_MAP_GAME_EVENT_TO_CARD_TRANSITION__ = mapGameEventToCardTransition;
window.__CTP_EMIT_MAPPED_CARD_TRANSITION__ = emitMappedCardTransitionFromGameEvent;
window.__CTP_SET_CARD_TRANSITION_RENDER_MODE__ = (value) => setCardTransitionRenderMode(value, true);

function getDeckMaxCount() {
  const baseCount =
    activeDeck && Array.isArray(activeDeck.cards) && activeDeck.cards.length > 0
      ? activeDeck.cards.length
      : 52;

  return baseCount + getJokerInjectionCount();
}

function updateCardCountRangeLabel() {
  const maxCount = getDeckMaxCount();

  if (cardCountLabel) {
    cardCountLabel.textContent = `Number of cards (1-${maxCount})`;
  }

  cardCountInput.max = `${maxCount}`;
  const currentValue = Number.parseInt(cardCountInput.value, 10);

  if (!Number.isFinite(currentValue) || currentValue < 1) {
    cardCountInput.value = `${Math.min(DEFAULT_CARD_COUNT, maxCount)}`;
    return;
  }

  if (currentValue > maxCount) {
    cardCountInput.value = `${maxCount}`;
  }
}

function getPlayerCountForDealCount(cardCount) {
  const safeCount = Number.isInteger(cardCount) ? cardCount : 0;
  if (safeCount <= 0) {
    return 4;
  }

  if (safeCount <= 13) {
    return 4;
  }

  if (safeCount <= 17) {
    return 3;
  }

  if (safeCount <= 26) {
    return 2;
  }

  return 1;
}

function getActiveBotSeatIds(currentPlayerCount = playerCountForDeal) {
  if (currentPlayerCount === 4) {
    return ["W", "N", "E"];
  }

  if (currentPlayerCount === 3) {
    return ["W", "E"];
  }

  if (currentPlayerCount === 2) {
    return ["N"];
  }

  return [];
}

function isSupportedPlayMechanicMode(value) {
  return value === "whist" || value === "taptap";
}

function isSupportedTapTapTurnDirection(value) {
  return value === "clockwise" || value === "counter_clockwise";
}

function isTapTapMode() {
  return playMechanicMode === "taptap";
}

function getStoredPlayMechanicMode() {
  const storedValue = getStoredString(PLAY_MECHANIC_MODE_STORAGE_KEY);
  return isSupportedPlayMechanicMode(storedValue)
    ? storedValue
    : DEFAULT_PLAY_MECHANIC_MODE;
}

function setStoredPlayMechanicMode(value) {
  if (isSupportedPlayMechanicMode(value)) {
    setStoredStringOrClear(PLAY_MECHANIC_MODE_STORAGE_KEY, value);
    return;
  }

  setStoredStringOrClear(PLAY_MECHANIC_MODE_STORAGE_KEY, DEFAULT_PLAY_MECHANIC_MODE);
}

function getStoredTapTapTurnDirection() {
  const storedValue = getStoredString(TAPTAP_TURN_DIRECTION_STORAGE_KEY);
  return isSupportedTapTapTurnDirection(storedValue)
    ? storedValue
    : DEFAULT_TAPTAP_TURN_DIRECTION;
}

function setStoredTapTapTurnDirection(value) {
  if (isSupportedTapTapTurnDirection(value)) {
    setStoredStringOrClear(TAPTAP_TURN_DIRECTION_STORAGE_KEY, value);
    return;
  }

  setStoredStringOrClear(TAPTAP_TURN_DIRECTION_STORAGE_KEY, DEFAULT_TAPTAP_TURN_DIRECTION);
}

function stopTapTapBotLoop() {
  tapTapBotRunToken += 1;
  tapTapBotRunActive = false;
}

function cancelTapTapActionAnimations() {
  tapTapActionRunToken += 1;
  tapTapActionInFlight = false;
  clearTrickLayer();
}

function clearTapTapState() {
  stopTapTapBotLoop();
  cancelTapTapActionAnimations();
  resetTapTapPileAnchors();
  resetTapTapActionLog("TapTap state cleared");
  tapTapDrawPile = [];
  tapTapPlayedPile = [];
  tapTapHandsBySeatId = new Map();
  tapTapTurnSeatId = "S";
  tapTapTurnHasDrawn = false;
  tapTapStateActive = false;
}

function setPlayMechanicMode(nextMode, persist = true) {
  const resolvedMode = isSupportedPlayMechanicMode(nextMode)
    ? nextMode
    : DEFAULT_PLAY_MECHANIC_MODE;
  playMechanicMode = resolvedMode;

  if (playMechanicModeSelect) {
    playMechanicModeSelect.value = resolvedMode;
  }

  if (resolvedMode !== "taptap") {
    clearTapTapState();
  }

  if (persist) {
    setStoredPlayMechanicMode(resolvedMode);
  }
}

function setTapTapTurnDirection(nextDirection, persist = true) {
  const resolvedDirection = isSupportedTapTapTurnDirection(nextDirection)
    ? nextDirection
    : DEFAULT_TAPTAP_TURN_DIRECTION;
  tapTapTurnDirection = resolvedDirection;

  if (tapTapTurnDirectionSelect) {
    tapTapTurnDirectionSelect.value = resolvedDirection;
  }

  if (persist) {
    setStoredTapTapTurnDirection(resolvedDirection);
  }
}

function initializePlayMechanicControls() {
  setPlayMechanicMode(getStoredPlayMechanicMode(), false);
  setTapTapTurnDirection(getStoredTapTapTurnDirection(), false);
}

function getTapTapSeatOrder() {
  const activeBots = getActiveBotSeatIds(playerCountForDeal);
  const playerCount = activeBots.length + 1;
  let clockwiseSeatOrder = ["S"];

  if (playerCount === 4) {
    clockwiseSeatOrder = ["S", "W", "N", "E"];
  } else if (playerCount === 3) {
    clockwiseSeatOrder = ["S", "W", "E"];
  } else if (playerCount === 2) {
    clockwiseSeatOrder = ["S", "N"];
  }

  if (tapTapTurnDirection !== "counter_clockwise") {
    return clockwiseSeatOrder;
  }

  return [clockwiseSeatOrder[0], ...clockwiseSeatOrder.slice(1).reverse()];
}

function getTapTapSeatHand(seatId) {
  const hand = tapTapHandsBySeatId.get(seatId);
  return Array.isArray(hand) ? hand : [];
}

function syncTapTapTurnLock() {
  if (!isTapTapMode() || !tapTapStateActive || getViewMode() !== "hand") {
    return;
  }

  if (tapTapTurnSeatId === "S") {
    setTrickPhase(TRICK_PHASE_DEAL_IDLE);
    return;
  }

  setTrickPhase(TRICK_PHASE_TRICK_LOCK);
}

function getTapTapNextSeatId(currentSeatId) {
  const seatOrder = getTapTapSeatOrder();
  if (!Array.isArray(seatOrder) || seatOrder.length === 0) {
    return "S";
  }

  const currentIndex = seatOrder.indexOf(currentSeatId);
  if (currentIndex < 0) {
    return seatOrder[0];
  }

  return seatOrder[(currentIndex + 1) % seatOrder.length];
}

function formatSeatTurnLabel(seatId) {
  if (seatId === "S") {
    return "You";
  }

  return `Bot ${seatId}`;
}

function areAllTapTapHandsEmpty() {
  for (const hand of tapTapHandsBySeatId.values()) {
    if (Array.isArray(hand) && hand.length > 0) {
      return false;
    }
  }

  return true;
}

function isTapTapGameExhausted() {
  return tapTapStateActive && tapTapDrawPile.length === 0 && areAllTapTapHandsEmpty();
}

function setTapTapTurnSeat(seatId) {
  tapTapTurnSeatId = seatId;
  tapTapTurnHasDrawn = false;
  syncTapTapTurnLock();
}

function advanceTapTapTurn() {
  const nextSeatId = getTapTapNextSeatId(tapTapTurnSeatId);
  setTapTapTurnSeat(nextSeatId);
  return nextSeatId;
}

function initializeTapTapStateForDeal(totalDealtCards) {
  const runtimeDeck = buildRuntimeDeckCards();
  const shuffledDeck = shuffleDeck(runtimeDeck).map((card, dealIndex) => createDealtCard(card, dealIndex));
  const safeTotalCount = Math.max(0, Math.min(totalDealtCards, shuffledDeck.length));
  const seatOrder = getTapTapSeatOrder();
  tapTapHandsBySeatId = new Map(seatOrder.map((seatId) => [seatId, []]));

  for (let dealIndex = 0; dealIndex < safeTotalCount; dealIndex += 1) {
    const seatId = seatOrder[dealIndex % seatOrder.length];
    const hand = getTapTapSeatHand(seatId);
    hand.push(shuffledDeck[dealIndex]);
    tapTapHandsBySeatId.set(seatId, hand);
  }

  tapTapDrawPile = shuffledDeck.slice(safeTotalCount);
  tapTapPlayedPile = [];
  tapTapStateActive = true;
  tapTapTurnHasDrawn = false;
  tapTapTurnSeatId = seatOrder[0] ?? "S";
  stopTapTapBotLoop();
  currentCards = getTapTapSeatHand("S").slice();
  syncTapTapTurnLock();
  resetTapTapActionLog(`new deal (${safeTotalCount} cards)`);
  resetMappedCardTransitionLog();
}

async function handleTapTapHumanDrawIntent() {
  if (!isTapTapMode() || !tapTapStateActive || getViewMode() !== "hand") {
    return false;
  }

  if (tapTapActionInFlight) {
    setStatus("TapTap: action in progress.");
    return false;
  }

  if (tapTapTurnSeatId !== "S") {
    setStatus("TapTap: wait for your turn.");
    return false;
  }

  if (tapTapTurnHasDrawn) {
    setStatus("TapTap: you already drew this turn. Play a card or skip drawing next turn.");
    return false;
  }

  if (tapTapDrawPile.length === 0) {
    setStatus("TapTap: draw pile is empty.");
    return false;
  }

  const previewCard = tapTapDrawPile[tapTapDrawPile.length - 1];
  if (!previewCard) {
    return false;
  }

  const drawStartAnchor = await resolveTapTapPileTopAnchor("draw");
  if (!drawStartAnchor) {
    setStatus("TapTap: draw stack anchor unavailable.");
    return false;
  }

  const actionToken = beginTapTapActionAnimation();
  const isRunCurrent = () => isTapTapActionAnimationCurrent(actionToken);
  const drawTransactionId = nextMappedCardTransitionTransactionId("taptap-S-draw");

  try {
    const durations = getTapTapActionDurations();
    const drawFlightTransition = emitMappedCardTransitionFromGameEvent({
      sourceScope: "taptap",
      seatId: "S",
      transactionId: drawTransactionId,
      action: "draw",
      card: previewCard,
      fromZoneId: "deck.main",
      fromSeatId: "S",
      toZoneId: "hand.S.hover",
      toSeatId: "S",
      durationMs: durations.drawMs,
      visibilityPolicy: { mode: "face_down_always" },
      stateCommitPolicy: { mode: "on_complete" },
      interruptPolicy: { mode: "cancel" },
      events: { emit: ["on_start", "on_commit", "on_complete"], channel: "taptap" },
      metadata: { actorSeatId: "S", phase: "draw_flight" }
    }, "taptap:human-draw-flight");
    const drawFlightTiming = resolveTransitionRuntimeTiming(drawFlightTransition, {
      durationMs: durations.drawMs,
      easing: TRICK_FLIGHT_EASING
    });
    const drawFlightOrientation = resolveTransitionRuntimeOrientation(drawFlightTransition, {
      startTiltDeg: 0,
      endTiltDeg: 0
    });
    const drawFlightConcealed = resolveTransitionRuntimeStartConcealed(drawFlightTransition, true);

    await animateTapTapCardTransfer({
      card: previewCard,
      startAnchor: drawStartAnchor,
      endAnchor: getTapTapHandCenterHoverAnchor(),
      concealed: drawFlightConcealed,
      startTiltDeg: drawFlightOrientation.startTiltDeg,
      endTiltDeg: drawFlightOrientation.endTiltDeg,
      durationMs: drawFlightTiming.durationMs,
      easing: drawFlightTiming.easing,
      isRunCurrent
    });

    if (!isRunCurrent()) {
      return false;
    }

    const drawnCard = tapTapDrawPile.pop();
    if (!drawnCard) {
      return false;
    }

    const drawRevealTransition = emitMappedCardTransitionFromGameEvent({
      sourceScope: "taptap",
      seatId: "S",
      transactionId: drawTransactionId,
      action: "reveal",
      card: previewCard,
      fromZoneId: "hand.S.hover",
      fromSeatId: "S",
      toZoneId: "hand.S.hover",
      toSeatId: "S",
      durationMs: durations.revealMs,
      visibilityPolicy: {
        mode: "flip_on_complete",
        startFace: "face_down",
        endFace: "face_up",
        flipAnimation: {
          durationMs: durations.revealMs,
          easing: "ease-out",
          axis: "y",
          revealAtProgress: 0.5
        }
      },
      stateCommitPolicy: { mode: "on_complete" },
      interruptPolicy: { mode: "cancel" },
      events: { emit: ["on_start", "on_flip", "on_complete"], channel: "taptap" },
      metadata: { actorSeatId: "S", phase: "draw_reveal" }
    }, "taptap:human-draw-reveal");
    const drawRevealTiming = resolveTransitionRuntimeTiming(drawRevealTransition, {
      durationMs: durations.revealMs,
      easing: TRICK_FLIGHT_EASING
    });

    await animateTapTapDrawRevealInHand(previewCard, {
      durationMs: drawRevealTiming.durationMs,
      isRunCurrent
    });

    if (!isRunCurrent()) {
      return false;
    }

    const hand = getTapTapSeatHand("S");
    hand.push(drawnCard);
    tapTapHandsBySeatId.set("S", hand);
    tapTapTurnHasDrawn = true;
    currentCards = hand.slice();
    await renderCards(currentCards);

    if (!isRunCurrent()) {
      return false;
    }

    const drawInsertTransition = emitMappedCardTransitionFromGameEvent({
      sourceScope: "taptap",
      seatId: "S",
      transactionId: drawTransactionId,
      action: "move",
      card: drawnCard,
      fromZoneId: "hand.S.hover",
      fromSeatId: "S",
      toZoneId: "hand.S",
      toSeatId: "S",
      durationMs: durations.insertMs,
      visibilityPolicy: { mode: "face_up_always" },
      stateCommitPolicy: { mode: "on_complete" },
      interruptPolicy: { mode: "cancel" },
      insertPolicy: {
        mode: "insert_on_complete",
        containerZoneId: "hand.S",
        indexStrategy: "append"
      },
      events: { emit: ["on_start", "on_commit", "on_complete"], channel: "taptap" },
      metadata: { actorSeatId: "S", phase: "draw_insert" }
    }, "taptap:human-draw-insert");
    const drawInsertTiming = resolveTransitionRuntimeTiming(drawInsertTransition, {
      durationMs: durations.insertMs,
      easing: TRICK_FLIGHT_EASING
    });

    await animateTapTapDrawSlideIntoHand(drawnCard.cardId, {
      durationMs: drawInsertTiming.durationMs,
      isRunCurrent
    });

    if (!isRunCurrent()) {
      return false;
    }

    setStatus(`TapTap: you drew ${getCardPlayLabel(drawnCard)}. Play a card.`);
    appendTapTapActionLogEntry({
      seatId: "S",
      action: "drew",
      card: drawnCard
    });
    return true;
  } finally {
    clearTrickLayer();
    endTapTapActionAnimation(actionToken);
  }
}

async function runTapTapBotTurns() {
  if (
    !isTapTapMode() ||
    !tapTapStateActive ||
    tapTapTurnSeatId === "S" ||
    tapTapBotRunActive ||
    tapTapActionInFlight
  ) {
    return;
  }

  const runToken = tapTapBotRunToken + 1;
  tapTapBotRunToken = runToken;
  tapTapBotRunActive = true;

  try {
    while (
      runToken === tapTapBotRunToken &&
      isTapTapMode() &&
      tapTapStateActive &&
      tapTapTurnSeatId !== "S"
    ) {
      const seatId = tapTapTurnSeatId;
      const hand = getTapTapSeatHand(seatId);
      const botLabel = formatSeatTurnLabel(seatId);
      const shouldDrawRandomly = tapTapDrawPile.length > 0 && Math.random() < 0.5;

      if (shouldDrawRandomly || (hand.length === 0 && tapTapDrawPile.length > 0)) {
        const previewCard = tapTapDrawPile[tapTapDrawPile.length - 1];
        if (previewCard) {
          const drawStartAnchor = await resolveTapTapPileTopAnchor("draw");
          if (!drawStartAnchor) {
            const drawnCard = tapTapDrawPile.pop();
            if (drawnCard) {
              hand.push(drawnCard);
              tapTapHandsBySeatId.set(seatId, hand);
              setStatus(`TapTap: ${botLabel} drew a card.`);
              appendTapTapActionLogEntry({
                seatId,
                action: "drew",
                card: drawnCard,
                note: "fallback-no-anchor"
              });
              updateDebugOverlays();
            }
            await waitForMs(90);
            continue;
          }

          const actionToken = beginTapTapActionAnimation();
          const isAnimationCurrent = () =>
            runToken === tapTapBotRunToken && isTapTapActionAnimationCurrent(actionToken);
          const drawTransactionId = nextMappedCardTransitionTransactionId(`taptap-${seatId}-draw`);

          try {
            const durations = getTapTapActionDurations();
            const botDrawTransition = emitMappedCardTransitionFromGameEvent({
              sourceScope: "taptap",
              seatId,
              transactionId: drawTransactionId,
              action: "draw",
              card: previewCard,
              fromZoneId: "deck.main",
              fromSeatId: seatId,
              toZoneId: `hand.${seatId}.edge`,
              toSeatId: seatId,
              durationMs: durations.drawMs,
              visibilityPolicy: { mode: "face_down_always" },
              stateCommitPolicy: { mode: "on_complete" },
              interruptPolicy: { mode: "cancel" },
              events: { emit: ["on_start", "on_commit", "on_complete"], channel: "taptap" },
              metadata: { actorSeatId: seatId, phase: "bot_draw" }
            }, "taptap:bot-draw");
            const botDrawTiming = resolveTransitionRuntimeTiming(botDrawTransition, {
              durationMs: durations.drawMs,
              easing: TRICK_FLIGHT_EASING
            });
            const botDrawOrientation = resolveTransitionRuntimeOrientation(botDrawTransition, {
              startTiltDeg: 0,
              endTiltDeg: getBotSeatBaseTiltDeg(seatId)
            });
            const botDrawConcealed = resolveTransitionRuntimeStartConcealed(botDrawTransition, true);

            await animateTapTapCardTransfer({
              card: previewCard,
              startAnchor: drawStartAnchor,
              endAnchor: getTapTapBotEdgeSeatAnchor(seatId),
              concealed: botDrawConcealed,
              startTiltDeg: botDrawOrientation.startTiltDeg,
              endTiltDeg: botDrawOrientation.endTiltDeg,
              durationMs: botDrawTiming.durationMs,
              easing: botDrawTiming.easing,
              isRunCurrent: isAnimationCurrent
            });

            if (!isAnimationCurrent()) {
              return;
            }

            const drawnCard = tapTapDrawPile.pop();
            if (drawnCard) {
              hand.push(drawnCard);
              tapTapHandsBySeatId.set(seatId, hand);
              setStatus(`TapTap: ${botLabel} drew a card.`);
              appendTapTapActionLogEntry({
                seatId,
                action: "drew",
                card: drawnCard
              });
              updateDebugOverlays();
            }

            await waitForMs(90);
          } finally {
            clearTrickLayer();
            endTapTapActionAnimation(actionToken);
          }
        }
      }

      if (hand.length > 0) {
        const playIndex = Math.floor(Math.random() * hand.length);
        const previewCard = hand[playIndex];
        if (previewCard) {
          const actionToken = beginTapTapActionAnimation();
          const isAnimationCurrent = () =>
            runToken === tapTapBotRunToken && isTapTapActionAnimationCurrent(actionToken);
          const playTransactionId = nextMappedCardTransitionTransactionId(`taptap-${seatId}-play`);

          try {
            const durations = getTapTapActionDurations();
            const targetTiltDeg = getNaturalizedTrickTableTiltDeg(
              getBotSeatBaseTiltDeg(seatId),
              1.8
            );
            const resolvedPlayedAnchor = await resolveTapTapPileTopAnchor("played");
            const playedPileAnchor = resolvedPlayedAnchor ?? getTapTapPileAnchor("played");
            const botPlayTransition = emitMappedCardTransitionFromGameEvent({
              sourceScope: "taptap",
              seatId,
              transactionId: playTransactionId,
              action: "play",
              card: previewCard,
              fromZoneId: `hand.${seatId}.edge`,
              fromSeatId: seatId,
              toZoneId: "pile.played",
              toSeatId: seatId,
              durationMs: durations.playMs,
              visibilityPolicy: { mode: "face_up_always" },
              stateCommitPolicy: { mode: "on_complete" },
              interruptPolicy: { mode: "cancel" },
              orientation: {
                startTiltDeg: getBotSeatBaseTiltDeg(seatId),
                endTiltDeg: targetTiltDeg
              },
              events: { emit: ["on_start", "on_commit", "on_complete"], channel: "taptap" },
              metadata: { actorSeatId: seatId, phase: "bot_play" }
            }, "taptap:bot-play");
            const botPlayTiming = resolveTransitionRuntimeTiming(botPlayTransition, {
              durationMs: durations.playMs,
              easing: TRICK_FLIGHT_EASING
            });
            const botPlayOrientation = resolveTransitionRuntimeOrientation(botPlayTransition, {
              startTiltDeg: getBotSeatBaseTiltDeg(seatId),
              endTiltDeg: targetTiltDeg
            });
            const botPlayConcealed = resolveTransitionRuntimeStartConcealed(botPlayTransition, false);

            await animateTapTapCardTransfer({
              card: previewCard,
              startAnchor: getTapTapBotEdgeSeatAnchor(seatId),
              endAnchor: playedPileAnchor,
              concealed: botPlayConcealed,
              startTiltDeg: botPlayOrientation.startTiltDeg,
              endTiltDeg: botPlayOrientation.endTiltDeg,
              durationMs: botPlayTiming.durationMs,
              easing: botPlayTiming.easing,
              isRunCurrent: isAnimationCurrent
            });

            if (!isAnimationCurrent()) {
              return;
            }

            const [playedCard] = hand.splice(playIndex, 1);
            if (playedCard) {
              tapTapHandsBySeatId.set(seatId, hand);
              tapTapPlayedPile.push(playedCard);
              setStatus(`TapTap: ${botLabel} played ${getCardPlayLabel(playedCard)}.`);
              appendTapTapActionLogEntry({
                seatId,
                action: "played",
                card: playedCard
              });
              updateDebugOverlays();
            }

            await waitForMs(90);
          } finally {
            clearTrickLayer();
            endTapTapActionAnimation(actionToken);
          }
        }
      } else {
        setStatus(`TapTap: ${botLabel} had no playable card.`);
        updateDebugOverlays();
        await waitForMs(180);
      }

      if (isTapTapGameExhausted()) {
        setTapTapTurnSeat("S");
        setStatus("TapTap: all cards are exhausted. Redraw to restart.");
        updateDebugOverlays();
        return;
      }

      advanceTapTapTurn();
      updateDebugOverlays();
    }
  } finally {
    if (runToken === tapTapBotRunToken) {
      tapTapBotRunActive = false;
    }
  }

  if (
    runToken === tapTapBotRunToken &&
    isTapTapMode() &&
    tapTapStateActive &&
    tapTapTurnSeatId === "S" &&
    !isTapTapGameExhausted()
  ) {
    setStatus("TapTap: your turn. Draw is optional.");
    syncTapTapTurnLock();
    updateDebugOverlays();
  }
}

function getTapTapPlayfieldCenterAnchor() {
  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    return { x: 0, y: 0 };
  }

  const playfieldRect = playfieldElement.getBoundingClientRect();
  const fallbackCardTableRect = cardTable instanceof HTMLElement
    ? cardTable.getBoundingClientRect()
    : null;
  const width = playfieldElement.clientWidth || playfieldRect.width || fallbackCardTableRect?.width || 0;
  const height = playfieldElement.clientHeight || playfieldRect.height || fallbackCardTableRect?.height || 0;

  if (width <= 0 || height <= 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: width / 2,
    y: height / 2
  };
}

function getElementCenterInPlayfield(element) {
  if (!(element instanceof HTMLElement)) {
    return null;
  }

  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    return null;
  }

  const playfieldRect = playfieldElement.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  if (!(elementRect.width > 0) || !(elementRect.height > 0)) {
    return null;
  }

  return {
    x: elementRect.left - playfieldRect.left + (elementRect.width / 2),
    y: elementRect.top - playfieldRect.top + (elementRect.height / 2)
  };
}

function getTapTapPileAnchorFromDom(pileKind) {
  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    return null;
  }

  const topLayerElement = playfieldElement.querySelector(
    `.taptap-pile--${pileKind} .taptap-pile__stack-card--top`
  );
  if (topLayerElement instanceof HTMLElement) {
    const topLayerAnchor = getElementCenterInPlayfield(topLayerElement);
    if (isFiniteAnchor(topLayerAnchor)) {
      return topLayerAnchor;
    }
  }

  const stackElement = playfieldElement.querySelector(
    `.taptap-pile--${pileKind} .taptap-pile__stack`
  );
  const stackAnchor = getElementCenterInPlayfield(stackElement);
  return isFiniteAnchor(stackAnchor) ? stackAnchor : null;
}

function refreshTapTapPileAnchorsFromDom() {
  setTapTapPileAnchor("draw", getTapTapPileAnchorFromDom("draw"));
  setTapTapPileAnchor("played", getTapTapPileAnchorFromDom("played"));
}

function getTapTapPileAnchor(pileKind) {
  const cachedAnchor = getTapTapPileAnchorFromCache(pileKind);
  if (cachedAnchor) {
    return cachedAnchor;
  }

  const domAnchor = getTapTapPileAnchorFromDom(pileKind);
  if (domAnchor) {
    setTapTapPileAnchor(pileKind, domAnchor);
    return domAnchor;
  }

  return getTapTapPlayfieldCenterAnchor();
}

function getTapTapPileTopAnchor(pileKind) {
  return getTapTapPileAnchorFromCache(pileKind) ?? getTapTapPileAnchorFromDom(pileKind);
}

async function resolveTapTapPileTopAnchor(pileKind, { attempts = 3 } = {}) {
  const safeAttempts = Math.max(1, Number.isInteger(attempts) ? attempts : 3);

  for (let attemptIndex = 0; attemptIndex < safeAttempts; attemptIndex += 1) {
    refreshTapTapPileAnchorsFromDom();
    const anchor = getTapTapPileTopAnchor(pileKind);
    if (anchor) {
      return anchor;
    }

    await updateTapTapCenterPiles();
    await waitForMs(16);
  }

  refreshTapTapPileAnchorsFromDom();
  return getTapTapPileTopAnchor(pileKind);
}

function getTapTapActionSeatAnchor(seatId) {
  return getSeatAnchorById(seatId) ?? getTapTapPlayfieldCenterAnchor();
}

function getTapTapBotEdgeSeatAnchor(seatId) {
  return getBotEdgeLaunchAnchorBySeatId(seatId) ??
    getTapTapActionSeatAnchor(seatId);
}

function getTapTapHandCenterHoverAnchor() {
  const metrics = getHandLayoutMetrics(currentCards.length);
  if (!metrics || !Array.isArray(metrics.cardLayouts) || metrics.cardLayouts.length === 0) {
    return getTapTapActionSeatAnchor("S");
  }

  const minLeft = Math.min(...metrics.cardLayouts.map((layout) => layout.left));
  const maxRight = Math.max(...metrics.cardLayouts.map((layout) => layout.left + metrics.cardWidth));
  const minTop = Math.min(...metrics.cardLayouts.map((layout) => layout.top));
  const maxBottom = Math.max(...metrics.cardLayouts.map((layout) => layout.top + metrics.cardHeight));
  const handCenterX = (minLeft + maxRight) / 2;
  const handCenterY = (minTop + maxBottom) / 2;
  const hoverY = handCenterY - (metrics.cardHeight * 0.5);
  const handCenterAnchorInTable = {
    x: handCenterX,
    y: hoverY
  };

  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    return getTapTapActionSeatAnchor("S");
  }

  const playfieldRect = playfieldElement.getBoundingClientRect();
  const cardTableRect = cardTable.getBoundingClientRect();
  return {
    x: handCenterAnchorInTable.x + (cardTableRect.left - playfieldRect.left),
    y: handCenterAnchorInTable.y + (cardTableRect.top - playfieldRect.top)
  };
}

function beginTapTapActionAnimation() {
  tapTapActionRunToken += 1;
  tapTapActionInFlight = true;
  setTrickPhase(TRICK_PHASE_TRICK_PLAYING);
  return tapTapActionRunToken;
}

function isTapTapActionAnimationCurrent(token) {
  return token === tapTapActionRunToken &&
    tapTapActionInFlight &&
    isTapTapMode() &&
    tapTapStateActive &&
    getViewMode() === "hand";
}

function endTapTapActionAnimation(token) {
  if (token !== tapTapActionRunToken) {
    return;
  }

  tapTapActionInFlight = false;
  syncTapTapTurnLock();
}

function getTapTapActionDurations() {
  const profile = getTrickAnimationProfile();
  return {
    drawMs: Math.max(150, Math.round(profile.botFlightMs * 0.9)),
    revealMs: Math.max(130, Math.round(profile.botFlightMs * 0.7)),
    insertMs: Math.max(170, Math.round(profile.botFlightMs * 0.95)),
    playMs: Math.max(190, profile.botFlightMs + 45)
  };
}

async function createTapTapActionSprite(card, { concealed = false } = {}) {
  const sprite = await createCardElement(card, getRenderMode());
  if (!(sprite instanceof HTMLElement)) {
    return null;
  }

  const cardSize = getCurrentCardRenderSizePx();
  sprite.classList.add("trick-card-sprite", "taptap-card-sprite");
  if (concealed) {
    sprite.classList.add("trick-card-sprite--concealed");
  }
  sprite.style.position = "absolute";
  sprite.style.left = "0px";
  sprite.style.top = "0px";
  sprite.style.margin = "0";
  sprite.style.width = `${cardSize.width}px`;
  sprite.style.height = `${cardSize.height}px`;
  sprite.style.transformOrigin = "50% 50%";
  sprite.style.pointerEvents = "none";
  sprite.style.visibility = "hidden";
  return sprite;
}

async function animateTapTapCardTransfer({
  card,
  startAnchor,
  endAnchor,
  concealed = false,
  startTiltDeg = 0,
  endTiltDeg = 0,
  durationMs = 180,
  easing = TRICK_FLIGHT_EASING,
  isRunCurrent
}) {
  if (!card || typeof isRunCurrent !== "function" || !isRunCurrent()) {
    return false;
  }

  const trickLayer = ensureTrickLayer();
  if (!(trickLayer instanceof HTMLElement)) {
    return false;
  }

  const sprite = await createTapTapActionSprite(card, { concealed });
  if (!(sprite instanceof HTMLElement) || !isRunCurrent()) {
    return false;
  }

  try {
    setSpritePoseFromAnchor(sprite, startAnchor.x, startAnchor.y, startTiltDeg, 1);
    trickLayer.appendChild(sprite);
    void sprite.offsetWidth;
    sprite.style.visibility = "visible";

    await transitionSpriteToAnchor(sprite, {
      anchorX: endAnchor.x,
      anchorY: endAnchor.y,
      rotateDeg: endTiltDeg,
      scale: 1,
      durationMs,
      easing
    });
  } finally {
    sprite.remove();
  }

  return isRunCurrent();
}

async function animateTapTapDrawRevealInHand(
  previewCard,
  {
    durationMs = 150,
    isRunCurrent
  } = {}
) {
  if (!previewCard || typeof isRunCurrent !== "function" || !isRunCurrent()) {
    return false;
  }

  const trickLayer = ensureTrickLayer();
  if (!(trickLayer instanceof HTMLElement)) {
    return false;
  }

  const sprite = await createTapTapActionSprite(previewCard, { concealed: true });
  if (!(sprite instanceof HTMLElement) || !isRunCurrent()) {
    return false;
  }

  const anchor = getTapTapHandCenterHoverAnchor();
  const halfDurationMs = Math.max(65, Math.round(durationMs / 2));

  try {
    setSpritePoseFromAnchor(sprite, anchor.x, anchor.y, 0, 1);
    trickLayer.appendChild(sprite);
    void sprite.offsetWidth;
    sprite.style.visibility = "visible";

    sprite.style.transition = `transform ${halfDurationMs}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)`;
    window.requestAnimationFrame(() => {
      sprite.style.transform = "rotate(0deg) scale(0.08, 1)";
    });
    await waitForMs(halfDurationMs + 45);
    if (!isRunCurrent()) {
      return false;
    }

    sprite.classList.remove("trick-card-sprite--concealed");
    sprite.style.transition = "none";
    sprite.style.transform = "rotate(0deg) scale(0.08, 1)";
    await waitForMs(16);
    if (!isRunCurrent()) {
      return false;
    }

    sprite.style.transition = `transform ${halfDurationMs}ms cubic-bezier(0.2, 0.7, 0.2, 1)`;
    window.requestAnimationFrame(() => {
      sprite.style.transform = "rotate(0deg) scale(1, 1)";
    });
    await waitForMs(halfDurationMs + 50);
  } finally {
    sprite.remove();
  }

  return isRunCurrent();
}

async function animateTapTapDrawSlideIntoHand(
  cardId,
  {
    durationMs = 190,
    isRunCurrent
  } = {}
) {
  if (typeof cardId !== "string" || typeof isRunCurrent !== "function" || !isRunCurrent()) {
    return false;
  }

  const selector = getCardSelectorById(cardId);
  if (!selector) {
    return false;
  }

  const targetCardElement = cardTable.querySelector(selector);
  const targetAnchor = getElementCenterInPlayfield(targetCardElement);
  const cardModel = findCurrentCardById(cardId);
  if (!(targetCardElement instanceof HTMLElement) || !targetAnchor || !cardModel) {
    return false;
  }

  const trickLayer = ensureTrickLayer();
  if (!(trickLayer instanceof HTMLElement)) {
    return false;
  }

  const sprite = await createTapTapActionSprite(cardModel, { concealed: false });
  if (!(sprite instanceof HTMLElement) || !isRunCurrent()) {
    return false;
  }

  const startAnchor = getTapTapHandCenterHoverAnchor();
  const sourceBaseTiltDeg = Number.parseFloat(targetCardElement.dataset.handThetaDeg ?? "");
  const targetTiltDeg = Number.isFinite(sourceBaseTiltDeg) ? sourceBaseTiltDeg : 0;
  targetCardElement.style.visibility = "hidden";

  try {
    setSpritePoseFromAnchor(sprite, startAnchor.x, startAnchor.y, 0, 1);
    trickLayer.appendChild(sprite);
    void sprite.offsetWidth;
    sprite.style.visibility = "visible";

    // Keep the destination slot visibly open for a moment before insertion.
    await waitForMs(Math.max(40, Math.round(durationMs * 0.22)));
    if (!isRunCurrent()) {
      return false;
    }

    await transitionSpriteToAnchor(sprite, {
      anchorX: targetAnchor.x,
      anchorY: targetAnchor.y,
      rotateDeg: targetTiltDeg,
      scale: 1,
      durationMs,
      easing: "cubic-bezier(0.2, 0.72, 0.2, 1)"
    });
  } finally {
    targetCardElement.style.removeProperty("visibility");
    sprite.remove();
  }

  return isRunCurrent();
}

async function animateTapTapHumanPlayFromHand({
  cardId,
  clickClientX,
  durationMs,
  easing = TRICK_FLIGHT_EASING,
  isRunCurrent
}) {
  if (typeof isRunCurrent !== "function" || !isRunCurrent()) {
    return false;
  }

  const payload = createTrickSpriteFromHandCard(cardId);
  if (!payload) {
    return false;
  }

  const trickLayer = ensureTrickLayer();
  if (!(trickLayer instanceof HTMLElement)) {
    if (payload.sourceCardElement instanceof HTMLElement) {
      payload.sourceCardElement.style.removeProperty("visibility");
    }
    return false;
  }

  const { sprite, sourceCardElement } = payload;
  const playTiltDeg = getPlayTiltDegFromClick(sourceCardElement, clickClientX);
  const landingTiltDeg = getNaturalizedTrickTableTiltDeg(playTiltDeg, 1.6);
  const resolvedPlayedAnchor = await resolveTapTapPileTopAnchor("played");
  const targetAnchor = resolvedPlayedAnchor ?? getTapTapPileAnchor("played");

  try {
    if (!isRunCurrent()) {
      return false;
    }

    trickLayer.appendChild(sprite);
    await transitionSpriteToAnchor(sprite, {
      anchorX: targetAnchor.x,
      anchorY: targetAnchor.y,
      rotateDeg: landingTiltDeg,
      scale: 1,
      durationMs,
      easing
    });
  } finally {
    if (sourceCardElement instanceof HTMLElement) {
      sourceCardElement.style.removeProperty("visibility");
    }
    sprite.remove();
  }

  return isRunCurrent();
}

async function runTapTapHumanPlaySequence(cardId, payload = {}) {
  if (!isTapTapMode() || !tapTapStateActive || getViewMode() !== "hand" || tapTapActionInFlight) {
    return false;
  }

  if (tapTapTurnSeatId !== "S") {
    return false;
  }

  const {
    source = "short_click",
    clickClientX = Number.NaN
  } = payload ?? {};

  const hand = getTapTapSeatHand("S");
  const cardIndex = hand.findIndex((entry) => entry?.cardId === cardId);
  if (cardIndex < 0) {
    return false;
  }
  const selectedCard = hand[cardIndex] ?? null;

  const actionToken = beginTapTapActionAnimation();
  const isRunCurrent = () => isTapTapActionAnimationCurrent(actionToken);
  let shouldRunBots = false;
  const playTransactionId = nextMappedCardTransitionTransactionId("taptap-S-play");

  try {
    const durations = getTapTapActionDurations();
    const humanPlayTransition = emitMappedCardTransitionFromGameEvent({
      sourceScope: "taptap",
      seatId: "S",
      transactionId: playTransactionId,
      action: "play",
      card: selectedCard,
      fromZoneId: "hand.S",
      fromSeatId: "S",
      toZoneId: "pile.played",
      toSeatId: "S",
      durationMs: durations.playMs,
      visibilityPolicy: { mode: "face_up_always" },
      stateCommitPolicy: { mode: "on_complete" },
      interruptPolicy: { mode: "cancel" },
      events: { emit: ["on_start", "on_commit", "on_complete"], channel: "taptap" },
      metadata: { actorSeatId: "S", phase: "human_play", source }
    }, "taptap:human-play");
    const humanPlayTiming = resolveTransitionRuntimeTiming(humanPlayTransition, {
      durationMs: durations.playMs,
      easing: TRICK_FLIGHT_EASING
    });

    await animateTapTapHumanPlayFromHand({
      cardId,
      clickClientX,
      durationMs: humanPlayTiming.durationMs,
      easing: humanPlayTiming.easing,
      isRunCurrent
    });

    if (!isRunCurrent()) {
      return false;
    }

    const currentHand = getTapTapSeatHand("S");
    const currentCardIndex = currentHand.findIndex((entry) => entry?.cardId === cardId);
    if (currentCardIndex < 0) {
      return false;
    }

    const [playedCard] = currentHand.splice(currentCardIndex, 1);
    if (!playedCard) {
      return false;
    }

    tapTapHandsBySeatId.set("S", currentHand);
    tapTapPlayedPile.push(playedCard);
    currentCards = currentHand.slice();
    const nextSeat = advanceTapTapTurn();
    await renderCards(currentCards);

    if (!isRunCurrent()) {
      return false;
    }

    setStatus(`TapTap: played ${getCardPlayLabel(playedCard)} (${source}).`);
    appendTapTapActionLogEntry({
      seatId: "S",
      action: "played",
      card: playedCard,
      note: source
    });
    if (isTapTapGameExhausted()) {
      setTapTapTurnSeat("S");
      setStatus("TapTap: all cards are exhausted. Redraw to restart.");
      updateDebugOverlays();
      return true;
    }

    if (nextSeat !== "S" && !isTapTapGameExhausted()) {
      shouldRunBots = true;
      return true;
    }

    setStatus("TapTap: your turn. Draw is optional.");
    syncTapTapTurnLock();
    updateDebugOverlays();
    return true;
  } finally {
    clearTrickLayer();
    endTapTapActionAnimation(actionToken);
    if (
      shouldRunBots &&
      isTapTapMode() &&
      tapTapStateActive &&
      tapTapTurnSeatId !== "S" &&
      !isTapTapGameExhausted()
    ) {
      void runTapTapBotTurns();
    }
  }
}

function handleTapTapPlayIntent(cardId, payload = {}) {
  if (!isTapTapMode() || !tapTapStateActive || getViewMode() !== "hand") {
    return false;
  }

  if (tapTapActionInFlight) {
    setStatus("TapTap: action in progress.");
    return false;
  }

  if (tapTapTurnSeatId !== "S") {
    setStatus("TapTap: wait for your turn.");
    return false;
  }

  const hand = getTapTapSeatHand("S");
  const cardIndex = hand.findIndex((entry) => entry?.cardId === cardId);
  if (cardIndex < 0) {
    return false;
  }

  void runTapTapHumanPlaySequence(cardId, payload);
  return true;
}

function isSupportedTrickPhase(phase) {
  return phase === TRICK_PHASE_DEAL_IDLE ||
    phase === TRICK_PHASE_TRICK_LOCK ||
    phase === TRICK_PHASE_TRICK_PLAYING ||
    phase === TRICK_PHASE_TRICK_RESOLVE ||
    phase === TRICK_PHASE_TRICK_COLLECT;
}

function isTrickInteractionLocked() {
  return LOCKED_TRICK_PHASES.has(trickPhase);
}

function updateTrickPhaseUiState() {
  if (!(cardTable instanceof HTMLElement)) {
    return;
  }

  cardTable.classList.toggle("card-table--trick-locked", isTrickInteractionLocked());
}

function setTrickPhase(nextPhase) {
  if (!isSupportedTrickPhase(nextPhase)) {
    return;
  }

  trickPhase = nextPhase;
  if (isTrickInteractionLocked()) {
    clearHandHoverState();
    if (isAnyDragActive()) {
      resetCardDragState();
    }
  }
  updateTrickPhaseUiState();
}

function resetTrickStateForDeal(nextDealCount) {
  stopTapTapBotLoop();
  cancelTapTapActionAnimations();
  clearPendingTrickSweepContinueWait();
  if (playIntentStatusTimeoutId !== null) {
    window.clearTimeout(playIntentStatusTimeoutId);
    playIntentStatusTimeoutId = null;
  }

  trickAnimationRunToken += 1;
  dealRequestedCount = Number.isInteger(nextDealCount) ? nextDealCount : DEFAULT_CARD_COUNT;
  playerCountForDeal = getPlayerCountForDealCount(dealRequestedCount);
  setTrickPhase(TRICK_PHASE_DEAL_IDLE);
  lastPlayIntentCardId = null;
  lastPlayIntentAtIso = null;
}

function clearPlayIntentStatusMessageLater(delayMs = 1200) {
  if (playIntentStatusTimeoutId !== null) {
    window.clearTimeout(playIntentStatusTimeoutId);
  }

  const expectedIntentTimestamp = lastPlayIntentAtIso;
  playIntentStatusTimeoutId = window.setTimeout(() => {
    playIntentStatusTimeoutId = null;
    if (lastPlayIntentAtIso !== expectedIntentTimestamp) {
      return;
    }
    clearStatus();
  }, delayMs);
}

function findCurrentCardById(cardId) {
  if (typeof cardId !== "string" || cardId.length === 0 || !Array.isArray(currentCards)) {
    return null;
  }

  return currentCards.find((card) => card?.cardId === cardId) ?? null;
}

function getUiScaleFactor() {
  const rootStyle = window.getComputedStyle(document.documentElement);
  const parsed = Number.parseFloat(rootStyle.getPropertyValue("--ui-scale"));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getTrickPlayfieldElement() {
  if (tableSection instanceof HTMLElement) {
    return tableSection;
  }

  return tableViewport instanceof HTMLElement ? tableViewport : cardTable;
}

function getCurrentCardRenderSizePx() {
  const cardHeight = getCardSizePx();
  return {
    width: cardHeight * CARD_ASPECT_RATIO,
    height: cardHeight
  };
}

function formatDebugCoordValue(value) {
  return Number.isFinite(value) ? `${Math.round(value)}` : "--";
}

function updateTrickDebugTableCenter() {
  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    trickDebugTableCenterX = null;
    trickDebugTableCenterY = null;
    return;
  }

  const width = playfieldElement.clientWidth;
  const height = playfieldElement.clientHeight;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    trickDebugTableCenterX = null;
    trickDebugTableCenterY = null;
    return;
  }

  trickDebugTableCenterX = width / 2;
  trickDebugTableCenterY = height / 2;
}

function setTrickDebugMouseFromEvent(event) {
  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    trickDebugMouseX = null;
    trickDebugMouseY = null;
    return;
  }

  const rect = playfieldElement.getBoundingClientRect();
  const clampedX = Math.max(0, Math.min(playfieldElement.clientWidth, event.clientX - rect.left));
  const clampedY = Math.max(0, Math.min(playfieldElement.clientHeight, event.clientY - rect.top));
  trickDebugMouseX = clampedX;
  trickDebugMouseY = clampedY;
}

function clearTrickDebugMousePosition() {
  trickDebugMouseX = null;
  trickDebugMouseY = null;
}

function resetTrickDebugPlayedAnchors() {
  trickDebugPlayedAnchorsBySeatId = new Map();
}

function setTrickDebugPlayedAnchor(seatId, anchor) {
  if (
    typeof seatId !== "string" ||
    !anchor ||
    !Number.isFinite(anchor.x) ||
    !Number.isFinite(anchor.y)
  ) {
    return;
  }

  trickDebugPlayedAnchorsBySeatId.set(seatId, { x: anchor.x, y: anchor.y });
}

function renderTrickDebugPanel() {
  if (!(trickDebugText instanceof HTMLElement)) {
    return;
  }

  updateTrickDebugTableCenter();
  const lines = [
    `Mouse (table): x=${formatDebugCoordValue(trickDebugMouseX)} y=${formatDebugCoordValue(trickDebugMouseY)}`,
    `Table center: x=${formatDebugCoordValue(trickDebugTableCenterX)} y=${formatDebugCoordValue(trickDebugTableCenterY)}`,
    "Played anchors:"
  ];

  ["S", "W", "N", "E"].forEach((seatId) => {
    const anchor = trickDebugPlayedAnchorsBySeatId.get(seatId);
    lines.push(
      `  ${seatId}: x=${formatDebugCoordValue(anchor?.x)} y=${formatDebugCoordValue(anchor?.y)}`
    );
  });

  const activeBotSeatIds = getActiveBotSeatIds(playerCountForDeal);
  if (activeBotSeatIds.length > 0) {
    lines.push("Bot anchors:");
    activeBotSeatIds.forEach((seatId) => {
      const seatAnchor = getSeatAnchorById(seatId);
      const edgeAnchor = getBotEdgeLaunchAnchorBySeatId(seatId);
      lines.push(
        `  ${seatId} seat: x=${formatDebugCoordValue(seatAnchor?.x)} y=${formatDebugCoordValue(seatAnchor?.y)}`
      );
      lines.push(
        `  ${seatId} edge: x=${formatDebugCoordValue(edgeAnchor?.x)} y=${formatDebugCoordValue(edgeAnchor?.y)}`
      );
    });
  }

  const drawPileAnchor = getTapTapPileAnchorFromCache("draw") ?? getTapTapPileAnchorFromDom("draw");
  const playedPileAnchor = getTapTapPileAnchorFromCache("played") ?? getTapTapPileAnchorFromDom("played");
  lines.push("Pile anchors:");
  lines.push(
    `  draw: x=${formatDebugCoordValue(drawPileAnchor?.x)} y=${formatDebugCoordValue(drawPileAnchor?.y)}`
  );
  lines.push(
    `  played: x=${formatDebugCoordValue(playedPileAnchor?.x)} y=${formatDebugCoordValue(playedPileAnchor?.y)}`
  );

  trickDebugText.textContent = lines.join("\n");
  if (trickDebugPanel instanceof HTMLElement) {
    trickDebugPanel.hidden = false;
  }
}

function getSpriteCenterInPlayfield(sprite) {
  if (!(sprite instanceof HTMLElement)) {
    return null;
  }

  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    return null;
  }

  const playfieldRect = playfieldElement.getBoundingClientRect();
  const spriteRect = sprite.getBoundingClientRect();
  if (!(spriteRect.width > 0) || !(spriteRect.height > 0)) {
    return null;
  }

  return {
    x: (spriteRect.left - playfieldRect.left) + (spriteRect.width / 2),
    y: (spriteRect.top - playfieldRect.top) + (spriteRect.height / 2)
  };
}

function clearPendingTrickSweepContinueWait() {
  if (typeof trickSweepContinueCleanup === "function") {
    trickSweepContinueCleanup();
  }
  trickSweepContinueCleanup = null;

  if (typeof trickSweepContinueResolve === "function") {
    const resolve = trickSweepContinueResolve;
    trickSweepContinueResolve = null;
    resolve(false);
  }
}

function waitForTrickSweepContinueClick(isRunCurrent) {
  clearPendingTrickSweepContinueWait();

  return new Promise((resolve) => {
    const playfieldElement = getTrickPlayfieldElement();
    if (!(playfieldElement instanceof HTMLElement)) {
      resolve(false);
      return;
    }

    let settled = false;
    const settle = (value) => {
      if (settled) {
        return;
      }
      settled = true;
      if (typeof trickSweepContinueCleanup === "function") {
        trickSweepContinueCleanup();
      }
      trickSweepContinueCleanup = null;
      trickSweepContinueResolve = null;
      resolve(value);
    };

    const onPointerDown = (event) => {
      if (!isRunCurrent() || event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      settle(true);
    };

    trickSweepContinueCleanup = () => {
      playfieldElement.removeEventListener("pointerdown", onPointerDown, true);
    };
    trickSweepContinueResolve = settle;
    playfieldElement.addEventListener("pointerdown", onPointerDown, true);
  });
}

function getSeatAnchorById(seatId) {
  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    return null;
  }

  const tableWidth = playfieldElement.clientWidth;
  const tableHeight = playfieldElement.clientHeight;
  if (!Number.isFinite(tableWidth) || !Number.isFinite(tableHeight) || tableWidth <= 0 || tableHeight <= 0) {
    return null;
  }

  const margin = SEAT_BORDER_MARGIN_PX;
  const cx = tableWidth / 2;
  const cy = tableHeight / 2;

  if (seatId === "S") {
    return { x: cx, y: tableHeight * (HUMAN_SEAT_VISUAL.yPct / 100) };
  }

  const playerCount = Number.isInteger(playerCountForDeal)
    ? playerCountForDeal
    : getPlayerCountForDealCount(dealRequestedCount);

  if (playerCount === 4) {
    if (seatId === "N") return { x: cx, y: margin };
    if (seatId === "W") return { x: margin, y: cy };
    if (seatId === "E") return { x: tableWidth - margin, y: cy };
  }

  if (playerCount === 3) {
    if (seatId === "W") return { x: tableWidth * 0.25, y: margin };
    if (seatId === "E") return { x: tableWidth * 0.75, y: margin };
  }

  if (playerCount === 2 && seatId === "N") {
    return { x: cx, y: margin };
  }

  return null;
}

function getBotEdgeLaunchAnchorBySeatId(seatId) {
  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    return null;
  }

  const tableWidth = playfieldElement.clientWidth;
  const tableHeight = playfieldElement.clientHeight;
  if (!Number.isFinite(tableWidth) || !Number.isFinite(tableHeight) || tableWidth <= 0 || tableHeight <= 0) {
    return null;
  }

  const seatAnchor = getSeatAnchorById(seatId);
  if (!seatAnchor) {
    return null;
  }

  const centerX = tableWidth / 2;
  const centerY = tableHeight / 2;
  const direction = {
    x: seatAnchor.x - centerX,
    y: seatAnchor.y - centerY
  };
  const directionLength = Math.hypot(direction.x, direction.y);
  const unitDirection = directionLength > 0.001
    ? { x: direction.x / directionLength, y: direction.y / directionLength }
    : { x: 0, y: -1 };

  const tx = Math.abs(unitDirection.x) > 0.0001
    ? ((unitDirection.x > 0 ? tableWidth : 0) - centerX) / unitDirection.x
    : Number.POSITIVE_INFINITY;
  const ty = Math.abs(unitDirection.y) > 0.0001
    ? ((unitDirection.y > 0 ? tableHeight : 0) - centerY) / unitDirection.y
    : Number.POSITIVE_INFINITY;

  const tEdge = Math.min(
    Number.isFinite(tx) && tx > 0 ? tx : Number.POSITIVE_INFINITY,
    Number.isFinite(ty) && ty > 0 ? ty : Number.POSITIVE_INFINITY
  );
  if (!Number.isFinite(tEdge)) {
    return seatAnchor;
  }

  const edgeX = centerX + (unitDirection.x * tEdge);
  const edgeY = centerY + (unitDirection.y * tEdge);
  const cardSize = getCurrentCardRenderSizePx();
  const projectedHalfExtentPx =
    (Math.abs(unitDirection.x) * (cardSize.width / 2)) +
    (Math.abs(unitDirection.y) * (cardSize.height / 2));
  const outerGapPx = Math.max(10, Math.round(12 * getUiScaleFactor()));
  const outsideDistancePx = projectedHalfExtentPx + outerGapPx;
  return {
    x: edgeX + (unitDirection.x * outsideDistancePx),
    y: edgeY + (unitDirection.y * outsideDistancePx)
  };
}

function getBotLaunchAnchorById(seatId) {
  if (trickBotAnimationMode === "edge_fly") {
    const edgeAnchor = getBotEdgeLaunchAnchorBySeatId(seatId);
    if (edgeAnchor) {
      return edgeAnchor;
    }
  }

  return getSeatAnchorById(seatId);
}

function getTrickSlotAnchors(seatOrder) {
  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    return [];
  }

  const tableWidth = playfieldElement.clientWidth;
  const tableHeight = playfieldElement.clientHeight;
  if (!Number.isFinite(tableWidth) || !Number.isFinite(tableHeight) || tableWidth <= 0 || tableHeight <= 0) {
    return [];
  }

  const centerX = tableWidth / 2;
  const centerY = tableHeight / 2;
  const halfCardHeight = getCardSizePx() / 2;

  return seatOrder.map((seatId) => {
    const seatAnchor = getSeatAnchorById(seatId);
    if (!seatAnchor) {
      return { x: centerX, y: centerY };
    }

    const dx = seatAnchor.x - centerX;
    const dy = seatAnchor.y - centerY;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) {
      return { x: centerX, y: centerY };
    }

    return {
      x: centerX + (dx / dist) * halfCardHeight,
      y: centerY + (dy / dist) * halfCardHeight
    };
  });
}

function getTrickPlaySeatOrder() {
  return ["S", ...getActiveBotSeatIds(playerCountForDeal)];
}


function getCardPlayLabel(card) {
  if (!card || typeof card !== "object") {
    return "Unknown card";
  }

  if (card.rank === "JOKER") {
    return getRankLabel("JOKER");
  }

  const rankLabel = getRankLabel(card.rank);
  const suitLabel = getSuitLabel(card.suit);
  return suitLabel ? `${rankLabel} of ${suitLabel}` : rankLabel;
}

async function createBotTrickSprite(card, seatId, playOrder) {
  const launchAnchor = getBotLaunchAnchorById(seatId);
  if (!launchAnchor) {
    return null;
  }

  const sprite = await createCardElement(card, getRenderMode());
  if (!(sprite instanceof HTMLElement)) {
    return null;
  }

  sprite.classList.add("trick-card-sprite", "trick-card-sprite--bot");
  const concealInFlight = trickBotAnimationMode !== "edge_fly";
  if (concealInFlight) {
    sprite.classList.add("trick-card-sprite--concealed");
  }
  sprite.dataset.playOrder = `${playOrder}`;
  const cardSize = getCurrentCardRenderSizePx();
  sprite.style.width = `${cardSize.width}px`;
  sprite.style.height = `${cardSize.height}px`;
  sprite.style.transformOrigin = "50% 50%";
  sprite.style.pointerEvents = "none";
  sprite.style.visibility = "hidden";
  return {
    sprite,
    launchAnchor
  };
}

async function runTrickPlaySequence({
  cardId,
  clickClientX,
  source = "short_click"
}) {
  const card = findCurrentCardById(cardId);
  if (!card || getViewMode() !== "hand") {
    setTrickPhase(TRICK_PHASE_DEAL_IDLE);
    return false;
  }

  const runToken = trickAnimationRunToken + 1;
  trickAnimationRunToken = runToken;
  const isRunCurrent = () => trickAnimationRunToken === runToken;
  const trickAnimationProfile = getTrickAnimationProfile();
  resetTrickDebugPlayedAnchors();
  renderTrickDebugPanel();

  const seatOrder = getTrickPlaySeatOrder();
  const trickSlotAnchors = getTrickSlotAnchors(seatOrder);
  if (trickSlotAnchors.length === 0) {
    setTrickPhase(TRICK_PHASE_DEAL_IDLE);
    return false;
  }

  const trickLayer = ensureTrickLayer();
  if (!(trickLayer instanceof HTMLElement)) {
    setTrickPhase(TRICK_PHASE_DEAL_IDLE);
    return false;
  }
  trickLayer.classList.toggle(
    "trick-layer--edge-fly",
    trickBotAnimationMode === "edge_fly"
  );
  const trickTransactionId = nextMappedCardTransitionTransactionId("whist-trick");
  const playGroupId = `${trickTransactionId}:play`;
  const playBatchSize = seatOrder.length;
  const resolveBotVisibilityPolicy = () => (
    trickBotAnimationMode !== "edge_fly"
      ? {
        mode: "face_down_until_arrival",
        startFace: "face_down",
        endFace: "face_up"
      }
      : { mode: "face_up_always" }
  );
  const trickPlays = [{ seatId: "S", playerId: "human", playOrder: 0, card }];
  const spriteByPlayOrder = new Map();
  let hiddenSourceCardElement = null;

  try {
    const humanSpritePayload = createTrickSpriteFromHandCard(cardId);
    if (!humanSpritePayload) {
      setTrickPhase(TRICK_PHASE_DEAL_IDLE);
      return false;
    }

    const { sprite: humanSprite, sourceCardElement } = humanSpritePayload;
    hiddenSourceCardElement = sourceCardElement;
    humanSprite.dataset.playOrder = "0";
    trickLayer.appendChild(humanSprite);
    spriteByPlayOrder.set(0, humanSprite);

    for (let index = 1; index < seatOrder.length; index += 1) {
      const seatId = seatOrder[index];
      const botCard = drawBotTrickCard(seatId, index);
      if (!botCard) {
        continue;
      }

      trickPlays.push({
        seatId,
        playerId: `bot-${seatId.toLowerCase()}`,
        playOrder: index,
        card: botCard
      });

      const botSpritePayload = await createBotTrickSprite(botCard, seatId, index);
      if (!botSpritePayload || !isRunCurrent()) {
        continue;
      }

      const { sprite, launchAnchor } = botSpritePayload;
      trickLayer.appendChild(sprite);
      const baseTilt = getBotSeatBaseTiltDeg(seatId) + ((Math.random() * 3) - 1.5);
      setSpritePoseFromAnchor(sprite, launchAnchor.x, launchAnchor.y, baseTilt, 1);
      sprite.style.visibility = "visible";
      spriteByPlayOrder.set(index, sprite);
    }

    if (!isRunCurrent()) {
      return false;
    }

    setTrickPhase(TRICK_PHASE_TRICK_PLAYING);
    const playTiltDeg = getPlayTiltDegFromClick(hiddenSourceCardElement, clickClientX);
    const humanLandingTiltDeg = getNaturalizedTrickTableTiltDeg(
      playTiltDeg,
      trickAnimationProfile.tableTiltJitterDeg
    );
    const whistHumanPlayTransition = emitMappedCardTransitionFromGameEvent({
      sourceScope: "whist",
      seatId: "S",
      transactionId: trickTransactionId,
      action: "play",
      card,
      fromZoneId: "hand.S",
      fromSeatId: "S",
      toZoneId: "table.trick.slot1",
      toSeatId: "S",
      durationMs: trickAnimationProfile.humanFlightMs,
      visibilityPolicy: { mode: "face_up_always" },
      stateCommitPolicy: { mode: "on_complete" },
      interruptPolicy: { mode: "cancel" },
      orientation: {
        startTiltDeg: playTiltDeg,
        endTiltDeg: humanLandingTiltDeg
      },
      sequence: {
        orderIndex: 0,
        staggerMs: trickAnimationProfile.botStaggerMs,
        batchSize: playBatchSize,
        waveIndex: 1
      },
      concurrency: {
        groupId: playGroupId,
        mode: "sequential",
        maxParallel: 1
      },
      events: { emit: ["on_start", "on_commit", "on_complete"], channel: "whist" },
      metadata: {
        phase: "trick_play",
        source,
        playOrder: 0
      }
    }, "whist:human-play");
    const whistHumanPlayTiming = resolveTransitionRuntimeTiming(whistHumanPlayTransition, {
      durationMs: trickAnimationProfile.humanFlightMs,
      easing: TRICK_FLIGHT_EASING
    });
    const whistHumanPlayOrientation = resolveTransitionRuntimeOrientation(whistHumanPlayTransition, {
      startTiltDeg: playTiltDeg,
      endTiltDeg: humanLandingTiltDeg
    });

    await transitionSpriteToAnchor(humanSprite, {
      anchorX: trickSlotAnchors[0].x,
      anchorY: trickSlotAnchors[0].y,
      rotateDeg: whistHumanPlayOrientation.endTiltDeg,
      scale: 1.03,
      durationMs: whistHumanPlayTiming.durationMs,
      easing: whistHumanPlayTiming.easing
    });
    humanSprite.style.transform = `rotate(${whistHumanPlayOrientation.endTiltDeg}deg) scale(1)`;
    setTrickDebugPlayedAnchor("S", getSpriteCenterInPlayfield(humanSprite));
    renderTrickDebugPanel();

    for (let index = 1; index < trickPlays.length; index += 1) {
      const sprite = spriteByPlayOrder.get(index);
      const slotAnchor = trickSlotAnchors[index];
      if (!sprite || !slotAnchor) {
        continue;
      }

      const baseTilt = getBotSeatBaseTiltDeg(trickPlays[index].seatId) + ((Math.random() * 3) - 1.5);
      const destinationTiltDeg = getNaturalizedTrickTableTiltDeg(
        baseTilt,
        trickAnimationProfile.tableTiltJitterDeg
      );
      const whistBotPlayTransition = emitMappedCardTransitionFromGameEvent({
        sourceScope: "whist",
        seatId: trickPlays[index].seatId,
        transactionId: trickTransactionId,
        action: "play",
        card: trickPlays[index].card,
        fromZoneId: `hand.${trickPlays[index].seatId}`,
        fromSeatId: trickPlays[index].seatId,
        toZoneId: `table.trick.slot${index + 1}`,
        toSeatId: trickPlays[index].seatId,
        durationMs: trickAnimationProfile.botFlightMs,
        visibilityPolicy: resolveBotVisibilityPolicy(),
        stateCommitPolicy: { mode: "on_complete" },
        interruptPolicy: { mode: "cancel" },
        orientation: {
          startTiltDeg: baseTilt,
          endTiltDeg: destinationTiltDeg
        },
        sequence: {
          orderIndex: index,
          staggerMs: trickAnimationProfile.botStaggerMs,
          batchSize: playBatchSize,
          waveIndex: 1
        },
        concurrency: {
          groupId: playGroupId,
          mode: "sequential",
          maxParallel: 1
        },
        events: { emit: ["on_start", "on_commit", "on_complete"], channel: "whist" },
        metadata: {
          phase: "trick_play",
          playOrder: index
        }
      }, "whist:bot-play");
      const whistBotPlayTiming = resolveTransitionRuntimeTiming(whistBotPlayTransition, {
        durationMs: trickAnimationProfile.botFlightMs,
        easing: TRICK_FLIGHT_EASING
      });
      const whistBotPlayOrientation = resolveTransitionRuntimeOrientation(whistBotPlayTransition, {
        startTiltDeg: baseTilt,
        endTiltDeg: destinationTiltDeg
      });

      await transitionSpriteToAnchor(sprite, {
        anchorX: slotAnchor.x,
        anchorY: slotAnchor.y,
        rotateDeg: whistBotPlayOrientation.endTiltDeg,
        scale: 1,
        durationMs: whistBotPlayTiming.durationMs,
        easing: whistBotPlayTiming.easing
      });
      if (resolveTransitionRuntimeEndsFaceUp(whistBotPlayTransition, true)) {
        sprite.classList.remove("trick-card-sprite--concealed");
      }
      setTrickDebugPlayedAnchor(trickPlays[index].seatId, getSpriteCenterInPlayfield(sprite));
      renderTrickDebugPanel();

      const hasNextBotPlay = index < (trickPlays.length - 1);
      if (hasNextBotPlay && trickAnimationProfile.botStaggerMs > 0) {
        await waitForMs(trickAnimationProfile.botStaggerMs);
      }

      if (!isRunCurrent()) {
        return false;
      }
    }

    if (!isRunCurrent()) {
      return false;
    }

    setTrickPhase(TRICK_PHASE_TRICK_RESOLVE);
    const winnerPlay = resolveTrickWinnerPlay(trickPlays) ?? trickPlays[0];
    const winnerSprite = spriteByPlayOrder.get(winnerPlay.playOrder) ?? humanSprite;
    if (winnerSprite) {
      winnerSprite.classList.add("trick-card-sprite--winner");
    }
    await waitForMs(trickAnimationProfile.highlightMs);

    if (!isRunCurrent()) {
      return false;
    }

    setStatus("Trick landed. Click table to sweep.");
    const shouldContinueToSweep = await waitForTrickSweepContinueClick(isRunCurrent);
    if (!shouldContinueToSweep || !isRunCurrent()) {
      setTrickPhase(TRICK_PHASE_DEAL_IDLE);
      return false;
    }

    setTrickPhase(TRICK_PHASE_TRICK_COLLECT);
    const winnerAnchor = getSeatAnchorById(winnerPlay.seatId) ?? getSeatAnchorById("S");
    const collectTransactionId = `${trickTransactionId}:collect`;
    const collectGroupId = `${collectTransactionId}:simultaneous`;
    const collectTransitions = [];
    if (winnerAnchor) {
      trickPlays.forEach((play, index) => {
        const sprite = spriteByPlayOrder.get(play.playOrder);
        if (!sprite) {
          return;
        }

        const spread = (index - ((trickPlays.length - 1) / 2)) * 10 * getUiScaleFactor();
        const raise = index * 2 * getUiScaleFactor();
        const whistCollectTransition = emitMappedCardTransitionFromGameEvent({
          sourceScope: "whist",
          seatId: play.seatId,
          transactionId: collectTransactionId,
          action: "collect",
          card: play.card,
          fromZoneId: `table.trick.slot${play.playOrder + 1}`,
          fromSeatId: play.seatId,
          toZoneId: `trickPile.${winnerPlay.seatId}`,
          toSeatId: winnerPlay.seatId,
          durationMs: trickAnimationProfile.collectMs,
          visibilityPolicy: { mode: "face_up_always" },
          stateCommitPolicy: { mode: "on_complete" },
          interruptPolicy: { mode: "cancel" },
          sequence: {
            orderIndex: index,
            batchSize: trickPlays.length,
            waveIndex: 1,
            staggerMs: 0
          },
          concurrency: {
            groupId: collectGroupId,
            mode: "simultaneous",
            maxParallel: trickPlays.length
          },
          events: { emit: ["on_start", "on_commit", "on_complete"], channel: "whist" },
          metadata: {
            phase: "trick_collect",
            winnerSeatId: winnerPlay.seatId,
            winnerPlayOrder: winnerPlay.playOrder
          }
        }, "whist:trick-collect");
        const whistCollectTiming = resolveTransitionRuntimeTiming(whistCollectTransition, {
          durationMs: trickAnimationProfile.collectMs,
          easing: TRICK_COLLECT_EASING
        });

        collectTransitions.push(
          transitionSpriteToAnchor(sprite, {
            anchorX: winnerAnchor.x + spread,
            anchorY: winnerAnchor.y - raise,
            rotateDeg: 0,
            scale: 1,
            durationMs: whistCollectTiming.durationMs,
            easing: whistCollectTiming.easing
          })
        );
      });
    }

    if (collectTransitions.length > 0) {
      await Promise.all(collectTransitions);
    }

    await waitForMs(trickAnimationProfile.cleanupMs);
    if (!isRunCurrent()) {
      return false;
    }

    currentCards = currentCards.filter((entry) => entry?.cardId !== cardId);
    setTrickPhase(TRICK_PHASE_DEAL_IDLE);
    await renderCards(currentCards);
    setStatus(`Played: ${getCardPlayLabel(card)} (${source})`);
    clearPlayIntentStatusMessageLater(900);
    return true;
  } catch (error) {
    console.error("Trick play sequence failed:", error);
    setTrickPhase(TRICK_PHASE_DEAL_IDLE);
    return false;
  } finally {
    clearPendingTrickSweepContinueWait();
    if (hiddenSourceCardElement instanceof HTMLElement) {
      hiddenSourceCardElement.style.removeProperty("visibility");
    }

    clearTrickLayer();
    if (!isRunCurrent()) {
      setTrickPhase(TRICK_PHASE_DEAL_IDLE);
    }
  }
}

function getAutoSortedGroupOrder(cards) {
  if (!Array.isArray(cards) || cards.length === 0) {
    return [];
  }

  if (HAND_SORTING_API === null) {
    return getGroupOrderFromCardSequence(cards);
  }

  try {
    const sortedCards = HAND_SORTING_API.sortHandCards(cards, {
      rankPolicy: getHandRankPolicy()
    }).sortedCards;
    const cardsForGroupOrder = Array.isArray(sortedCards) && sortedCards.length > 0
      ? sortedCards
      : cards;
    return getGroupOrderFromCardSequence(cardsForGroupOrder);
  } catch (_error) {
    return getGroupOrderFromCardSequence(cards);
  }
}

function maybeFreezeWhistSuitOrderOnFirstPlay() {
  if (playMechanicMode !== "whist" || getEffectiveHandSortMode() !== "auto_ranked") {
    return false;
  }

  const lockedGroupOrder = getAutoSortedGroupOrder(currentCards);
  if (lockedGroupOrder.length === 0) {
    return false;
  }

  manualSuitOrder = lockedGroupOrder;
  applyHandSortPresetToLegacy("manual_suits_ranked");
  return true;
}

function handleCardPlayIntent(cardId, payload = {}) {
  if (isTapTapMode()) {
    return handleTapTapPlayIntent(cardId, payload);
  }

  if (isTrickInteractionLocked() || getViewMode() !== "hand") {
    return false;
  }

  const card = findCurrentCardById(cardId);
  if (!card) {
    return false;
  }

  const {
    source = "short_click",
    clickClientX = Number.NaN
  } = payload ?? {};

  maybeFreezeWhistSuitOrderOnFirstPlay();
  lastPlayIntentCardId = cardId;
  lastPlayIntentAtIso = new Date().toISOString();
  setStatus(`Play intent: ${getCardPlayLabel(card)} (${source})`);
  setTrickPhase(TRICK_PHASE_TRICK_LOCK);
  void runTrickPlaySequence({
    cardId,
    clickClientX,
    source
  });
  return true;
}

function normalizeDeckEntry(rawDeck) {
  if (!rawDeck || typeof rawDeck !== "object") {
    throw new Error("Deck manifest payload is not an object.");
  }

  if (rawDeck.normalized !== true || rawDeck.manifestVersion !== 1) {
    throw new Error("Deck manifest is not normalized v1.");
  }

  if (!Array.isArray(rawDeck.cards) || rawDeck.cards.length === 0) {
    throw new Error("Deck manifest has no cards.");
  }

  const normalizedCards = rawDeck.cards.map((card, index) => {
    if (!card || typeof card !== "object") {
      throw new Error(`Deck card at index ${index} is invalid.`);
    }

    if (typeof card.rank !== "string") {
      throw new Error(`Deck card rank at index ${index} is invalid.`);
    }

    if (card.rank !== "JOKER" && typeof card.suit !== "string") {
      throw new Error(`Deck card suit at index ${index} is invalid.`);
    }

    if (typeof card.assetPath !== "string" || !card.assetPath.includes("/.normalized/")) {
      throw new Error(`Deck card asset path at index ${index} is not trusted normalized output.`);
    }

    const suitSymbol =
      card.rank === "JOKER"
        ? "🃏"
        : STANDARD_SUIT_CONFIG.find((entry) => entry.suit === card.suit)?.symbol ?? "";

    return {
      cardId: card.cardId ?? `${card.rank}-${card.suit ?? "joker"}-${index}`,
      rank: card.rank,
      suit: card.suit,
      symbol: suitSymbol,
      assetPath: card.assetPath
    };
  });

  const baseCards = normalizedCards.filter((card) => card.rank !== "JOKER");
  const nativeJokers = normalizedCards.filter((card) => card.rank === "JOKER");

  if (baseCards.length !== 52) {
    throw new Error(
      `Deck '${rawDeck.deckId ?? "unknown"}' does not contain a 52-card base set after joker split.`
    );
  }

  return {
    deckId: rawDeck.deckId,
    title: rawDeck.title ?? rawDeck.deckId,
    deckVersion: rawDeck.deckVersion ?? "0.0.0",
    model: rawDeck.model ?? { kind: "standard52", jokers: 0 },
    locale: rawDeck.locale ?? {},
    rankLabels: {
      ...DEFAULT_RANK_LABELS,
      ...(rawDeck.locale?.rankLabels ?? {})
    },
    suitLabels: {
      ...DEFAULT_SUIT_LABELS,
      ...(rawDeck.locale?.suitLabels ?? {})
    },
    cards: baseCards,
    baseCards,
    nativeJokers,
    allCards: normalizedCards
  };
}

function isSelectableDeckEntry(deckEntry) {
  return (
    deckEntry &&
    deckEntry.status === "valid" &&
    typeof deckEntry.manifestPath === "string" &&
    deckEntry.manifestPath.length > 0
  );
}

function isSelectableBaseDeckEntry(deckEntry) {
  return isSelectableDeckEntry(deckEntry) && deckEntry.model?.kind === "standard52";
}

function toJokerIdSegment(value, fallback = "joker") {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : fallback;
}

function buildDerivedJokerTitle(deckTitle, cardId, jokerOrdinal) {
  const normalizedDeckTitle =
    typeof deckTitle === "string" && deckTitle.trim().length > 0 ? deckTitle.trim() : "Deck";
  const suffix = cardId ?? `joker-${jokerOrdinal}`;
  return `${normalizedDeckTitle} / ${suffix}`;
}

function setAvailableJokers(jokers) {
  availableJokers = Array.isArray(jokers) ? jokers : [];
  window.__CTP_JOKER_CATALOG__ = availableJokers.map((entry) => ({ ...entry }));
  reconcileJokerSetupState();
  syncJokerSetupControls();
}

function clampJokerCount(value) {
  const parsed = Number.parseInt(`${value}`, 10);
  if (!Number.isInteger(parsed)) {
    return DEFAULT_JOKER_COUNT;
  }

  return Math.min(MAX_JOKER_COUNT, Math.max(MIN_JOKER_COUNT, parsed));
}

function clampCardHeightPx(value) {
  const parsed = Number.parseInt(`${value}`, 10);
  if (!Number.isInteger(parsed)) {
    return DEFAULT_CARD_HEIGHT_PX;
  }

  return Math.min(MAX_CARD_HEIGHT_PX, Math.max(MIN_CARD_HEIGHT_PX, parsed));
}

function getHandBottomClipRatio(cardHeightPx) {
  const safeCardHeight = clampCardHeightPx(cardHeightPx);
  const range = MAX_CARD_HEIGHT_PX - MIN_CARD_HEIGHT_PX;
  if (range <= 0) {
    return 0;
  }

  const normalized = (safeCardHeight - MIN_CARD_HEIGHT_PX) / range;
  return Math.min(HAND_BOTTOM_CLIP_MAX_RATIO, Math.max(0, normalized * HAND_BOTTOM_CLIP_MAX_RATIO));
}

function findAvailableJokerById(jokerId) {
  if (typeof jokerId !== "string" || jokerId.length === 0) {
    return null;
  }

  return availableJokers.find((entry) => entry.jokerId === jokerId) ?? null;
}

function getStoredBoolean(key, fallback) {
  try {
    const rawValue = sessionStorage.getItem(key);
    if (rawValue === null) {
      return fallback;
    }

    return rawValue === "1";
  } catch (_error) {
    return fallback;
  }
}

function setStoredBoolean(key, value) {
  try {
    sessionStorage.setItem(key, value ? "1" : "0");
  } catch (_error) {
    // Ignore storage failures in local/file-browser contexts.
  }
}

function getStoredInteger(key, fallback, clampFn) {
  try {
    const rawValue = sessionStorage.getItem(key);
    if (rawValue === null) {
      return clampFn(fallback);
    }

    return clampFn(rawValue);
  } catch (_error) {
    return clampFn(fallback);
  }
}

function setStoredInteger(key, value, clampFn) {
  try {
    sessionStorage.setItem(key, `${clampFn(value)}`);
  } catch (_error) {
    // Ignore storage failures in local/file-browser contexts.
  }
}

function getStoredString(key) {
  try {
    const rawValue = sessionStorage.getItem(key);
    return typeof rawValue === "string" && rawValue.length > 0 ? rawValue : null;
  } catch (_error) {
    return null;
  }
}

function setStoredStringOrClear(key, value) {
  try {
    if (typeof value === "string" && value.length > 0) {
      sessionStorage.setItem(key, value);
    } else {
      sessionStorage.removeItem(key);
    }
  } catch (_error) {
    // Ignore storage failures in local/file-browser contexts.
  }
}

function initializeJokerSetupState() {
  jokersEnabled = getStoredBoolean(JOKERS_ENABLED_STORAGE_KEY, DEFAULT_JOKERS_ENABLED);
  jokerCount = getStoredInteger(JOKER_COUNT_STORAGE_KEY, DEFAULT_JOKER_COUNT, clampJokerCount);
  selectedJokerId = getStoredString(JOKER_SELECTED_STORAGE_KEY);
  lastSelectedJokerId = getStoredString(JOKER_LAST_SELECTED_STORAGE_KEY);

  if (!lastSelectedJokerId && selectedJokerId) {
    lastSelectedJokerId = selectedJokerId;
  }
}

function persistJokerSetupState() {
  setStoredBoolean(JOKERS_ENABLED_STORAGE_KEY, jokersEnabled);
  setStoredInteger(JOKER_COUNT_STORAGE_KEY, jokerCount, clampJokerCount);
  setStoredStringOrClear(JOKER_SELECTED_STORAGE_KEY, selectedJokerId);
  setStoredStringOrClear(JOKER_LAST_SELECTED_STORAGE_KEY, lastSelectedJokerId);
}

function getPreferredJokerSelectionId() {
  if (findAvailableJokerById(lastSelectedJokerId)) {
    return lastSelectedJokerId;
  }

  return availableJokers[0]?.jokerId ?? null;
}

function reconcileJokerSetupState() {
  jokerCount = clampJokerCount(jokerCount);

  if (selectedJokerId && !findAvailableJokerById(selectedJokerId)) {
    selectedJokerId = null;
  }

  if (lastSelectedJokerId && !findAvailableJokerById(lastSelectedJokerId)) {
    lastSelectedJokerId = null;
  }

  if (availableJokers.length === 0) {
    jokersEnabled = false;
    selectedJokerId = null;
    lastSelectedJokerId = null;
    persistJokerSetupState();
    publishJokerSetupState();
    return;
  }

  if (jokersEnabled && !selectedJokerId) {
    selectedJokerId = getPreferredJokerSelectionId();
  }

  if (selectedJokerId) {
    lastSelectedJokerId = selectedJokerId;
  }

  persistJokerSetupState();
  publishJokerSetupState();
}

function publishJokerSetupState() {
  window.__CTP_JOKER_SETUP__ = {
    jokersEnabled,
    jokerCount,
    selectedJokerId,
    lastSelectedJokerId
  };
}

function populateJokerDesignSelect() {
  if (!jokerDesignSelect) {
    return;
  }

  jokerDesignSelect.innerHTML = "";

  if (availableJokers.length === 0) {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "No jokers available";
    jokerDesignSelect.appendChild(emptyOption);
    jokerDesignSelect.disabled = true;
    return;
  }

  availableJokers.forEach((joker) => {
    const option = document.createElement("option");
    option.value = joker.jokerId;
    option.textContent = joker.title;
    jokerDesignSelect.appendChild(option);
  });

  const selectionId = selectedJokerId ?? getPreferredJokerSelectionId();
  if (selectionId) {
    jokerDesignSelect.value = selectionId;
    selectedJokerId = selectionId;
    lastSelectedJokerId = selectionId;
  }
}

function syncJokerSetupControls() {
  populateJokerDesignSelect();

  if (jokersEnabledToggle) {
    jokersEnabledToggle.checked = jokersEnabled;
    jokersEnabledToggle.disabled = availableJokers.length === 0;
  }

  const hasSelectableJoker = findAvailableJokerById(selectedJokerId) !== null;
  const enableDetails = jokersEnabled && hasSelectableJoker;

  if (jokerControls) {
    jokerControls.classList.toggle("mode-toggle__subcontrol--hidden", !jokersEnabled);
  }

  if (jokerCountInput) {
    jokerCountInput.value = `${jokerCount}`;
    jokerCountInput.disabled = !enableDetails;
  }

  if (jokerDesignSelect) {
    if (hasSelectableJoker) {
      jokerDesignSelect.value = selectedJokerId;
    }
    jokerDesignSelect.disabled = !jokersEnabled || availableJokers.length === 0;
  }

  persistJokerSetupState();
  publishJokerSetupState();
  updateCardCountRangeLabel();
}

function getSelectedJokerEntry() {
  if (!jokersEnabled) {
    return null;
  }

  return findAvailableJokerById(selectedJokerId);
}

function getJokerInjectionCount() {
  if (!getSelectedJokerEntry()) {
    return 0;
  }

  return jokerCount;
}

function buildRuntimeDeckCards() {
  const baseDeckCards = activeDeck && Array.isArray(activeDeck.cards) ? activeDeck.cards : [];
  const selectedJoker = getSelectedJokerEntry();

  if (!selectedJoker || jokerCount <= 0) {
    return baseDeckCards.slice();
  }

  const injectedJokers = [];
  for (let index = 0; index < jokerCount; index += 1) {
    injectedJokers.push({
      cardId: `${selectedJoker.jokerId}::${index + 1}`,
      rank: "JOKER",
      suit: null,
      symbol: "🃏",
      assetPath: selectedJoker.assetPath,
      jokerDesignId: selectedJoker.jokerId,
      jokerInstanceIndex: index + 1
    });
  }

  return baseDeckCards.concat(injectedJokers);
}

async function fetchDeckIndex() {
  if (PRELOADED_DECK_INDEX && Array.isArray(PRELOADED_DECK_INDEX.decks)) {
    return PRELOADED_DECK_INDEX.decks;
  }

  const response = await fetch(DECK_INDEX_PATH);
  if (!response.ok) {
    throw new Error(`Failed to load deck index: ${DECK_INDEX_PATH}`);
  }

  const payload = await response.json();
  if (!payload || !Array.isArray(payload.decks)) {
    throw new Error("Deck index payload is invalid.");
  }

  return payload.decks;
}

function setActiveDeck(deck) {
  activeDeck = deck;
  updateCardCountRangeLabel();
}

async function loadDeckByManifestPath(manifestPath) {
  if (normalizedDeckCache.has(manifestPath)) {
    return normalizedDeckCache.get(manifestPath);
  }

  const loadPromise = (async () => {
    if (
      PRELOADED_DECK_MANIFESTS &&
      Object.prototype.hasOwnProperty.call(PRELOADED_DECK_MANIFESTS, manifestPath)
    ) {
      return normalizeDeckEntry(PRELOADED_DECK_MANIFESTS[manifestPath]);
    }

    const response = await fetch(manifestPath);
    if (!response.ok) {
      throw new Error(`Failed to load deck manifest: ${manifestPath}`);
    }

    const payload = await response.json();
    return normalizeDeckEntry(payload);
  })();

  normalizedDeckCache.set(manifestPath, loadPromise);

  try {
    return await loadPromise;
  } catch (error) {
    normalizedDeckCache.delete(manifestPath);
    throw error;
  }
}

async function buildDerivedJokerCatalog(deckEntries) {
  const selectableDecks = Array.isArray(deckEntries)
    ? deckEntries.filter((deckEntry) => isSelectableDeckEntry(deckEntry))
    : [];
  const loadedDecks = await Promise.all(
    selectableDecks.map(async (deckEntry) => {
      try {
        return await loadDeckByManifestPath(deckEntry.manifestPath);
      } catch (_error) {
        return null;
      }
    })
  );
  const dedupeKeys = new Set();
  const jokers = [];

  loadedDecks.forEach((deck) => {
    if (!deck || !Array.isArray(deck.nativeJokers)) {
      return;
    }

    let jokerOrdinal = 0;
    deck.nativeJokers.forEach((card) => {
      if (!card || typeof card.assetPath !== "string" || card.assetPath.length === 0) {
        return;
      }

      jokerOrdinal += 1;
      const rawCardId =
        typeof card.cardId === "string" && card.cardId.trim().length > 0
          ? card.cardId.trim()
          : null;
      const dedupeKey = rawCardId
        ? `${deck.deckId}::${rawCardId}`
        : `${deck.deckId}::${card.assetPath}`;

      if (dedupeKeys.has(dedupeKey)) {
        return;
      }

      dedupeKeys.add(dedupeKey);
      jokers.push({
        jokerId: `${deck.deckId}:${toJokerIdSegment(rawCardId ?? card.assetPath, `joker-${jokerOrdinal}`)}`,
        title: buildDerivedJokerTitle(deck.title, rawCardId, jokerOrdinal),
        sourceDeckId: deck.deckId,
        sourceDeckTitle: deck.title,
        cardId: rawCardId,
        assetPath: card.assetPath
      });
    });
  });

  return jokers.sort((left, right) => {
    const deckCompare = left.sourceDeckTitle.localeCompare(right.sourceDeckTitle);
    if (deckCompare !== 0) {
      return deckCompare;
    }

    return left.title.localeCompare(right.title);
  });
}

async function selectDeckById(deckId) {
  const selected = availableDecks.find((deckEntry) => deckEntry.deckId === deckId);

  if (!selected || !isSelectableBaseDeckEntry(selected)) {
    throw new Error(`Deck '${deckId}' is not available.`);
  }

  const loadedDeck = await loadDeckByManifestPath(selected.manifestPath);
  setActiveDeck(loadedDeck);
  svgMarkupCache.clear();
}

async function applyUrlDrivenTestConfig() {
  if (!TEST_MODE) {
    return;
  }

  const requestedDeckId = URL_PARAMS.get("deck");
  if (requestedDeckId) {
    try {
      if (deckSelect) {
        deckSelect.value = requestedDeckId;
      }
      await selectDeckById(requestedDeckId);
    } catch (_error) {
      setStatus(`Failed to load requested deck '${requestedDeckId}'.`);
    }
  }

  const requestedViewMode = URL_PARAMS.get("view");
  if (requestedViewMode && isSupportedViewMode(requestedViewMode)) {
    viewModeInputs.forEach((input) => {
      input.checked = input.value === requestedViewMode;
    });
    currentViewMode = requestedViewMode;
  }

  const requestedHandLayoutMode = URL_PARAMS.get("hand_mode");
  if (requestedHandLayoutMode && isSupportedHandLayoutMode(requestedHandLayoutMode)) {
    handLayoutModeInputs.forEach((input) => {
      input.checked = input.value === requestedHandLayoutMode;
    });
    setStoredHandLayoutMode(requestedHandLayoutMode);
  }

  const requestedHandDirection = URL_PARAMS.get("hand_direction");
  if (
    HAND_DIRECTION_CONTROL_ENABLED &&
    requestedHandDirection &&
    isSupportedHandDirection(requestedHandDirection)
  ) {
    handDirectionInputs.forEach((input) => {
      input.checked = input.value === requestedHandDirection;
    });
    setStoredHandDirection(requestedHandDirection);
  }

  syncAlphaSliderForMode(true);

  const requestedCount = parseUrlIntegerParam("count");
  if (requestedCount !== null) {
    const maxCount = getDeckMaxCount();
    cardCountInput.value = `${Math.min(maxCount, Math.max(1, requestedCount))}`;
  }

  const requestedCardSizePx = parseUrlClampedIntegerParam(
    "card_size",
    MIN_CARD_HEIGHT_PX,
    MAX_CARD_HEIGHT_PX
  );
  if (requestedCardSizePx !== null && cardSizeSlider) {
    cardSizeSlider.value = `${requestedCardSizePx}`;
  }

  const requestedVisibility = parseUrlClampedFloatParam("visibility_factor", 0, 1);
  if (requestedVisibility !== null && visibilityFactorSlider) {
    visibilityFactorSlider.value = requestedVisibility.toFixed(2);
  }

  const alphaConfig = getAlphaSliderConfig();
  const requestedAlphaDeg = parseUrlClampedFloatParam("alpha_deg", alphaConfig.min, alphaConfig.max);
  if (requestedAlphaDeg !== null && alphaDegSlider) {
    alphaDegSlider.value = requestedAlphaDeg.toFixed(1);
    storeCurrentAlphaValueForMode();
  }

  const requestedPhiDeg = parseUrlClampedFloatParam("phi_deg", 0, 90);
  if (requestedPhiDeg !== null && phiDegSlider) {
    phiDegSlider.value = requestedPhiDeg.toFixed(1);
  }

  const requestedDemoOuterDropPct = parseUrlClampedFloatParam("demo_outer_drop", 0, 5);
  if (requestedDemoOuterDropPct !== null && demoOuterDropSlider) {
    demoOuterDropSlider.value = requestedDemoOuterDropPct.toFixed(1);
  }

  updateHandGeometryValueLabels();
  updateHandModeControls();
}

function populateDeckSelect() {
  if (!deckSelect) {
    return;
  }

  deckSelect.innerHTML = "";

  let hasSelectableDeck = false;
  availableDecks.forEach((deckEntry) => {
    const option = document.createElement("option");
    option.value = deckEntry.deckId;
    option.textContent =
      deckEntry.status === "valid"
        ? `${deckEntry.title}`
        : `${deckEntry.title ?? deckEntry.deckId} (invalid)`;
    const selectable = isSelectableBaseDeckEntry(deckEntry);
    option.disabled = !selectable;
    hasSelectableDeck = hasSelectableDeck || selectable;
    deckSelect.appendChild(option);
  });

  deckSelect.disabled = !hasSelectableDeck;
}

async function initializeDecks() {
  setActiveDeck(null);

  try {
    availableDecks = await fetchDeckIndex();
    const derivedJokers = await buildDerivedJokerCatalog(availableDecks);
    setAvailableJokers(derivedJokers);
    populateDeckSelect();

    const firstValidDeck = availableDecks.find((deckEntry) => isSelectableBaseDeckEntry(deckEntry));
    if (!firstValidDeck) {
      throw new Error("No valid normalized decks available.");
    }

    const preferredDeck =
      availableDecks.find(
        (deckEntry) =>
          deckEntry.deckId === DEFAULT_DECK_ID &&
          isSelectableBaseDeckEntry(deckEntry)
      ) ?? firstValidDeck;

    if (deckSelect) {
      deckSelect.value = preferredDeck.deckId;
      deckSelect.disabled = false;
    }

    await selectDeckById(preferredDeck.deckId);
    clearStatus();
  } catch (_error) {
    availableDecks = [];
    setAvailableJokers([]);
    populateDeckSelect();
    setActiveDeck(null);
    cardTable.innerHTML = "";
    setStatus("No normalized decks available. Run npm run decks:normalize.");
  }
}

function shuffleDeck(deck) {
  const shuffled = deck.slice();

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled;
}

function createDealtCard(card, dealIndex) {
  const dealtCard = { ...card };

  Object.defineProperty(dealtCard, "dealIndex", {
    value: dealIndex,
    writable: false,
    enumerable: true,
    configurable: false
  });

  return dealtCard;
}

function drawCards(count) {
  const deck = buildRuntimeDeckCards();
  const shuffled = shuffleDeck(deck);
  return shuffled.slice(0, count).map((card, dealIndex) => createDealtCard(card, dealIndex));
}

function clearStatus() {
  statusMessage.textContent = "";
}

function setStatus(message) {
  statusMessage.textContent = message;
}

async function getCardSvgMarkup(cardImagePath) {
  if (svgMarkupCache.has(cardImagePath)) {
    return svgMarkupCache.get(cardImagePath);
  }

  if (
    PRELOADED_SVG_MARKUP &&
    Object.prototype.hasOwnProperty.call(PRELOADED_SVG_MARKUP, cardImagePath)
  ) {
    const preloadedMarkup = PRELOADED_SVG_MARKUP[cardImagePath];
    svgMarkupCache.set(cardImagePath, preloadedMarkup);
    return preloadedMarkup;
  }

  const response = await fetch(cardImagePath);

  if (!response.ok) {
    throw new Error(`Failed to load card SVG: ${cardImagePath}`);
  }

  const svgMarkup = await response.text();
  svgMarkupCache.set(cardImagePath, svgMarkup);
  return svgMarkup;
}

function createInlineSvgElement(svgMarkup, altText) {
  const parser = new DOMParser();
  const svgDocument = parser.parseFromString(svgMarkup, "image/svg+xml");
  const parsedSvg = svgDocument.querySelector("svg");

  if (!parsedSvg) {
    throw new Error("Invalid SVG markup.");
  }

  const svgElement = document.importNode(parsedSvg, true);
  svgElement.classList.add("card__image-svg");
  svgElement.setAttribute("role", "img");
  svgElement.setAttribute("aria-label", altText);
  svgElement.setAttribute("focusable", "false");
  svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
  return svgElement;
}

async function createCardElement(card, mode) {
  const cardElement = document.createElement("div");
  cardElement.dataset.cardId = card.cardId ?? "";
  cardElement.dataset.rank = card.rank;
  cardElement.dataset.suit = typeof card.suit === "string" ? card.suit : "";

  if (mode === "image") {
    cardElement.className = "card card--image";
    const cardWrapper = document.createElement("div");
    cardWrapper.className = "card-wrapper";
    const cardFace = document.createElement("div");
    cardFace.className = "card-face";
    const altText =
      card.rank === "JOKER"
        ? getRankLabel(card.rank)
        : `${getRankLabel(card.rank)} of ${getSuitLabel(card.suit)}`;

    try {
      const cardImagePath = getCardImagePath(card);
      const svgMarkup = await getCardSvgMarkup(cardImagePath);
      const inlineSvg = createInlineSvgElement(svgMarkup, altText);
      cardFace.appendChild(inlineSvg);
    } catch (_error) {
      const fallbackText = document.createElement("div");
      fallbackText.className = "card__image-error";
      fallbackText.textContent = "Card unavailable";
      cardFace.appendChild(fallbackText);
    }

    cardWrapper.appendChild(cardFace);
    cardElement.appendChild(cardWrapper);
    return cardElement;
  }

  cardElement.className = "card card--text";

  const cornerTop = document.createElement("div");
  cornerTop.className = "card__corner";
  cornerTop.textContent = card.rank === "JOKER" ? getRankLabel(card.rank) : `${card.rank}${card.symbol}`;

  const center = document.createElement("div");
  center.className = "card__center";
  center.textContent = card.symbol || "";

  const cornerBottom = document.createElement("div");
  cornerBottom.className = "card__corner card__corner--bottom";
  cornerBottom.textContent =
    card.rank === "JOKER" ? getRankLabel(card.rank) : `${card.rank}${card.symbol}`;

  cardElement.appendChild(cornerTop);
  cardElement.appendChild(center);
  cardElement.appendChild(cornerBottom);

  return cardElement;
}

function getCardImagePath(card) {
  if (typeof card.assetPath === "string" && card.assetPath.length > 0) {
    return card.assetPath;
  }

  throw new Error(`Normalized asset path is missing for card: ${card.cardId ?? card.rank}`);
}

function getRankLabel(rank) {
  return activeDeck?.rankLabels?.[rank] ?? DEFAULT_RANK_LABELS[rank] ?? rank;
}

function getSuitLabel(suit) {
  if (!suit) {
    return "";
  }

  return activeDeck?.suitLabels?.[suit] ?? DEFAULT_SUIT_LABELS[suit] ?? suit;
}

function getRenderMode() {
  const selected = document.querySelector("input[name=\"render-mode\"]:checked");
  return selected ? selected.value : "unicode";
}

function isSupportedViewMode(value) {
  return value === "matrix" || value === "hand";
}

function isSupportedHandLayoutMode(value) {
  return value === "classic" || value === "demo";
}

function isSupportedHandDirection(value) {
  return value === "ltr" || value === "rtl";
}

function isSupportedHandDepthShadowDirectionHourIndex(value) {
  return Number.isInteger(value) && value >= 0 && value < HAND_DEPTH_SHADOW_DIRECTION_STEPS;
}

function getStoredViewMode() {
  try {
    const storedMode = sessionStorage.getItem(VIEW_STORAGE_KEY);
    return isSupportedViewMode(storedMode) ? storedMode : DEFAULT_VIEW_MODE;
  } catch (_error) {
    return DEFAULT_VIEW_MODE;
  }
}

function setStoredViewMode(mode) {
  if (!isSupportedViewMode(mode)) {
    return;
  }

  try {
    sessionStorage.setItem(VIEW_STORAGE_KEY, mode);
  } catch (_error) {
    // Ignore storage failures in local/file-browser contexts.
  }
}

function initializeViewMode() {
  const initialViewMode = getStoredViewMode();

  viewModeInputs.forEach((input) => {
    input.checked = input.value === initialViewMode;
  });

  currentViewMode = initialViewMode;
}

function getStoredHandLayoutMode() {
  return DEFAULT_HAND_LAYOUT_MODE;
}

function setStoredHandLayoutMode(mode) {
  void mode;
}

function getStoredHandDirection() {
  if (!HAND_DIRECTION_CONTROL_ENABLED) {
    return DEFAULT_HAND_DIRECTION;
  }

  try {
    const storedDirection = sessionStorage.getItem(HAND_DIRECTION_STORAGE_KEY);
    return isSupportedHandDirection(storedDirection) ? storedDirection : DEFAULT_HAND_DIRECTION;
  } catch (_error) {
    return DEFAULT_HAND_DIRECTION;
  }
}

function setStoredHandDirection(direction) {
  if (!HAND_DIRECTION_CONTROL_ENABLED) {
    return;
  }

  if (!isSupportedHandDirection(direction)) {
    return;
  }

  try {
    sessionStorage.setItem(HAND_DIRECTION_STORAGE_KEY, direction);
  } catch (_error) {
    // Ignore storage failures in local/file-browser contexts.
  }
}

function initializeHandLayoutMode() {
  const initialMode = getStoredHandLayoutMode();

  handLayoutModeInputs.forEach((input) => {
    input.checked = input.value === initialMode;
  });
}

function initializeCardSizeControl() {
  if (!cardSizeSlider) {
    return;
  }

  const storedCardHeight = getStoredInteger(
    CARD_HEIGHT_STORAGE_KEY,
    DEFAULT_CARD_HEIGHT_PX,
    clampCardHeightPx
  );
  cardSizeSlider.value = `${storedCardHeight}`;
}

function initializeHandDirection() {
  if (!HAND_DIRECTION_CONTROL_ENABLED) {
    setStoredHandDirection(DEFAULT_HAND_DIRECTION);
    return;
  }

  const initialDirection = getStoredHandDirection();

  handDirectionInputs.forEach((input) => {
    input.checked = input.value === initialDirection;
  });
}

function initializeHandSortingControls() {
  if (handSuitSortModeSelect && !isSupportedHandSuitSortMode(handSuitSortModeSelect.value)) {
    handSuitSortModeSelect.value = DEFAULT_HAND_SUIT_SORT_MODE;
  }

  if (rankSortEnabledToggle) {
    rankSortEnabledToggle.checked = DEFAULT_RANK_SORT_ENABLED;
  }

  enforceHandSortControlCoercion();
  syncHandSortPresetControlsFromLegacy();
}

function getStoredHandDepthShadowEnabled() {
  try {
    const storedValue = sessionStorage.getItem(HAND_DEPTH_SHADOW_STORAGE_KEY);
    if (storedValue === null) {
      return DEFAULT_HAND_DEPTH_SHADOW_ENABLED;
    }
    return storedValue === "1";
  } catch (_error) {
    return DEFAULT_HAND_DEPTH_SHADOW_ENABLED;
  }
}

function setStoredHandDepthShadowEnabled(enabled) {
  try {
    sessionStorage.setItem(HAND_DEPTH_SHADOW_STORAGE_KEY, enabled ? "1" : "0");
  } catch (_error) {
    // Ignore storage failures in local/file-browser contexts.
  }
}

function getStoredHandDepthShadowStrengthPct() {
  try {
    const storedValue = sessionStorage.getItem(HAND_DEPTH_SHADOW_STRENGTH_STORAGE_KEY);
    if (storedValue === null) {
      return DEFAULT_HAND_DEPTH_SHADOW_STRENGTH_PCT;
    }

    const parsed = Number.parseInt(storedValue, 10);
    if (!Number.isInteger(parsed)) {
      return DEFAULT_HAND_DEPTH_SHADOW_STRENGTH_PCT;
    }

    return Math.min(
      MAX_HAND_DEPTH_SHADOW_STRENGTH_PCT,
      Math.max(MIN_HAND_DEPTH_SHADOW_STRENGTH_PCT, parsed)
    );
  } catch (_error) {
    return DEFAULT_HAND_DEPTH_SHADOW_STRENGTH_PCT;
  }
}

function setStoredHandDepthShadowStrengthPct(value) {
  const clampedValue = Math.min(
    MAX_HAND_DEPTH_SHADOW_STRENGTH_PCT,
    Math.max(MIN_HAND_DEPTH_SHADOW_STRENGTH_PCT, Math.round(value))
  );

  try {
    sessionStorage.setItem(HAND_DEPTH_SHADOW_STRENGTH_STORAGE_KEY, `${clampedValue}`);
  } catch (_error) {
    // Ignore storage failures in local/file-browser contexts.
  }
}

function getStoredHandDepthShadowDirectionHourIndex() {
  try {
    const storedValue = sessionStorage.getItem(HAND_DEPTH_SHADOW_DIRECTION_STORAGE_KEY);
    if (storedValue === null) {
      return DEFAULT_HAND_DEPTH_SHADOW_DIRECTION_HOUR_INDEX;
    }

    const parsed = Number.parseInt(storedValue, 10);
    return isSupportedHandDepthShadowDirectionHourIndex(parsed)
      ? parsed
      : DEFAULT_HAND_DEPTH_SHADOW_DIRECTION_HOUR_INDEX;
  } catch (_error) {
    return DEFAULT_HAND_DEPTH_SHADOW_DIRECTION_HOUR_INDEX;
  }
}

function setStoredHandDepthShadowDirectionHourIndex(hourIndex) {
  if (!isSupportedHandDepthShadowDirectionHourIndex(hourIndex)) {
    return;
  }

  try {
    sessionStorage.setItem(HAND_DEPTH_SHADOW_DIRECTION_STORAGE_KEY, `${hourIndex}`);
  } catch (_error) {
    // Ignore storage failures in local/file-browser contexts.
  }
}

function initializeHandDepthShadowToggle() {
  if (!handDepthShadowToggle) {
    return;
  }

  handDepthShadowToggle.checked = false;
}

function formatHandDepthShadowDirectionLabel(hourIndex) {
  const hourValue = hourIndex === 0 ? 12 : hourIndex;
  return `${hourValue} o'clock`;
}

function getHandDepthShadowDirectionHourIndex() {
  if (!handDepthShadowDirectionClock) {
    return DEFAULT_HAND_DEPTH_SHADOW_DIRECTION_HOUR_INDEX;
  }

  const parsed = Number.parseInt(handDepthShadowDirectionClock.dataset.selectedHourIndex ?? "", 10);
  return isSupportedHandDepthShadowDirectionHourIndex(parsed)
    ? parsed
    : DEFAULT_HAND_DEPTH_SHADOW_DIRECTION_HOUR_INDEX;
}

function syncHandDepthShadowDirectionClock() {
  if (!handDepthShadowDirectionClock) {
    return;
  }

  const selectedHourIndex = getHandDepthShadowDirectionHourIndex();
  handDepthShadowDirectionClock
    .querySelectorAll(".shadow-clock__hour")
    .forEach((button) => {
      const buttonHourIndex = Number.parseInt(button.dataset.hourIndex ?? "", 10);
      const isActive = buttonHourIndex === selectedHourIndex;
      button.classList.toggle("shadow-clock__hour--active", isActive);
      button.setAttribute("aria-checked", isActive ? "true" : "false");
    });

  if (handDepthShadowDirectionValue) {
    handDepthShadowDirectionValue.textContent = formatHandDepthShadowDirectionLabel(
      selectedHourIndex
    );
  }
}

function setHandDepthShadowDirectionHourIndex(hourIndex, persist = true) {
  if (!isSupportedHandDepthShadowDirectionHourIndex(hourIndex)) {
    return;
  }

  if (handDepthShadowDirectionClock) {
    handDepthShadowDirectionClock.dataset.selectedHourIndex = `${hourIndex}`;
  }

  if (persist) {
    setStoredHandDepthShadowDirectionHourIndex(hourIndex);
  }

  syncHandDepthShadowDirectionClock();
}

function initializeHandDepthShadowStrengthSlider() {
  if (!handDepthShadowStrengthSlider) {
    return;
  }

  handDepthShadowStrengthSlider.value = `${getStoredHandDepthShadowStrengthPct()}`;
}

function initializeHandDepthShadowDirectionClock() {
  if (!handDepthShadowDirectionClock) {
    return;
  }

  handDepthShadowDirectionClock.innerHTML = "";

  for (let hourIndex = 0; hourIndex < HAND_DEPTH_SHADOW_DIRECTION_STEPS; hourIndex += 1) {
    const hourButton = document.createElement("button");
    const angleRad = degToRad((hourIndex * 30) - 90);

    hourButton.type = "button";
    hourButton.className = "shadow-clock__hour";
    hourButton.dataset.hourIndex = `${hourIndex}`;
    hourButton.style.setProperty("--shadow-clock-x", `${Math.cos(angleRad).toFixed(4)}`);
    hourButton.style.setProperty("--shadow-clock-y", `${Math.sin(angleRad).toFixed(4)}`);
    hourButton.setAttribute("role", "radio");
    hourButton.setAttribute(
      "aria-label",
      `Set shadow direction to ${formatHandDepthShadowDirectionLabel(hourIndex)}`
    );
    hourButton.title = formatHandDepthShadowDirectionLabel(hourIndex);
    hourButton.addEventListener("click", () => {
      setHandDepthShadowDirectionHourIndex(hourIndex);
      refreshHandLayoutFromControls();
    });
    handDepthShadowDirectionClock.appendChild(hourButton);
  }

  setHandDepthShadowDirectionHourIndex(getStoredHandDepthShadowDirectionHourIndex(), false);
}

function getViewMode() {
  const selected = document.querySelector("input[name=\"view-mode\"]:checked");
  return selected && isSupportedViewMode(selected.value)
    ? selected.value
    : DEFAULT_VIEW_MODE;
}

function getHandLayoutMode() {
  const selected = document.querySelector("input[name=\"hand-layout-mode\"]:checked");
  return selected && isSupportedHandLayoutMode(selected.value)
    ? selected.value
    : DEFAULT_HAND_LAYOUT_MODE;
}

function getHandDirection() {
  const selected = document.querySelector("input[name=\"hand-direction\"]:checked");
  return selected && isSupportedHandDirection(selected.value)
    ? selected.value
    : DEFAULT_HAND_DIRECTION;
}

function isSupportedHandSuitSortMode(value) {
  return value === "auto" || value === "manual";
}

function isSupportedHandRankPolicy(value) {
  return value === "high_low" || value === "low_high";
}

function isSupportedHandSortPreset(value) {
  return value === "auto_ranked" || value === "manual_suits_ranked" || value === "manual_free";
}

function getSelectedHandSortPreset() {
  const selected = document.querySelector("input[name=\"hand-sort-preset\"]:checked");
  return selected && isSupportedHandSortPreset(selected.value) ? selected.value : "auto_ranked";
}

function isSupportedTrickAnimationSpeedPreset(value) {
  return value === "slow" || value === "medium" || value === "fast";
}

function isSupportedTrickBotAnimationMode(value) {
  return value === "seat_launch" || value === "edge_fly";
}

function getStoredTrickAnimationSpeedPreset() {
  const storedValue = getStoredString(TRICK_ANIMATION_SPEED_STORAGE_KEY);
  return isSupportedTrickAnimationSpeedPreset(storedValue)
    ? storedValue
    : DEFAULT_TRICK_ANIMATION_SPEED_PRESET;
}

function getStoredTrickBotAnimationMode() {
  const storedValue = getStoredString(TRICK_BOT_ANIMATION_MODE_STORAGE_KEY);
  return isSupportedTrickBotAnimationMode(storedValue)
    ? storedValue
    : DEFAULT_TRICK_BOT_ANIMATION_MODE;
}

function setStoredTrickAnimationSpeedPreset(value) {
  if (isSupportedTrickAnimationSpeedPreset(value)) {
    setStoredStringOrClear(TRICK_ANIMATION_SPEED_STORAGE_KEY, value);
    return;
  }

  setStoredStringOrClear(TRICK_ANIMATION_SPEED_STORAGE_KEY, DEFAULT_TRICK_ANIMATION_SPEED_PRESET);
}

function setStoredTrickBotAnimationMode(value) {
  if (isSupportedTrickBotAnimationMode(value)) {
    setStoredStringOrClear(TRICK_BOT_ANIMATION_MODE_STORAGE_KEY, value);
    return;
  }

  setStoredStringOrClear(TRICK_BOT_ANIMATION_MODE_STORAGE_KEY, DEFAULT_TRICK_BOT_ANIMATION_MODE);
}

function setTrickAnimationSpeedPreset(nextPreset, persist = true) {
  const resolvedPreset = isSupportedTrickAnimationSpeedPreset(nextPreset)
    ? nextPreset
    : DEFAULT_TRICK_ANIMATION_SPEED_PRESET;
  trickAnimationSpeedPreset = resolvedPreset;

  if (trickAnimationSpeedSelect) {
    trickAnimationSpeedSelect.value = resolvedPreset;
  }

  if (persist) {
    setStoredTrickAnimationSpeedPreset(resolvedPreset);
  }
}

function setTrickBotAnimationMode(nextMode, persist = true) {
  const resolvedMode = isSupportedTrickBotAnimationMode(nextMode)
    ? nextMode
    : DEFAULT_TRICK_BOT_ANIMATION_MODE;
  trickBotAnimationMode = resolvedMode;

  if (trickBotAnimationModeSelect) {
    trickBotAnimationModeSelect.value = resolvedMode;
  }

  if (persist) {
    setStoredTrickBotAnimationMode(resolvedMode);
  }
}

function initializeTrickAnimationSpeedControl() {
  setTrickAnimationSpeedPreset(getStoredTrickAnimationSpeedPreset(), false);
  setTrickBotAnimationMode(getStoredTrickBotAnimationMode(), false);
}

function getTrickAnimationProfile() {
  if (isTapTapMode()) {
    const baseFastProfile =
      TRICK_ANIMATION_SPEED_PRESETS.fast ??
      TRICK_ANIMATION_SPEED_PRESETS[DEFAULT_TRICK_ANIMATION_SPEED_PRESET];
    const durationMultiplier =
      TAPTAP_ANIMATION_SPEED_DURATION_MULTIPLIERS[trickAnimationSpeedPreset] ?? 1;
    return {
      ...baseFastProfile,
      humanFlightMs: Math.round(baseFastProfile.humanFlightMs * durationMultiplier),
      botFlightMs: Math.round(baseFastProfile.botFlightMs * durationMultiplier),
      botStaggerMs: Math.round(baseFastProfile.botStaggerMs * durationMultiplier),
      highlightMs: Math.round(baseFastProfile.highlightMs * durationMultiplier),
      collectMs: Math.round(baseFastProfile.collectMs * durationMultiplier),
      cleanupMs: Math.round(baseFastProfile.cleanupMs * durationMultiplier)
    };
  }

  return TRICK_ANIMATION_SPEED_PRESETS[trickAnimationSpeedPreset] ??
    TRICK_ANIMATION_SPEED_PRESETS[DEFAULT_TRICK_ANIMATION_SPEED_PRESET];
}

function syncHandSortPresetControlsFromLegacy() {
  if (handSortPresetInputs.length === 0) {
    return;
  }

  const effectiveMode = getEffectiveHandSortMode();
  const preset = isSupportedHandSortPreset(effectiveMode) ? effectiveMode : "auto_ranked";
  handSortPresetInputs.forEach((input) => {
    input.checked = input.value === preset;
  });
}

function applyHandSortPresetToLegacy(preset) {
  if (
    !isSupportedHandSortPreset(preset) ||
    !handSuitSortModeSelect ||
    !rankSortEnabledToggle
  ) {
    return;
  }

  handSuitSortModeBeforeRankSortOff = null;

  if (preset === "manual_free") {
    handSuitSortModeSelect.value = "manual";
    rankSortEnabledToggle.checked = false;
  } else if (preset === "manual_suits_ranked") {
    handSuitSortModeSelect.value = "manual";
    rankSortEnabledToggle.checked = true;
  } else {
    handSuitSortModeSelect.value = "auto";
    rankSortEnabledToggle.checked = true;
  }

  enforceHandSortControlCoercion();
  syncHandSortPresetControlsFromLegacy();
}

function getHandSuitSortMode() {
  if (!handSuitSortModeSelect || !isSupportedHandSuitSortMode(handSuitSortModeSelect.value)) {
    return DEFAULT_HAND_SUIT_SORT_MODE;
  }

  return handSuitSortModeSelect.value;
}

function isRankSortEnabled() {
  return HAND_SORTING_API !== null &&
    (
      rankSortEnabledToggle
        ? rankSortEnabledToggle.checked
        : DEFAULT_RANK_SORT_ENABLED
    );
}

function enforceHandSortControlCoercion() {
  if (!handSuitSortModeSelect) {
    return;
  }

  if (!isRankSortEnabled()) {
    if (
      handSuitSortModeBeforeRankSortOff === null &&
      isSupportedHandSuitSortMode(handSuitSortModeSelect.value)
    ) {
      handSuitSortModeBeforeRankSortOff = handSuitSortModeSelect.value;
    }

    handSuitSortModeSelect.value = "manual";
    return;
  }

  if (
    handSuitSortModeBeforeRankSortOff !== null &&
    isSupportedHandSuitSortMode(handSuitSortModeBeforeRankSortOff)
  ) {
    handSuitSortModeSelect.value = handSuitSortModeBeforeRankSortOff;
  }
  handSuitSortModeBeforeRankSortOff = null;

  if (!isSupportedHandSuitSortMode(handSuitSortModeSelect.value)) {
    handSuitSortModeSelect.value = DEFAULT_HAND_SUIT_SORT_MODE;
  }
}

function getRequestedHandSortConfig() {
  return {
    suitSortMode: getHandSuitSortMode(),
    rankSortEnabled: isRankSortEnabled(),
    rankPolicy: getHandRankPolicy()
  };
}

function getEffectiveHandSortMode() {
  const requestedConfig = getRequestedHandSortConfig();

  if (!requestedConfig.rankSortEnabled) {
    return "manual_free";
  }

  if (requestedConfig.suitSortMode === "manual") {
    return "manual_suits_ranked";
  }

  return "auto_ranked";
}

function getHandRankPolicy() {
  if (!handRankPolicySelect || !isSupportedHandRankPolicy(handRankPolicySelect.value)) {
    return DEFAULT_HAND_RANK_POLICY;
  }

  return handRankPolicySelect.value;
}

function getCardDealIndex(card, fallbackIndex) {
  const candidate = card?.dealIndex;
  if (Number.isInteger(candidate) && candidate >= 0) {
    return candidate;
  }

  return fallbackIndex;
}

function getCardsInDealOrder(cards) {
  if (!Array.isArray(cards) || cards.length <= 1) {
    return cards;
  }

  return cards
    .map((card, sourceIndex) => ({
      card,
      sourceIndex,
      dealIndex: getCardDealIndex(card, sourceIndex)
    }))
    .sort((left, right) => {
      if (left.dealIndex !== right.dealIndex) {
        return left.dealIndex - right.dealIndex;
      }

      return left.sourceIndex - right.sourceIndex;
    })
    .map((entry) => entry.card);
}

function areCardIdSetsEqual(leftIds, rightIds) {
  if (!Array.isArray(leftIds) || !Array.isArray(rightIds) || leftIds.length !== rightIds.length) {
    return false;
  }

  const leftSet = new Set(leftIds);
  if (leftSet.size !== leftIds.length) {
    return false;
  }

  for (let index = 0; index < rightIds.length; index += 1) {
    if (!leftSet.has(rightIds[index])) {
      return false;
    }
  }

  return true;
}

function clearManualCardOrder() {
  manualCardOrder = null;
}

function clearManualSuitOrder() {
  manualSuitOrder = null;
}

function getGroupOrderFromCardSequence(cards) {
  if (!Array.isArray(cards) || cards.length === 0) {
    return [];
  }

  const groupOrder = [];
  const seenGroupKeys = new Set();

  cards.forEach((card) => {
    const groupKey = getCardGroupKey(card);
    if (!isSupportedManualGroupKey(groupKey) || seenGroupKeys.has(groupKey)) {
      return;
    }

    seenGroupKeys.add(groupKey);
    groupOrder.push(groupKey);
  });

  return groupOrder;
}

function getNormalizedManualGroupOrder(groupOrder) {
  if (!Array.isArray(groupOrder) || groupOrder.length === 0) {
    return [];
  }

  const normalizedOrder = [];
  const seenGroupKeys = new Set();

  groupOrder.forEach((groupKey) => {
    if (!isSupportedManualGroupKey(groupKey) || seenGroupKeys.has(groupKey)) {
      return;
    }

    seenGroupKeys.add(groupKey);
    normalizedOrder.push(groupKey);
  });

  return normalizedOrder;
}

function getCardGroupKey(card) {
  if (!card || typeof card !== "object") {
    return null;
  }

  if (card.rank === "JOKER") {
    return JOKER_GROUP_KEY;
  }

  return isStandardSuit(card.suit) ? card.suit : null;
}

function getCardElementGroupKey(cardElement) {
  if (!(cardElement instanceof HTMLElement)) {
    return null;
  }

  if (cardElement.dataset.rank === "JOKER") {
    return JOKER_GROUP_KEY;
  }

  const suit = cardElement.dataset.suit;
  return isStandardSuit(suit) ? suit : null;
}

function isSupportedManualGroupKey(groupKey) {
  return groupKey === JOKER_GROUP_KEY || isStandardSuit(groupKey);
}

function getSuitColorCategory(suit) {
  if (suit === "hearts" || suit === "diamonds") {
    return "red";
  }

  if (suit === "clubs" || suit === "spades") {
    return "black";
  }

  return null;
}

function shouldShowWhistSameColorSuitGap(total, orderedCardElements) {
  return playMechanicMode === "whist" &&
    getEffectiveHandSortMode() !== "manual_free" &&
    total > 1 &&
    Array.isArray(orderedCardElements) &&
    orderedCardElements.length === total;
}

function getWhistSameColorSuitGapBoundaries(total, orderedCardElements) {
  if (!shouldShowWhistSameColorSuitGap(total, orderedCardElements)) {
    return [];
  }

  const boundaries = [];
  let previousGroupKey = null;

  orderedCardElements.forEach((cardElement, index) => {
    const groupKey = getCardElementGroupKey(cardElement);
    if (groupKey === previousGroupKey) {
      return;
    }

    if (isStandardSuit(previousGroupKey) && isStandardSuit(groupKey)) {
      const previousColor = getSuitColorCategory(previousGroupKey);
      const nextColor = getSuitColorCategory(groupKey);
      if (previousColor !== null && previousColor === nextColor && index > 0) {
        boundaries.push(index);
      }
    }

    previousGroupKey = groupKey;
  });

  return boundaries;
}

function applySameColorSuitGapToLayoutState(layoutState, gapBoundaries) {
  if (
    !layoutState ||
    !Array.isArray(layoutState.layouts) ||
    layoutState.layouts.length <= 1 ||
    !Array.isArray(gapBoundaries) ||
    gapBoundaries.length === 0
  ) {
    return layoutState;
  }

  const normalizedBoundaries = [];
  const seenBoundaries = new Set();
  gapBoundaries.forEach((boundaryIndex) => {
    if (!Number.isInteger(boundaryIndex) || boundaryIndex <= 0 || boundaryIndex >= layoutState.layouts.length) {
      return;
    }
    if (seenBoundaries.has(boundaryIndex)) {
      return;
    }
    seenBoundaries.add(boundaryIndex);
    normalizedBoundaries.push(boundaryIndex);
  });

  if (normalizedBoundaries.length === 0) {
    return layoutState;
  }

  normalizedBoundaries.sort((left, right) => left - right);

  const firstAnchorX = layoutState.layouts[0]?.anchorX;
  const lastAnchorX = layoutState.layouts[layoutState.layouts.length - 1]?.anchorX;
  const direction = Number.isFinite(firstAnchorX) && Number.isFinite(lastAnchorX) && lastAnchorX < firstAnchorX
    ? -1
    : 1;
  const gapStepX = (Number.isFinite(layoutState.visibleWidth) ? layoutState.visibleWidth : 0) * direction;
  const cumulativeOffsets = new Array(layoutState.layouts.length).fill(0);
  let boundaryCursor = 0;
  let passedBoundaryCount = 0;

  for (let index = 0; index < layoutState.layouts.length; index += 1) {
    while (
      boundaryCursor < normalizedBoundaries.length &&
      normalizedBoundaries[boundaryCursor] <= index
    ) {
      passedBoundaryCount += 1;
      boundaryCursor += 1;
    }
    cumulativeOffsets[index] = passedBoundaryCount * gapStepX;
  }

  layoutState.layouts = layoutState.layouts.map((layout, index) => {
    const offsetX = cumulativeOffsets[index] ?? 0;
    if (offsetX === 0) {
      return layout;
    }

    return {
      ...layout,
      anchorX: layout.anchorX + offsetX,
      contour: Array.isArray(layout.contour)
        ? layout.contour.map((point) => ({ ...point, x: point.x + offsetX }))
        : layout.contour
    };
  });

  if (
    Array.isArray(layoutState.curvePoints) &&
    layoutState.curvePoints.length === layoutState.layouts.length
  ) {
    layoutState.curvePoints = layoutState.curvePoints.map((point, index) => {
      const offsetX = cumulativeOffsets[index] ?? 0;
      if (offsetX === 0) {
        return point;
      }

      return {
        ...point,
        x: point.x + offsetX
      };
    });
  }

  layoutState.sameColorSuitGapBoundaries = normalizedBoundaries;
  layoutState.sameColorSuitGapCount = normalizedBoundaries.length;
  return layoutState;
}

function areGroupKeySetsEqual(leftKeys, rightKeys) {
  if (!Array.isArray(leftKeys) || !Array.isArray(rightKeys) || leftKeys.length !== rightKeys.length) {
    return false;
  }

  const leftSet = new Set(leftKeys);
  if (leftSet.size !== leftKeys.length) {
    return false;
  }

  for (let index = 0; index < rightKeys.length; index += 1) {
    if (!leftSet.has(rightKeys[index])) {
      return false;
    }
  }

  return true;
}

function getCardsByManualOrder(cards) {
  const cardsInDealOrder = getCardsInDealOrder(cards);

  if (!Array.isArray(cardsInDealOrder) || cardsInDealOrder.length <= 1) {
    return cardsInDealOrder;
  }

  if (!Array.isArray(manualCardOrder) || manualCardOrder.length !== cardsInDealOrder.length) {
    return cardsInDealOrder;
  }

  const cardById = new Map();

  for (let index = 0; index < cardsInDealOrder.length; index += 1) {
    const card = cardsInDealOrder[index];
    const cardId = card?.cardId;

    if (typeof cardId !== "string" || cardId.length === 0 || cardById.has(cardId)) {
      clearManualCardOrder();
      return cardsInDealOrder;
    }

    cardById.set(cardId, card);
  }

  if (!areCardIdSetsEqual(manualCardOrder, Array.from(cardById.keys()))) {
    clearManualCardOrder();
    return cardsInDealOrder;
  }

  return manualCardOrder.map((cardId) => cardById.get(cardId));
}

function sortCardsByManualSuitsRanked(cards) {
  if (!Array.isArray(cards) || cards.length === 0) {
    return cards;
  }

  const cardsInDealOrder = getCardsInDealOrder(cards);
  const annotatedCards = cardsInDealOrder.map((card, fallbackIndex) => ({
    card,
    originalIndex: getCardDealIndex(card, fallbackIndex)
  }));
  const suitBuckets = STANDARD_SUIT_CONFIG.reduce((buckets, entry) => {
    buckets[entry.suit] = [];
    return buckets;
  }, {});
  const groupOrder = [];
  const groupSeen = new Set();
  const jokers = [];

  annotatedCards.forEach((entry) => {
    if (entry.card.rank === "JOKER") {
      jokers.push(entry);
      if (!groupSeen.has(JOKER_GROUP_KEY)) {
        groupSeen.add(JOKER_GROUP_KEY);
        groupOrder.push(JOKER_GROUP_KEY);
      }
      return;
    }

    const suit = entry.card.suit;
    if (!Object.prototype.hasOwnProperty.call(suitBuckets, suit)) {
      return;
    }

    suitBuckets[suit].push(entry);

    if (!groupSeen.has(suit)) {
      groupSeen.add(suit);
      groupOrder.push(suit);
    }
  });

  const sortedEntriesByGroup = new Map();
  const rankPolicy = getHandRankPolicy();
  groupOrder.forEach((groupKey) => {
    if (groupKey === JOKER_GROUP_KEY) {
      sortedEntriesByGroup.set(groupKey, [...jokers]);
      return;
    }

    const suit = groupKey;
    const sortedSuitEntries = HAND_SORTING_API.sortSuitCards(suitBuckets[suit], rankPolicy);
    sortedEntriesByGroup.set(groupKey, sortedSuitEntries);
  });

  let effectiveGroupOrder = [...groupOrder];

  if (Array.isArray(manualSuitOrder) && manualSuitOrder.length > 0) {
    const normalizedManualOrder = getNormalizedManualGroupOrder(manualSuitOrder);
    if (normalizedManualOrder.length === 0) {
      clearManualSuitOrder();
    } else {
      const availableGroupKeys = new Set(groupOrder);
      const manualPresentOrder = normalizedManualOrder.filter((groupKey) => availableGroupKeys.has(groupKey));

      if (manualPresentOrder.length > 0) {
        const manualPresentSet = new Set(manualPresentOrder);
        const fallbackGroups = groupOrder.filter((groupKey) => !manualPresentSet.has(groupKey));
        effectiveGroupOrder = [...manualPresentOrder, ...fallbackGroups];
      } else {
        clearManualSuitOrder();
      }
    }
  }

  const sorted = [];
  effectiveGroupOrder.forEach((groupKey) => {
    const groupEntries = sortedEntriesByGroup.get(groupKey) ?? [];
    groupEntries.forEach((entry) => {
      sorted.push(entry.card);
    });
  });

  return sorted;
}

function getCardsForView(cards, viewMode) {
  if (viewMode !== "hand" || HAND_SORTING_API === null) {
    return cards;
  }

  const effectiveSortMode = getEffectiveHandSortMode();

  if (effectiveSortMode === "manual_free") {
    return getCardsByManualOrder(cards);
  }

  try {
    if (effectiveSortMode === "manual_suits_ranked") {
      return sortCardsByManualSuitsRanked(cards);
    }

    return HAND_SORTING_API.sortHandCards(cards, {
      rankPolicy: getHandRankPolicy()
    }).sortedCards;
  } catch (_error) {
    return cards;
  }
}

function isCardDragEnabled() {
  return getViewMode() === "hand" && !isTrickInteractionLocked();
}

function isCardDragTrackedPointer(event) {
  return cardDragState !== null &&
    cardDragState.mode === "card" &&
    cardDragState.pointerId === event.pointerId;
}

function isCardDragActive() {
  return cardDragState !== null && cardDragState.mode === "card" && cardDragState.active === true;
}

function isSuitDragTrackedPointer(event) {
  return cardDragState !== null &&
    cardDragState.mode === "suit" &&
    cardDragState.pointerId === event.pointerId;
}

function isSuitDragActive() {
  return cardDragState !== null && cardDragState.mode === "suit" && cardDragState.active === true;
}

function isAnyDragActive() {
  return cardDragState !== null && cardDragState.active === true;
}

function isSuitDragEnabled() {
  return getViewMode() === "hand" && isRankSortEnabled() && !isTrickInteractionLocked();
}

function resetCardDragState() {
  if (
    cardDragState &&
    cardDragState.dragCardElement &&
    Number.isInteger(cardDragState.pointerId) &&
    typeof cardDragState.dragCardElement.hasPointerCapture === "function" &&
    cardDragState.dragCardElement.hasPointerCapture(cardDragState.pointerId)
  ) {
    cardDragState.dragCardElement.releasePointerCapture(cardDragState.pointerId);
  }

  cardDragState = null;
  cardTable.classList.remove("card-table--dragging");
  cardTable.querySelectorAll(".card").forEach((cardElement) => {
    cardElement.style.removeProperty("transition");
    cardElement.style.removeProperty("pointer-events");
  });
}

function getCardElementsInCurrentLayoutOrder() {
  const cardElements = Array.from(cardTable.querySelectorAll(".card"));

  if (!isAnyDragActive() || !Array.isArray(cardDragState.previewOrderCardIds)) {
    return cardElements;
  }

  const orderIndexByCardId = new Map();
  cardDragState.previewOrderCardIds.forEach((cardId, index) => {
    if (typeof cardId === "string" && cardId.length > 0 && !orderIndexByCardId.has(cardId)) {
      orderIndexByCardId.set(cardId, index);
    }
  });

  return cardElements
    .map((cardElement, domIndex) => ({
      cardElement,
      domIndex,
      orderIndex: orderIndexByCardId.has(cardElement.dataset.cardId)
        ? orderIndexByCardId.get(cardElement.dataset.cardId)
        : Number.MAX_SAFE_INTEGER
    }))
    .sort((left, right) => {
      if (left.orderIndex !== right.orderIndex) {
        return left.orderIndex - right.orderIndex;
      }

      return left.domIndex - right.domIndex;
    })
    .map((entry) => entry.cardElement);
}

function getDraggedSuitGroupCenterClientX() {
  if (!isSuitDragActive()) {
    return null;
  }

  const draggedCenterX =
    cardDragState.dragGroupStartClientCenterX +
    (cardDragState.lastClientX - cardDragState.startClientX);
  return Number.isFinite(draggedCenterX) ? draggedCenterX : null;
}

function getSuitDragVirtualGapCardSlots() {
  return Math.max(0, SUIT_DRAG_GAP_SLOT_COUNT);
}

function getSuitDragCardsBeforeInsertionGap() {
  if (!isSuitDragActive()) {
    return 0;
  }

  const previewOrderGroupKeys = Array.isArray(cardDragState.previewOrderGroupKeys)
    ? cardDragState.previewOrderGroupKeys
    : [];
  const groupOrderWithoutDragged = previewOrderGroupKeys.filter(
    (groupKey) => groupKey !== cardDragState.dragGroupKey
  );
  const rawInsertionIndex = Number.isInteger(cardDragState.insertionIndex)
    ? cardDragState.insertionIndex
    : groupOrderWithoutDragged.length;
  const insertionGroupIndex = Math.max(
    0,
    Math.min(rawInsertionIndex, groupOrderWithoutDragged.length)
  );
  const cardIdsByGroup = cardDragState.cardIdsByGroup instanceof Map
    ? cardDragState.cardIdsByGroup
    : null;

  let cardsBeforeGap = 0;
  for (let index = 0; index < insertionGroupIndex; index += 1) {
    const groupKey = groupOrderWithoutDragged[index];
    const groupCardIds = cardIdsByGroup?.get(groupKey);
    cardsBeforeGap += Array.isArray(groupCardIds) ? groupCardIds.length : 0;
  }

  return cardsBeforeGap;
}

function buildSuitDragLayoutPlan(cardElements) {
  if (!isSuitDragActive() || !Array.isArray(cardElements) || cardElements.length === 0) {
    return null;
  }

  const draggedCardIds = Array.isArray(cardDragState.dragCardIds) ? cardDragState.dragCardIds : [];
  if (draggedCardIds.length === 0) {
    return null;
  }

  const draggedCardIdSet = new Set(draggedCardIds);
  const nonDraggedEntries = [];
  const draggedEntries = [];

  cardElements.forEach((cardElement, orderIndex) => {
    const cardId = cardElement?.dataset?.cardId;
    if (typeof cardId !== "string" || cardId.length === 0) {
      return;
    }

    const entry = { cardElement, orderIndex };
    if (draggedCardIdSet.has(cardId)) {
      draggedEntries.push(entry);
      return;
    }

    nonDraggedEntries.push(entry);
  });

  const virtualGapCardSlots = getSuitDragVirtualGapCardSlots();
  const virtualCardCount = nonDraggedEntries.length + virtualGapCardSlots;
  if (virtualCardCount <= 0) {
    return null;
  }

  const metrics = getHandLayoutMetrics(virtualCardCount);
  if (!metrics || !Array.isArray(metrics.cardLayouts) || metrics.cardLayouts.length === 0) {
    return null;
  }

  const maxCardsBeforeGap = nonDraggedEntries.length;
  const cardsBeforeGap = Math.max(
    0,
    Math.min(getSuitDragCardsBeforeInsertionGap(), maxCardsBeforeGap)
  );
  const layoutEntries = [];

  nonDraggedEntries.forEach((entry, nonDraggedIndex) => {
    const layoutIndex = nonDraggedIndex < cardsBeforeGap
      ? nonDraggedIndex
      : nonDraggedIndex + virtualGapCardSlots;
    layoutEntries.push({
      ...entry,
      layoutIndex
    });
  });

  const gapMidpointIndex = cardsBeforeGap + (virtualGapCardSlots / 2);
  const dragLayoutIndex = Math.max(
    0,
    Math.min(
      metrics.cardLayouts.length - 1,
      Math.round(Math.max(0, gapMidpointIndex - 0.5))
    )
  );

  draggedEntries.forEach((entry) => {
    layoutEntries.push({
      ...entry,
      layoutIndex: dragLayoutIndex
    });
  });

  layoutEntries.sort((left, right) => left.orderIndex - right.orderIndex);

  return {
    metrics,
    layoutEntries
  };
}

function buildSuitDragShadowLayoutPlan(cardElements, fullMetrics) {
  if (
    !SUIT_DRAG_SHADOW_MODEL_ENABLED ||
    !isSuitDragActive() ||
    !Array.isArray(cardElements) ||
    cardElements.length === 0
  ) {
    return null;
  }

  if (
    !fullMetrics ||
    !Array.isArray(fullMetrics.cardLayouts) ||
    !Number.isFinite(fullMetrics.cardWidth) ||
    !Number.isFinite(fullMetrics.cardHeight)
  ) {
    return null;
  }

  const cardIdSet = new Set();
  cardElements.forEach((cardElement) => {
    const cardId = cardElement?.dataset?.cardId;
    if (typeof cardId === "string" && cardId.length > 0) {
      cardIdSet.add(cardId);
    }
  });
  if (cardIdSet.size !== cardElements.length) {
    return null;
  }

  const previewOrderGroupKeys = Array.isArray(cardDragState.previewOrderGroupKeys)
    ? cardDragState.previewOrderGroupKeys
    : [];
  const groupOrderWithoutDragged = previewOrderGroupKeys.filter(
    (groupKey) => groupKey !== cardDragState.dragGroupKey
  );
  const insertionSlotCount = groupOrderWithoutDragged.length + 1;
  const cardIdsByGroup = cardDragState.cardIdsByGroup;
  const dragCardIds = Array.isArray(cardDragState.dragCardIds) ? cardDragState.dragCardIds : [];
  if (!(cardIdsByGroup instanceof Map) || dragCardIds.length === 0 || insertionSlotCount <= 0) {
    return null;
  }

  const tableRect = cardTable.getBoundingClientRect();
  const plans = [];
  for (let insertionIndex = 0; insertionIndex < insertionSlotCount; insertionIndex += 1) {
    const nextGroupOrder = [...groupOrderWithoutDragged];
    nextGroupOrder.splice(insertionIndex, 0, cardDragState.dragGroupKey);
    const nextCardOrder = buildPreviewCardOrderFromGroups(
      nextGroupOrder,
      cardIdsByGroup,
      cardDragState.trailingCardIds ?? []
    );

    if (nextCardOrder.length !== fullMetrics.cardLayouts.length) {
      return null;
    }

    const layoutsById = new Map();
    for (let layoutIndex = 0; layoutIndex < nextCardOrder.length; layoutIndex += 1) {
      const cardId = nextCardOrder[layoutIndex];
      if (!cardIdSet.has(cardId)) {
        return null;
      }

      const cardLayout = fullMetrics.cardLayouts[layoutIndex];
      if (
        !cardLayout ||
        !Number.isFinite(cardLayout.left) ||
        !Number.isFinite(cardLayout.top) ||
        !Number.isFinite(cardLayout.thetaDeg)
      ) {
        return null;
      }

      layoutsById.set(cardId, {
        left: cardLayout.left,
        top: cardLayout.top,
        thetaDeg: cardLayout.thetaDeg
      });
    }

    let centerSumX = 0;
    let centerSumY = 0;
    let centerCount = 0;
    dragCardIds.forEach((cardId) => {
      const dragLayout = layoutsById.get(cardId);
      if (!dragLayout) {
        return;
      }

      centerSumX += dragLayout.left + (fullMetrics.cardWidth / 2);
      centerSumY += dragLayout.top + (fullMetrics.cardHeight / 2);
      centerCount += 1;
    });

    if (centerCount <= 0) {
      return null;
    }

    const centerTableX = centerSumX / centerCount;
    const centerTableY = centerSumY / centerCount;
    const centerClientX = tableRect.left + centerTableX;
    if (!Number.isFinite(centerClientX)) {
      return null;
    }

    plans.push({
      insertionIndex,
      centerClientX,
      centerTableX,
      centerTableY,
      layoutsById
    });
  }

  if (plans.length === 0) {
    return null;
  }

  const sortedPlans = [...plans].sort((left, right) => left.centerClientX - right.centerClientX);
  const referenceClientX = getDraggedSuitGroupCenterClientX();
  const fallbackPlan = sortedPlans[0];
  if (!Number.isFinite(referenceClientX)) {
    return {
      layoutsById: fallbackPlan.layoutsById,
      centerTableX: fallbackPlan.centerTableX,
      centerTableY: fallbackPlan.centerTableY
    };
  }

  if (sortedPlans.length === 1) {
    const singlePlan = sortedPlans[0];
    return {
      layoutsById: singlePlan.layoutsById,
      centerTableX: singlePlan.centerTableX,
      centerTableY: singlePlan.centerTableY
    };
  }

  const firstPlan = sortedPlans[0];
  const lastPlan = sortedPlans[sortedPlans.length - 1];
  let leftPlan = null;
  let rightPlan = null;
  if (referenceClientX <= firstPlan.centerClientX) {
    leftPlan = firstPlan;
    rightPlan = sortedPlans[1];
  } else if (referenceClientX >= lastPlan.centerClientX) {
    leftPlan = sortedPlans[sortedPlans.length - 2];
    rightPlan = lastPlan;
  } else {
    for (let index = 0; index < sortedPlans.length - 1; index += 1) {
      const candidateLeft = sortedPlans[index];
      const candidateRight = sortedPlans[index + 1];
      if (referenceClientX >= candidateLeft.centerClientX && referenceClientX <= candidateRight.centerClientX) {
        leftPlan = candidateLeft;
        rightPlan = candidateRight;
        break;
      }
    }
  }

  if (!leftPlan || !rightPlan) {
    return {
      layoutsById: fallbackPlan.layoutsById,
      centerTableX: fallbackPlan.centerTableX,
      centerTableY: fallbackPlan.centerTableY
    };
  }

  const span = rightPlan.centerClientX - leftPlan.centerClientX;
  const interpolationT = !Number.isFinite(span) || Math.abs(span) <= 0.0001
    ? 0
    : ((referenceClientX - leftPlan.centerClientX) / span);
  const lerp = (leftValue, rightValue) => leftValue + (rightValue - leftValue) * interpolationT;
  const interpolatedLayoutsById = new Map();
  dragCardIds.forEach((cardId) => {
    const leftLayout = leftPlan.layoutsById.get(cardId);
    const rightLayout = rightPlan.layoutsById.get(cardId);
    if (!leftLayout || !rightLayout) {
      return;
    }

    interpolatedLayoutsById.set(cardId, {
      left: lerp(leftLayout.left, rightLayout.left),
      top: lerp(leftLayout.top, rightLayout.top),
      thetaDeg: lerp(leftLayout.thetaDeg, rightLayout.thetaDeg)
    });
  });

  if (interpolatedLayoutsById.size === 0) {
    return null;
  }

  return {
    layoutsById: interpolatedLayoutsById,
    centerTableX: lerp(leftPlan.centerTableX, rightPlan.centerTableX),
    centerTableY: lerp(leftPlan.centerTableY, rightPlan.centerTableY)
  };
}

function getInterpolatedSampleValueByClientX(samples, referenceClientX, valueKey) {
  if (!Array.isArray(samples) || samples.length === 0 || !Number.isFinite(referenceClientX)) {
    return null;
  }

  const sortedSamples = samples
    .filter((sample) => (
      sample &&
      Number.isFinite(sample.centerX) &&
      Number.isFinite(sample[valueKey])
    ))
    .sort((left, right) => left.centerX - right.centerX);
  if (sortedSamples.length === 0) {
    return null;
  }

  const firstSample = sortedSamples[0];
  const lastSample = sortedSamples[sortedSamples.length - 1];
  const getEdgeExtrapolatedValue = (baseSample, adjacentSample) => {
    if (!baseSample || !adjacentSample) {
      return baseSample?.[valueKey] ?? null;
    }

    const deltaX = adjacentSample.centerX - baseSample.centerX;
    if (!Number.isFinite(deltaX) || Math.abs(deltaX) <= 0.0001) {
      return baseSample[valueKey];
    }

    const slope = (adjacentSample[valueKey] - baseSample[valueKey]) / deltaX;
    return baseSample[valueKey] + slope * (referenceClientX - baseSample.centerX);
  };

  if (referenceClientX <= firstSample.centerX) {
    if (sortedSamples.length === 1) {
      return firstSample[valueKey];
    }

    return getEdgeExtrapolatedValue(firstSample, sortedSamples[1]);
  }

  if (referenceClientX >= lastSample.centerX) {
    if (sortedSamples.length === 1) {
      return lastSample[valueKey];
    }

    return getEdgeExtrapolatedValue(lastSample, sortedSamples[sortedSamples.length - 2]);
  }

  for (let index = 0; index < sortedSamples.length - 1; index += 1) {
    const leftSample = sortedSamples[index];
    const rightSample = sortedSamples[index + 1];

    if (referenceClientX < leftSample.centerX || referenceClientX > rightSample.centerX) {
      continue;
    }

    const span = rightSample.centerX - leftSample.centerX;
    if (!Number.isFinite(span) || span <= 0) {
      return leftSample[valueKey];
    }

    const ratio = (referenceClientX - leftSample.centerX) / span;
    return leftSample[valueKey] + (rightSample[valueKey] - leftSample[valueKey]) * ratio;
  }

  return lastSample[valueKey];
}

function getInterpolatedTiltDegFromSamples(tiltSamples, referenceClientX) {
  return getInterpolatedSampleValueByClientX(tiltSamples, referenceClientX, "tiltDeg");
}

function buildSuitDragCurveSamples(layoutEntries, metrics) {
  if (!isSuitDragActive() || !Array.isArray(layoutEntries) || !metrics) {
    return [];
  }

  const cardLayouts = Array.isArray(metrics.cardLayouts) ? metrics.cardLayouts : [];
  const tableRect = cardTable.getBoundingClientRect();
  const draggedCardIdSet = new Set(Array.isArray(cardDragState.dragCardIds) ? cardDragState.dragCardIds : []);
  const curveSamples = [];

  layoutEntries.forEach((entry) => {
    const cardElement = entry?.cardElement;
    const cardId = cardElement?.dataset?.cardId;
    if (typeof cardId !== "string" || draggedCardIdSet.has(cardId)) {
      return;
    }

    const layoutIndex = Number.isInteger(entry.layoutIndex) ? entry.layoutIndex : -1;
    if (layoutIndex < 0 || layoutIndex >= cardLayouts.length) {
      return;
    }

    const cardLayout = cardLayouts[layoutIndex];
    if (!cardLayout || !Number.isFinite(cardLayout.thetaDeg)) {
      return;
    }

    const centerX = tableRect.left + cardLayout.left + (metrics.cardWidth / 2);
    const centerTableX = cardLayout.left + (metrics.cardWidth / 2);
    const centerTableY = cardLayout.top + (metrics.cardHeight / 2);
    if (!Number.isFinite(centerX)) {
      return;
    }

    curveSamples.push({
      centerX,
      centerTableX,
      centerTableY,
      tiltDeg: cardLayout.thetaDeg
    });
  });

  return curveSamples;
}

function getSuitDragCurveSampleAtClientX(curveSamples, referenceClientX) {
  if (!Array.isArray(curveSamples) || curveSamples.length === 0 || !Number.isFinite(referenceClientX)) {
    return null;
  }

  const centerTableX = getInterpolatedSampleValueByClientX(curveSamples, referenceClientX, "centerTableX");
  const centerTableY = getInterpolatedSampleValueByClientX(curveSamples, referenceClientX, "centerTableY");
  const tiltDeg = getInterpolatedTiltDegFromSamples(curveSamples, referenceClientX);
  if (!Number.isFinite(centerTableX) || !Number.isFinite(centerTableY) || !Number.isFinite(tiltDeg)) {
    return null;
  }

  return {
    centerTableX,
    centerTableY,
    tiltDeg
  };
}

function getSuitDragTargetTiltDegFromLayoutEntries(layoutEntries, metrics, curveSamples = null) {
  if (!isSuitDragActive() || !Array.isArray(layoutEntries) || !metrics) {
    return null;
  }

  const referenceClientX = getDraggedSuitGroupCenterClientX();
  if (!Number.isFinite(referenceClientX)) {
    return null;
  }

  const resolvedCurveSamples = Array.isArray(curveSamples)
    ? curveSamples
    : buildSuitDragCurveSamples(layoutEntries, metrics);
  const sample = getSuitDragCurveSampleAtClientX(resolvedCurveSamples, referenceClientX);
  if (sample && Number.isFinite(sample.tiltDeg)) {
    return sample.tiltDeg;
  }

  return Number.isFinite(cardDragState.dragGroupBaseMeanTiltDeg)
    ? cardDragState.dragGroupBaseMeanTiltDeg
    : 0;
}

function getSuitDragTargetCenterFromLayoutEntries(layoutEntries, metrics, curveSamples = null) {
  if (!isSuitDragActive() || !Array.isArray(layoutEntries) || !metrics) {
    return null;
  }

  const deltaX = cardDragState.lastClientX - cardDragState.startClientX;
  const deltaY = cardDragState.lastClientY - cardDragState.startClientY;
  const fallbackCenterX = cardDragState.dragGroupStartCenterTableX + deltaX;
  const fallbackCenterY = cardDragState.dragGroupStartCenterTableY + deltaY;
  const referenceClientX = getDraggedSuitGroupCenterClientX();
  if (!Number.isFinite(referenceClientX)) {
    return {
      centerX: fallbackCenterX,
      centerY: fallbackCenterY
    };
  }

  const resolvedCurveSamples = Array.isArray(curveSamples)
    ? curveSamples
    : buildSuitDragCurveSamples(layoutEntries, metrics);
  if (resolvedCurveSamples.length === 0) {
    return {
      centerX: fallbackCenterX,
      centerY: fallbackCenterY
    };
  }

  const baseSample = getSuitDragCurveSampleAtClientX(resolvedCurveSamples, referenceClientX);

  return {
    centerX: Number.isFinite(baseSample?.centerTableX) ? baseSample.centerTableX : fallbackCenterX,
    centerY: Number.isFinite(baseSample?.centerTableY) ? (baseSample.centerTableY + deltaY) : fallbackCenterY
  };
}

function applyCardDragVisual(cardElement) {
  if (!isCardDragActive() || cardElement.dataset.cardId !== cardDragState.dragCardId) {
    return;
  }

  const deltaX = cardDragState.lastClientX - cardDragState.startClientX;
  const deltaY = cardDragState.lastClientY - cardDragState.startClientY;
  const nextLeft = cardDragState.dragCardStartLeftPx + deltaX;
  const nextTop = cardDragState.dragCardStartTopPx + deltaY;

  cardElement.style.transition = "none";
  cardElement.style.pointerEvents = "none";
  cardElement.style.left = `${nextLeft}px`;
  cardElement.style.top = `${nextTop}px`;
  if (Number.isFinite(cardDragState.dragCardDynamicTiltDeg)) {
    cardElement.style.transform = `rotate(${cardDragState.dragCardDynamicTiltDeg}deg)`;
  } else {
    cardElement.style.transform = cardDragState.dragCardBaseTransform;
  }
  cardElement.style.zIndex = `${cardDragState.dragCardZIndex}`;
}

function applySuitDragVisual(cardElement) {
  if (!isSuitDragActive()) {
    return;
  }

  const cardId = cardElement.dataset.cardId;
  if (
    typeof cardId !== "string" ||
    !Array.isArray(cardDragState.dragCardIds) ||
    !cardDragState.dragCardIds.includes(cardId)
  ) {
    return;
  }

  const startPosition = cardDragState.dragCardStartPositionsById?.get(cardId);
  if (!startPosition) {
    return;
  }

  const deltaX = cardDragState.lastClientX - cardDragState.startClientX;
  const deltaY = cardDragState.lastClientY - cardDragState.startClientY;
  let nextLeft = startPosition.left + deltaX;
  let nextTop = startPosition.top + deltaY;
  let cardTiltDeg = null;
  const dynamicCenterX = cardDragState.dragGroupDynamicCenterTableX;
  const dynamicCenterY = cardDragState.dragGroupDynamicCenterTableY;
  const dynamicCenterClientX = cardDragState.dragGroupDynamicCenterClientX;
  const curveSamples = Array.isArray(cardDragState.dragGroupCurveSamples)
    ? cardDragState.dragGroupCurveSamples
    : [];
  const pointerDeltaY = Number.isFinite(cardDragState.dragGroupPointerDeltaY)
    ? cardDragState.dragGroupPointerDeltaY
    : deltaY;
  const shadowLayout = cardDragState.dragGroupShadowLayoutsById?.get(cardId);
  const canUseShadowLayout = (
    cardDragState.dragGroupShadowModelActive === true &&
    shadowLayout &&
    Number.isFinite(shadowLayout.left) &&
    Number.isFinite(shadowLayout.top) &&
    Number.isFinite(shadowLayout.thetaDeg)
  );
  const localOffset = cardDragState.dragGroupLocalOffsetsById?.get(cardId);
  const dynamicGroupTiltDeg = cardDragState.dragGroupDynamicTiltDeg;
  const tiltOffsetDeg = cardDragState.dragGroupTiltOffsetsById?.get(cardId);
  const hasTiltOffset = Number.isFinite(tiltOffsetDeg);

  if (canUseShadowLayout) {
    nextLeft = shadowLayout.left;
    nextTop = shadowLayout.top + pointerDeltaY;
    cardTiltDeg = shadowLayout.thetaDeg;
  }

  if (
    !Number.isFinite(cardTiltDeg) &&
    curveSamples.length > 0 &&
    Number.isFinite(dynamicCenterClientX) &&
    localOffset &&
    Number.isFinite(localOffset.x) &&
    Number.isFinite(localOffset.y)
  ) {
    const cardReferenceClientX = dynamicCenterClientX + localOffset.x;
    const curveSample = getSuitDragCurveSampleAtClientX(curveSamples, cardReferenceClientX);
    if (curveSample) {
      const sampledTiltDeg = curveSample.tiltDeg;
      const normalOffset = rotatePointClockwise({ x: 0, y: localOffset.y }, degToRad(sampledTiltDeg));
      const cardWidth = cardElement.offsetWidth || Number.parseFloat(cardElement.dataset.handCardWidthPx ?? "") || 0;
      const cardHeight = cardElement.offsetHeight || Number.parseFloat(cardElement.dataset.handCardHeightPx ?? "") || 0;
      const cardCenterX = curveSample.centerTableX + normalOffset.x;
      const cardCenterY = curveSample.centerTableY + normalOffset.y + pointerDeltaY;
      nextLeft = cardCenterX - (cardWidth / 2);
      nextTop = cardCenterY - (cardHeight / 2);
      cardTiltDeg = sampledTiltDeg + (hasTiltOffset ? tiltOffsetDeg : 0);
    }
  }

  if (
    !Number.isFinite(cardTiltDeg) &&
    Number.isFinite(dynamicCenterX) &&
    Number.isFinite(dynamicCenterY) &&
    localOffset &&
    Number.isFinite(localOffset.x) &&
    Number.isFinite(localOffset.y) &&
    Number.isFinite(dynamicGroupTiltDeg)
  ) {
    const worldOffset = rotatePointClockwise(localOffset, degToRad(dynamicGroupTiltDeg));
    const cardWidth = cardElement.offsetWidth || Number.parseFloat(cardElement.dataset.handCardWidthPx ?? "") || 0;
    const cardHeight = cardElement.offsetHeight || Number.parseFloat(cardElement.dataset.handCardHeightPx ?? "") || 0;
    nextLeft = dynamicCenterX + worldOffset.x - (cardWidth / 2);
    nextTop = dynamicCenterY + worldOffset.y - (cardHeight / 2);
    cardTiltDeg = dynamicGroupTiltDeg + (hasTiltOffset ? tiltOffsetDeg : 0);
  }

  cardElement.style.transition = "none";
  cardElement.style.pointerEvents = "none";
  cardElement.style.left = `${nextLeft}px`;
  cardElement.style.top = `${nextTop}px`;
  if (Number.isFinite(cardTiltDeg)) {
    cardElement.style.transform = `rotate(${cardTiltDeg}deg)`;
  } else if (Number.isFinite(dynamicGroupTiltDeg)) {
    cardElement.style.transform = `rotate(${dynamicGroupTiltDeg + (hasTiltOffset ? tiltOffsetDeg : 0)}deg)`;
  } else {
    cardElement.style.transform = cardElement.dataset.handBaseTransform ?? cardElement.style.transform;
  }
  cardElement.style.zIndex = `${(Number.parseInt(cardElement.dataset.handBaseZIndex ?? "", 10) || 1) + 250}`;
}

function getCardDragTargetTiltDegFromLayout(cardElements, cardLayouts) {
  if (!isCardDragActive() || !Array.isArray(cardElements) || !Array.isArray(cardLayouts)) {
    return null;
  }

  const nonDraggedTilts = [];

  for (let index = 0; index < cardElements.length; index += 1) {
    const cardElement = cardElements[index];
    const cardLayout = cardLayouts[index];

    if (!cardElement || !cardLayout || cardElement.dataset.cardId === cardDragState.dragCardId) {
      continue;
    }

    if (Number.isFinite(cardLayout.thetaDeg)) {
      nonDraggedTilts.push(cardLayout.thetaDeg);
    }
  }

  if (nonDraggedTilts.length === 0) {
    return 0;
  }

  const rawInsertionIndex = Number.isInteger(cardDragState.insertionIndex)
    ? cardDragState.insertionIndex
    : 0;
  const insertionIndex = Math.max(0, Math.min(rawInsertionIndex, nonDraggedTilts.length));
  const leftTilt = insertionIndex > 0 ? nonDraggedTilts[insertionIndex - 1] : null;
  const rightTilt = insertionIndex < nonDraggedTilts.length ? nonDraggedTilts[insertionIndex] : null;
  const hasLeftTilt = Number.isFinite(leftTilt);
  const hasRightTilt = Number.isFinite(rightTilt);

  if (hasLeftTilt && hasRightTilt) {
    return (leftTilt + rightTilt) / 2;
  }

  if (hasLeftTilt) {
    return leftTilt;
  }

  if (hasRightTilt) {
    return rightTilt;
  }

  return 0;
}

function arraysShallowEqual(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

function maybeActivateCardDrag() {
  if (
    cardDragState === null ||
    cardDragState.mode !== "card" ||
    cardDragState.active ||
    !isCardDragEnabled()
  ) {
    return false;
  }

  const deltaX = cardDragState.lastClientX - cardDragState.startClientX;
  const deltaY = cardDragState.lastClientY - cardDragState.startClientY;
  const travelDistance = Math.hypot(deltaX, deltaY);

  if (travelDistance < CARD_DRAG_START_THRESHOLD_PX) {
    return false;
  }

  const orderedCardElements = Array.from(cardTable.querySelectorAll(".card"));
  const cardOrder = orderedCardElements
    .map((cardElement) => cardElement.dataset.cardId)
    .filter((cardId) => typeof cardId === "string" && cardId.length > 0);
  const initialInsertionIndex = cardOrder.indexOf(cardDragState.dragCardId);

  if (cardOrder.length !== currentCards.length || initialInsertionIndex < 0) {
    resetCardDragState();
    return false;
  }

  cardDragState.active = true;
  cardDragState.startOrderCardIds = cardOrder;
  cardDragState.previewOrderCardIds = [...cardOrder];
  cardDragState.insertionIndex = initialInsertionIndex;
  cardDragState.dragCardStartLeftPx = Number.parseFloat(cardDragState.dragCardElement.style.left) || 0;
  cardDragState.dragCardStartTopPx = Number.parseFloat(cardDragState.dragCardElement.style.top) || 0;
  const dragCardRect = cardDragState.dragCardElement.getBoundingClientRect();
  cardDragState.dragCardWidthPx = dragCardRect.width || 0;
  cardDragState.dragCardStartClientCenterX = dragCardRect.left + (dragCardRect.width / 2);
  const totalDeltaX = cardDragState.lastClientX - cardDragState.startClientX;
  if (Math.abs(totalDeltaX) >= CARD_DRAG_DIRECTION_DEADZONE_PX) {
    cardDragState.horizontalDirection = totalDeltaX > 0 ? 1 : -1;
  }

  cardDragState.dragCardBaseTransform =
    cardDragState.dragCardElement.dataset.handBaseTransform ??
    cardDragState.dragCardElement.style.transform ??
    "";
  cardDragState.dragCardZIndex = cardOrder.length + 200;
  cardTable.classList.add("card-table--dragging");
  clearHandHoverState();
  layoutHandCards(currentCards.length);
  updateDebugOverlays();
  return true;
}

function getCardDragInsertionIndex(pointerClientX) {
  if (!isCardDragActive()) {
    return null;
  }

  const draggedCenterX =
    cardDragState.dragCardStartClientCenterX +
    (cardDragState.lastClientX - cardDragState.startClientX);
  const referenceX = Number.isFinite(draggedCenterX) ? draggedCenterX : pointerClientX;

  const orderedNonDraggedCards = getCardElementsInCurrentLayoutOrder()
    .filter((cardElement) => cardElement.dataset.cardId !== cardDragState.dragCardId);

  if (orderedNonDraggedCards.length === 0) {
    return 0;
  }

  const cardCenters = orderedNonDraggedCards.map((cardElement) => {
    const rect = cardElement.getBoundingClientRect();
    return rect.left + (rect.width / 2);
  });
  const descending = cardCenters.length > 1 && cardCenters[0] > cardCenters[cardCenters.length - 1];
  let targetUnderPointer = document.elementFromPoint(referenceX, cardDragState.lastClientY);
  if (!targetUnderPointer && Number.isFinite(pointerClientX)) {
    targetUnderPointer = document.elementFromPoint(pointerClientX, cardDragState.lastClientY);
  }
  const hoveredCardElement = getHandCardElementFromTarget(targetUnderPointer);
  const hoveredCardId = hoveredCardElement?.dataset?.cardId ?? null;
  const hoveredIndex = orderedNonDraggedCards.findIndex(
    (cardElement) => cardElement.dataset.cardId === hoveredCardId
  );

  if (hoveredIndex >= 0) {
    const hoveredRect = hoveredCardElement.getBoundingClientRect();
    const hoveredCenterX = hoveredRect.left + (hoveredRect.width / 2);
    const gapOnLeftSide = referenceX < hoveredCenterX;
    if (descending) {
      return gapOnLeftSide
        ? Math.min(orderedNonDraggedCards.length, hoveredIndex + 1)
        : hoveredIndex;
    }

    return gapOnLeftSide
      ? hoveredIndex
      : Math.min(orderedNonDraggedCards.length, hoveredIndex + 1);
  }

  const leftEdge = Math.min(...cardCenters);
  const rightEdge = Math.max(...cardCenters);
  if (referenceX <= leftEdge) {
    return descending ? orderedNonDraggedCards.length : 0;
  }

  if (referenceX >= rightEdge) {
    return descending ? 0 : orderedNonDraggedCards.length;
  }

  return Number.isInteger(cardDragState.insertionIndex)
    ? cardDragState.insertionIndex
    : 0;
}

function updateCardDragPreviewOrder(insertionIndex) {
  if (!isCardDragActive() || !Array.isArray(cardDragState.previewOrderCardIds)) {
    return false;
  }

  const cardOrderWithoutDragged = cardDragState.previewOrderCardIds.filter(
    (cardId) => cardId !== cardDragState.dragCardId
  );
  const clampedInsertionIndex = Math.max(
    0,
    Math.min(insertionIndex, cardOrderWithoutDragged.length)
  );
  const nextPreviewOrder = [...cardOrderWithoutDragged];
  nextPreviewOrder.splice(clampedInsertionIndex, 0, cardDragState.dragCardId);

  if (arraysShallowEqual(nextPreviewOrder, cardDragState.previewOrderCardIds)) {
    return false;
  }

  cardDragState.previewOrderCardIds = nextPreviewOrder;
  cardDragState.insertionIndex = clampedInsertionIndex;
  return true;
}

function beginPendingCardDrag(event) {
  if (event.button !== 0 || !isCardDragEnabled()) {
    return false;
  }

  const cardElement = getHandCardElementFromTarget(event.target);
  const cardId = cardElement?.dataset?.cardId ?? "";

  if (!cardElement || typeof cardId !== "string" || cardId.length === 0) {
    return false;
  }

  event.preventDefault();
  resetCardDragState();
  cardDragState = {
    mode: "card",
    active: false,
    pointerId: event.pointerId,
    dragCardId: cardId,
    dragCardElement: cardElement,
    startClientX: event.clientX,
    startClientY: event.clientY,
    lastClientX: event.clientX,
    lastClientY: event.clientY,
    startOrderCardIds: null,
    previewOrderCardIds: null,
    insertionIndex: null,
    dragCardStartLeftPx: 0,
    dragCardStartTopPx: 0,
    dragCardWidthPx: 0,
    dragCardStartClientCenterX: 0,
    horizontalDirection: 0,
    dragCardBaseTransform: "",
    dragCardDynamicTiltDeg: null,
    dragCardZIndex: 0
  };

  if (typeof cardElement.setPointerCapture === "function") {
    cardElement.setPointerCapture(event.pointerId);
  }

  return true;
}

function handleCardDragPointerMove(event) {
  if (!isCardDragTrackedPointer(event)) {
    return false;
  }

  const moveDeltaX = event.clientX - cardDragState.lastClientX;
  if (Math.abs(moveDeltaX) >= CARD_DRAG_DIRECTION_DEADZONE_PX) {
    cardDragState.horizontalDirection = moveDeltaX > 0 ? 1 : -1;
  }

  cardDragState.lastClientX = event.clientX;
  cardDragState.lastClientY = event.clientY;

  if (!cardDragState.active) {
    maybeActivateCardDrag();
  }

  if (!cardDragState.active) {
    return true;
  }

  const insertionIndex = getCardDragInsertionIndex(event.clientX);
  if (Number.isInteger(insertionIndex)) {
    updateCardDragPreviewOrder(insertionIndex);
  }

  layoutHandCards(currentCards.length);
  updateDebugOverlays();
  event.preventDefault();
  return true;
}

function commitCardDragOrder() {
  if (!isCardDragActive() || !Array.isArray(cardDragState.previewOrderCardIds)) {
    resetCardDragState();
    return false;
  }

  const nextManualOrder = [...cardDragState.previewOrderCardIds];
  const startOrder = Array.isArray(cardDragState.startOrderCardIds)
    ? [...cardDragState.startOrderCardIds]
    : [];
  const currentCardIds = getCardsInDealOrder(currentCards).map((card) => card.cardId);
  const orderChanged = startOrder.length > 0 && !arraysShallowEqual(nextManualOrder, startOrder);
  const wasRankSortEnabled = isRankSortEnabled();

  resetCardDragState();

  if (!areCardIdSetsEqual(nextManualOrder, currentCardIds)) {
    return false;
  }

  manualCardOrder = nextManualOrder;

  if (orderChanged && wasRankSortEnabled && rankSortEnabledToggle) {
    rankSortEnabledToggle.checked = false;
    enforceHandSortControlCoercion();
    updateHandModeControls();
  }

  return true;
}

function handleCardDragPointerEnd(event, { commit }) {
  if (!isCardDragTrackedPointer(event)) {
    return false;
  }

  const isPendingShortClick = cardDragState !== null && cardDragState.active !== true;
  const pendingCardId = cardDragState?.dragCardId ?? null;
  const modifierActive = isHoverModifierActive(event);
  const clickClientX = event.clientX;

  if (commit && commitCardDragOrder()) {
    renderCards(currentCards);
    return true;
  }

  resetCardDragState();

  if (
    commit &&
    isPendingShortClick &&
    !modifierActive &&
    typeof pendingCardId === "string" &&
    pendingCardId.length > 0
  ) {
    const playAccepted = handleCardPlayIntent(pendingCardId, {
      source: "short_click",
      clickClientX
    });
    if (playAccepted) {
      return true;
    }
  }

  if (currentCards.length > 0 && getViewMode() === "hand") {
    refreshHandLayoutFromControls();
  }

  return true;
}

function getCurrentGroupOrderFromCards(cards) {
  const cardsInDealOrder = getCardsInDealOrder(cards);
  return getGroupOrderFromCardSequence(cardsInDealOrder);
}

function buildCardIdsByGroup(cardOrder, cardIdToGroupKey) {
  const cardIdsByGroup = new Map();
  const trailingCardIds = [];

  cardOrder.forEach((cardId) => {
    const groupKey = cardIdToGroupKey.get(cardId);
    if (!isSupportedManualGroupKey(groupKey)) {
      trailingCardIds.push(cardId);
      return;
    }

    if (!cardIdsByGroup.has(groupKey)) {
      cardIdsByGroup.set(groupKey, []);
    }
    cardIdsByGroup.get(groupKey).push(cardId);
  });

  return {
    cardIdsByGroup,
    trailingCardIds
  };
}

function buildPreviewCardOrderFromGroups(groupOrder, cardIdsByGroup, trailingCardIds = []) {
  const previewCardIds = [];

  groupOrder.forEach((groupKey) => {
    const groupCardIds = cardIdsByGroup.get(groupKey) ?? [];
    groupCardIds.forEach((cardId) => {
      previewCardIds.push(cardId);
    });
  });

  trailingCardIds.forEach((cardId) => {
    previewCardIds.push(cardId);
  });

  return previewCardIds;
}

function isSuitDragGroupKey(groupKey) {
  return isSupportedManualGroupKey(groupKey);
}

function maybeActivateSuitDrag() {
  if (
    cardDragState === null ||
    cardDragState.mode !== "suit" ||
    cardDragState.active ||
    !isSuitDragEnabled()
  ) {
    return false;
  }

  const deltaX = cardDragState.lastClientX - cardDragState.startClientX;
  const deltaY = cardDragState.lastClientY - cardDragState.startClientY;
  const travelDistance = Math.hypot(deltaX, deltaY);

  if (travelDistance < CARD_DRAG_START_THRESHOLD_PX) {
    return false;
  }

  const orderedCardElements = Array.from(cardTable.querySelectorAll(".card"));
  const cardOrder = orderedCardElements
    .map((cardElement) => cardElement.dataset.cardId)
    .filter((cardId) => typeof cardId === "string" && cardId.length > 0);
  const cardIdToGroupKey = new Map();
  const startPositionsById = new Map();
  const baseTiltById = new Map();
  const centerById = new Map();
  let minLeft = Number.POSITIVE_INFINITY;
  let maxRight = Number.NEGATIVE_INFINITY;
  let tiltSumDeg = 0;
  let tiltCount = 0;
  let centerSumX = 0;
  let centerSumY = 0;
  let centerCount = 0;
  const dragCardIds = [];

  orderedCardElements.forEach((cardElement) => {
    const cardId = cardElement.dataset.cardId;
    if (typeof cardId !== "string" || cardId.length === 0) {
      return;
    }

    const groupKey = getCardElementGroupKey(cardElement);
    cardIdToGroupKey.set(cardId, groupKey);

    if (groupKey !== cardDragState.dragGroupKey) {
      return;
    }

    dragCardIds.push(cardId);
    const startLeft = Number.parseFloat(cardElement.style.left) || 0;
    const startTop = Number.parseFloat(cardElement.style.top) || 0;
    startPositionsById.set(cardId, {
      left: startLeft,
      top: startTop
    });
    const rect = cardElement.getBoundingClientRect();
    minLeft = Math.min(minLeft, rect.left);
    maxRight = Math.max(maxRight, rect.right);
    const centerX = startLeft + (cardElement.offsetWidth / 2);
    const centerY = startTop + (cardElement.offsetHeight / 2);
    if (Number.isFinite(centerX) && Number.isFinite(centerY)) {
      centerById.set(cardId, { x: centerX, y: centerY });
      centerSumX += centerX;
      centerSumY += centerY;
      centerCount += 1;
    }
    const baseTiltDeg = Number.parseFloat(cardElement.dataset.handThetaDeg ?? "");
    if (Number.isFinite(baseTiltDeg)) {
      baseTiltById.set(cardId, baseTiltDeg);
      tiltSumDeg += baseTiltDeg;
      tiltCount += 1;
    }
  });

  const groupOrder = [];
  const seenGroupKeys = new Set();
  cardOrder.forEach((cardId) => {
    const groupKey = cardIdToGroupKey.get(cardId);
    if (!isSuitDragGroupKey(groupKey) || seenGroupKeys.has(groupKey)) {
      return;
    }

    seenGroupKeys.add(groupKey);
    groupOrder.push(groupKey);
  });

  const draggedGroupIndex = groupOrder.indexOf(cardDragState.dragGroupKey);
  if (dragCardIds.length === 0 || draggedGroupIndex < 0) {
    resetCardDragState();
    return false;
  }

  const { cardIdsByGroup, trailingCardIds } = buildCardIdsByGroup(cardOrder, cardIdToGroupKey);
  const dragGroupBaseMeanTiltDeg = tiltCount > 0 ? (tiltSumDeg / tiltCount) : 0;
  const dragGroupTiltOffsetsById = new Map();
  const dragGroupStartCenterTableX = centerCount > 0 ? (centerSumX / centerCount) : 0;
  const dragGroupStartCenterTableY = centerCount > 0 ? (centerSumY / centerCount) : 0;
  const dragGroupLocalOffsetsById = new Map();
  const dragGroupBaseMeanTiltRad = degToRad(dragGroupBaseMeanTiltDeg);
  dragCardIds.forEach((cardId) => {
    const cardTiltDeg = baseTiltById.get(cardId);
    dragGroupTiltOffsetsById.set(
      cardId,
      Number.isFinite(cardTiltDeg) ? cardTiltDeg - dragGroupBaseMeanTiltDeg : 0
    );
    const cardCenter = centerById.get(cardId);
    if (cardCenter) {
      const centeredOffset = {
        x: cardCenter.x - dragGroupStartCenterTableX,
        y: cardCenter.y - dragGroupStartCenterTableY
      };
      dragGroupLocalOffsetsById.set(
        cardId,
        rotatePointClockwise(centeredOffset, -dragGroupBaseMeanTiltRad)
      );
    } else {
      dragGroupLocalOffsetsById.set(cardId, { x: 0, y: 0 });
    }
  });

  cardDragState.active = true;
  cardDragState.startOrderCardIds = cardOrder;
  cardDragState.previewOrderGroupKeys = [...groupOrder];
  cardDragState.previewOrderCardIds = buildPreviewCardOrderFromGroups(
    cardDragState.previewOrderGroupKeys,
    cardIdsByGroup,
    trailingCardIds
  );
  cardDragState.insertionIndex = draggedGroupIndex;
  cardDragState.dragCardIds = dragCardIds;
  cardDragState.dragCardStartPositionsById = startPositionsById;
  cardDragState.cardIdsByGroup = cardIdsByGroup;
  cardDragState.trailingCardIds = trailingCardIds;
  cardDragState.dragGroupBaseMeanTiltDeg = dragGroupBaseMeanTiltDeg;
  cardDragState.dragGroupTiltOffsetsById = dragGroupTiltOffsetsById;
  cardDragState.dragGroupLocalOffsetsById = dragGroupLocalOffsetsById;
  cardDragState.dragGroupCurveSamples = [];
  cardDragState.dragGroupShadowLayoutsById = null;
  cardDragState.dragGroupShadowModelActive = false;
  cardDragState.dragGroupDynamicTiltDeg = dragGroupBaseMeanTiltDeg;
  cardDragState.dragGroupStartCenterTableX = dragGroupStartCenterTableX;
  cardDragState.dragGroupStartCenterTableY = dragGroupStartCenterTableY;
  cardDragState.dragGroupDynamicCenterTableX = dragGroupStartCenterTableX;
  cardDragState.dragGroupDynamicCenterTableY = dragGroupStartCenterTableY;
  cardDragState.dragGroupDynamicCenterClientX = cardDragState.startClientX;
  cardDragState.dragGroupPointerDeltaY = 0;
  cardDragState.dragGroupStartClientCenterX = Number.isFinite(minLeft) && Number.isFinite(maxRight)
    ? ((minLeft + maxRight) / 2)
    : cardDragState.startClientX;
  cardTable.classList.add("card-table--dragging");
  clearHandHoverState();
  layoutHandCards(currentCards.length);
  updateDebugOverlays();
  return true;
}

function getSuitDragInsertionIndex(pointerClientX) {
  if (!isSuitDragActive()) {
    return null;
  }

  const draggedCenterX = getDraggedSuitGroupCenterClientX();
  const referenceX = Number.isFinite(draggedCenterX) ? draggedCenterX : pointerClientX;
  const orderedNonDraggedCards = getCardElementsInCurrentLayoutOrder()
    .filter((cardElement) => getCardElementGroupKey(cardElement) !== cardDragState.dragGroupKey);

  if (orderedNonDraggedCards.length === 0) {
    return 0;
  }

  const nonDraggedGroupKeys = [];
  const groupBoundsByKey = new Map();
  orderedNonDraggedCards.forEach((cardElement) => {
    const groupKey = getCardElementGroupKey(cardElement);
    if (!isSuitDragGroupKey(groupKey)) {
      return;
    }

    if (!nonDraggedGroupKeys.includes(groupKey)) {
      nonDraggedGroupKeys.push(groupKey);
    }

    const rect = cardElement.getBoundingClientRect();
    const priorBounds = groupBoundsByKey.get(groupKey);
    if (!priorBounds) {
      groupBoundsByKey.set(groupKey, {
        left: rect.left,
        right: rect.right
      });
      return;
    }

    priorBounds.left = Math.min(priorBounds.left, rect.left);
    priorBounds.right = Math.max(priorBounds.right, rect.right);
  });

  if (nonDraggedGroupKeys.length === 0) {
    return 0;
  }

  const groupCenters = nonDraggedGroupKeys.map((groupKey) => {
    const bounds = groupBoundsByKey.get(groupKey);
    return bounds ? (bounds.left + bounds.right) / 2 : 0;
  });
  const descending = groupCenters.length > 1 && groupCenters[0] > groupCenters[groupCenters.length - 1];
  let targetUnderPointer = document.elementFromPoint(referenceX, cardDragState.lastClientY);
  if (!targetUnderPointer && Number.isFinite(pointerClientX)) {
    targetUnderPointer = document.elementFromPoint(pointerClientX, cardDragState.lastClientY);
  }

  const hoveredCardElement = getHandCardElementFromTarget(targetUnderPointer);
  const hoveredGroupKey = getCardElementGroupKey(hoveredCardElement);
  const hoveredGroupIndex = nonDraggedGroupKeys.indexOf(hoveredGroupKey);

  if (hoveredGroupIndex >= 0) {
    const hoveredCenterX = groupCenters[hoveredGroupIndex];
    const gapOnLeftSide = referenceX < hoveredCenterX;
    if (descending) {
      return gapOnLeftSide
        ? Math.min(nonDraggedGroupKeys.length, hoveredGroupIndex + 1)
        : hoveredGroupIndex;
    }

    return gapOnLeftSide
      ? hoveredGroupIndex
      : Math.min(nonDraggedGroupKeys.length, hoveredGroupIndex + 1);
  }

  const leftEdge = Math.min(...groupCenters);
  const rightEdge = Math.max(...groupCenters);
  if (referenceX <= leftEdge) {
    return descending ? nonDraggedGroupKeys.length : 0;
  }

  if (referenceX >= rightEdge) {
    return descending ? 0 : nonDraggedGroupKeys.length;
  }

  return Number.isInteger(cardDragState.insertionIndex)
    ? cardDragState.insertionIndex
    : 0;
}

function updateSuitDragPreviewOrder(insertionIndex) {
  if (!isSuitDragActive() || !Array.isArray(cardDragState.previewOrderGroupKeys)) {
    return false;
  }

  const groupOrderWithoutDragged = cardDragState.previewOrderGroupKeys.filter(
    (groupKey) => groupKey !== cardDragState.dragGroupKey
  );
  const clampedInsertionIndex = Math.max(
    0,
    Math.min(insertionIndex, groupOrderWithoutDragged.length)
  );
  const nextGroupOrder = [...groupOrderWithoutDragged];
  nextGroupOrder.splice(clampedInsertionIndex, 0, cardDragState.dragGroupKey);

  if (arraysShallowEqual(nextGroupOrder, cardDragState.previewOrderGroupKeys)) {
    return false;
  }

  cardDragState.previewOrderGroupKeys = nextGroupOrder;
  cardDragState.previewOrderCardIds = buildPreviewCardOrderFromGroups(
    nextGroupOrder,
    cardDragState.cardIdsByGroup ?? new Map(),
    cardDragState.trailingCardIds ?? []
  );
  cardDragState.insertionIndex = clampedInsertionIndex;
  return true;
}

function beginPendingSuitDrag(event) {
  if (event.button !== 0 || !isSuitDragEnabled() || !isHoverModifierActive(event)) {
    return false;
  }

  const cardElement = getHandCardElementFromTarget(event.target);
  const groupKey = getCardElementGroupKey(cardElement);
  const cardId = cardElement?.dataset?.cardId ?? "";

  if (!cardElement || !isSuitDragGroupKey(groupKey) || typeof cardId !== "string" || cardId.length === 0) {
    return false;
  }

  event.preventDefault();
  resetCardDragState();
  cardDragState = {
    mode: "suit",
    active: false,
    pointerId: event.pointerId,
    dragGroupKey: groupKey,
    dragCardId: cardId,
    dragCardElement: cardElement,
    startClientX: event.clientX,
    startClientY: event.clientY,
    lastClientX: event.clientX,
    lastClientY: event.clientY,
    startOrderCardIds: null,
    previewOrderCardIds: null,
    previewOrderGroupKeys: null,
    insertionIndex: null,
    dragCardIds: [],
    dragCardStartPositionsById: null,
    cardIdsByGroup: null,
    trailingCardIds: [],
    dragGroupBaseMeanTiltDeg: 0,
    dragGroupTiltOffsetsById: null,
    dragGroupLocalOffsetsById: null,
    dragGroupCurveSamples: null,
    dragGroupShadowLayoutsById: null,
    dragGroupShadowModelActive: false,
    dragGroupDynamicTiltDeg: null,
    dragGroupStartCenterTableX: 0,
    dragGroupStartCenterTableY: 0,
    dragGroupDynamicCenterTableX: null,
    dragGroupDynamicCenterTableY: null,
    dragGroupDynamicCenterClientX: null,
    dragGroupPointerDeltaY: 0,
    dragGroupStartClientCenterX: 0,
    dragCardStartLeftPx: 0,
    dragCardStartTopPx: 0,
    dragCardWidthPx: 0,
    dragCardStartClientCenterX: 0,
    horizontalDirection: 0,
    dragCardBaseTransform: "",
    dragCardDynamicTiltDeg: null,
    dragCardZIndex: 0
  };

  if (typeof cardElement.setPointerCapture === "function") {
    cardElement.setPointerCapture(event.pointerId);
  }

  return true;
}

function handleSuitDragPointerMove(event) {
  if (!isSuitDragTrackedPointer(event)) {
    return false;
  }

  cardDragState.lastClientX = event.clientX;
  cardDragState.lastClientY = event.clientY;

  if (!cardDragState.active) {
    maybeActivateSuitDrag();
  }

  if (!cardDragState.active) {
    return true;
  }

  const insertionIndex = getSuitDragInsertionIndex(event.clientX);
  if (Number.isInteger(insertionIndex)) {
    updateSuitDragPreviewOrder(insertionIndex);
  }

  layoutHandCards(currentCards.length);
  updateDebugOverlays();
  event.preventDefault();
  return true;
}

function commitSuitDragOrder() {
  if (!isSuitDragActive() || !Array.isArray(cardDragState.previewOrderGroupKeys)) {
    resetCardDragState();
    return false;
  }

  const nextManualOrder = [...cardDragState.previewOrderGroupKeys];
  const currentGroupOrder = getCurrentGroupOrderFromCards(currentCards);
  const shouldSwitchToManual = getHandSuitSortMode() === "auto";
  resetCardDragState();

  if (!areGroupKeySetsEqual(nextManualOrder, currentGroupOrder)) {
    return false;
  }

  manualSuitOrder = nextManualOrder;

  if (shouldSwitchToManual && handSuitSortModeSelect) {
    handSuitSortModeSelect.value = "manual";
    enforceHandSortControlCoercion();
    updateHandModeControls();
  }

  return true;
}

function handleSuitDragPointerEnd(event, { commit }) {
  if (!isSuitDragTrackedPointer(event)) {
    return false;
  }

  if (commit && commitSuitDragOrder()) {
    renderCards(currentCards);
    return true;
  }

  resetCardDragState();

  if (currentCards.length > 0 && getViewMode() === "hand") {
    refreshHandLayoutFromControls();
  }

  return true;
}

function isHoverModifierActive(event) {
  return Boolean(event && (event.shiftKey || event.ctrlKey || event.altKey));
}

function isHoverModifierKey(event) {
  return event.key === "Shift" || event.key === "Control" || event.key === "Alt";
}

function isSupportedHoverMode(mode) {
  return mode === "none" || mode === "card" || mode === "suit";
}

function isStandardSuit(suit) {
  return typeof suit === "string" && STANDARD_SUIT_SET.has(suit);
}

function getHandCardElementFromTarget(target) {
  if (!(target instanceof Element)) {
    return null;
  }

  const cardElement = target.closest(".card");
  if (!(cardElement instanceof HTMLElement) || !cardTable.contains(cardElement)) {
    return null;
  }

  return cardElement;
}

function isCardInActiveHoverSelection(cardElement) {
  if (!(cardElement instanceof HTMLElement)) {
    return false;
  }

  if (handHoverMode === "card") {
    return hoveredCardId !== null && cardElement.dataset.cardId === hoveredCardId;
  }

  if (handHoverMode === "suit") {
    return hoveredGroupKey !== null && getCardElementGroupKey(cardElement) === hoveredGroupKey;
  }

  return false;
}

function applyCardHandTransform(cardElement, baseTransform, baseZIndex) {
  if (typeof baseTransform !== "string" || baseTransform.length === 0) {
    return;
  }

  const shouldEject = isCardInActiveHoverSelection(cardElement);
  const cardHeightPx = Number.parseFloat(cardElement.dataset.handCardHeightPx ?? "");
  const safeCardHeightPx = Number.isFinite(cardHeightPx) && cardHeightPx > 0
    ? cardHeightPx
    : getCardSizePx();
  const hoverEjectPx = safeCardHeightPx * HAND_HOVER_EJECT_RATIO;
  const hoverTranslate = shouldEject ? ` translateY(-${hoverEjectPx.toFixed(2)}px)` : "";
  const nextZIndex = baseZIndex;

  cardElement.style.transform = `${baseTransform}${hoverTranslate}`;
  cardElement.style.zIndex = `${nextZIndex}`;
}

function applyCurrentHandHoverState() {
  if (isAnyDragActive() || isTrickInteractionLocked()) {
    return;
  }

  if (getViewMode() !== "hand") {
    return;
  }

  cardTable.querySelectorAll(".card").forEach((cardElement) => {
    const baseTransform = cardElement.dataset.handBaseTransform ?? "";
    const baseZIndex = Number.parseInt(cardElement.dataset.handBaseZIndex ?? "", 10);
    const safeBaseZIndex = Number.isInteger(baseZIndex)
      ? baseZIndex
      : Number.parseInt(cardElement.style.zIndex, 10) || 1;

    applyCardHandTransform(cardElement, baseTransform, safeBaseZIndex);
  });
}

function setHandHoverState(mode, cardId = null, suit = null) {
  const normalizedMode = isSupportedHoverMode(mode) ? mode : "none";
  const nextCardId = normalizedMode === "card" && typeof cardId === "string" && cardId.length > 0
    ? cardId
    : null;
  const nextGroup = normalizedMode === "suit" && isSuitDragGroupKey(suit)
    ? suit
    : null;

  if (handHoverMode === normalizedMode && hoveredCardId === nextCardId && hoveredGroupKey === nextGroup) {
    return;
  }

  handHoverMode = normalizedMode;
  hoveredCardId = nextCardId;
  hoveredGroupKey = nextGroup;
  applyCurrentHandHoverState();
}

function clearHandHoverState() {
  setHandHoverState("none");
}

function setHandHoverFromCardElement(cardElement, modifierActive) {
  if (isAnyDragActive() || isTrickInteractionLocked()) {
    clearHandHoverState();
    return;
  }

  if (getViewMode() !== "hand" || currentCards.length === 0 || !cardElement) {
    clearHandHoverState();
    return;
  }

  if (isRankSortEnabled() && modifierActive) {
    const groupKey = getCardElementGroupKey(cardElement);
    if (isSuitDragGroupKey(groupKey)) {
      setHandHoverState("suit", null, groupKey);
      return;
    }
  }

  const cardId = cardElement.dataset.cardId;
  if (typeof cardId === "string" && cardId.length > 0) {
    setHandHoverState("card", cardId, null);
    return;
  }

  clearHandHoverState();
}

function refreshHandHoverFromPointerEvent(event) {
  if (isTrickInteractionLocked()) {
    clearHandHoverState();
    return;
  }

  const cardElement = getHandCardElementFromTarget(event.target);
  setHandHoverFromCardElement(cardElement, isHoverModifierActive(event));
}

function refreshHandHoverFromKeyEvent(event) {
  if (getViewMode() !== "hand" || isTrickInteractionLocked()) {
    clearHandHoverState();
    return;
  }

  const hoveredCardElement = cardTable.querySelector(".card:hover");
  setHandHoverFromCardElement(
    hoveredCardElement instanceof HTMLElement ? hoveredCardElement : null,
    isHoverModifierActive(event)
  );
}

function isHandDepthShadowEnabled() {
  return false;
}

function getHandDepthShadowStrengthPct() {
  return Math.round(
    getClampedSliderValue(
      handDepthShadowStrengthSlider,
      DEFAULT_HAND_DEPTH_SHADOW_STRENGTH_PCT,
      MIN_HAND_DEPTH_SHADOW_STRENGTH_PCT,
      MAX_HAND_DEPTH_SHADOW_STRENGTH_PCT
    )
  );
}

function getHandDepthShadowStrengthFactor() {
  return getHandDepthShadowStrengthPct() / 100;
}

function getClampedSliderValue(input, fallbackValue, minValue, maxValue) {
  if (!input) {
    return fallbackValue;
  }

  const parsed = Number.parseFloat(input.value);
  if (!Number.isFinite(parsed)) {
    return fallbackValue;
  }

  return Math.min(maxValue, Math.max(minValue, parsed));
}

function getVisibilityFactor() {
  return getClampedSliderValue(
    visibilityFactorSlider,
    DEFAULT_VISIBILITY_FACTOR,
    0,
    1
  );
}

function getCardSizePx() {
  return Math.round(
    getClampedSliderValue(
      cardSizeSlider,
      DEFAULT_CARD_HEIGHT_PX,
      MIN_CARD_HEIGHT_PX,
      MAX_CARD_HEIGHT_PX
    )
  );
}

function getAlphaSliderConfig(mode = getHandLayoutMode()) {
  if (mode === "demo") {
    return {
      min: DEMO_MIN_ALPHA_DEG,
      max: DEMO_MAX_ALPHA_DEG,
      step: 0.1,
      fallback: DEFAULT_DEMO_ALPHA_DEG,
      title: "Gap angle"
    };
  }

  return {
    min: 0,
    max: 15,
    step: 0.1,
    fallback: DEFAULT_ALPHA_DEG,
    title: "Max card angle"
  };
}

function storeCurrentAlphaValueForMode(mode = getHandLayoutMode()) {
  if (!alphaDegSlider) {
    return;
  }

  const config = getAlphaSliderConfig(mode);
  const value = getClampedSliderValue(alphaDegSlider, config.fallback, config.min, config.max);

  if (mode === "demo") {
    demoAlphaDegValue = value;
    return;
  }

  classicAlphaDegValue = value;
}

function syncAlphaSliderForMode(force = false) {
  if (!alphaDegSlider) {
    return;
  }

  const mode = getHandLayoutMode();
  const priorMode = alphaDegSlider.dataset.layoutMode;

  if (priorMode && priorMode !== mode) {
    storeCurrentAlphaValueForMode(priorMode);
  }

  const config = getAlphaSliderConfig(mode);
  const targetValue = mode === "demo" ? demoAlphaDegValue : classicAlphaDegValue;

  if (force || priorMode !== mode) {
    alphaDegSlider.min = `${config.min}`;
    alphaDegSlider.max = `${config.max}`;
    alphaDegSlider.step = `${config.step}`;
    alphaDegSlider.value = targetValue.toFixed(1);
    alphaDegSlider.dataset.layoutMode = mode;
  }

  if (alphaDegTitle) {
    alphaDegTitle.textContent = config.title;
  }
}

function getAlphaDeg() {
  const mode = getHandLayoutMode();
  const config = getAlphaSliderConfig(mode);
  return getClampedSliderValue(alphaDegSlider, config.fallback, config.min, config.max);
}

function getPhiDeg() {
  return getClampedSliderValue(phiDegSlider, DEFAULT_PHI_DEG, 0, 90);
}

function getDemoOuterDropPct() {
  return getClampedSliderValue(demoOuterDropSlider, DEFAULT_DEMO_OUTER_DROP_PCT, 0, 5);
}

function setSliderValueLabel(labelNode, value, digits) {
  if (!labelNode) {
    return;
  }

  labelNode.textContent = value.toFixed(digits);
}

function updateHandGeometryValueLabels() {
  if (cardSizeSliderValue) {
    cardSizeSliderValue.textContent = `${getCardSizePx()} px`;
  }
  setSliderValueLabel(visibilityFactorSliderValue, getVisibilityFactor(), 2);
  setSliderValueLabel(alphaDegSliderValue, getAlphaDeg(), 1);
  setSliderValueLabel(phiDegSliderValue, getPhiDeg(), 1);
  if (demoOuterDropSliderValue) {
    demoOuterDropSliderValue.textContent = `${getDemoOuterDropPct().toFixed(1)}%`;
  }
  if (handDepthShadowStrengthSliderValue) {
    handDepthShadowStrengthSliderValue.textContent = `${getHandDepthShadowStrengthPct()}%`;
  }
  syncHandDepthShadowDirectionClock();
}

function parseUrlFloatParam(name) {
  const rawValue = URL_PARAMS.get(name);
  if (rawValue === null) {
    return null;
  }

  const parsed = Number.parseFloat(rawValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseUrlClampedFloatParam(name, minValue, maxValue) {
  const parsed = parseUrlFloatParam(name);
  if (parsed === null) {
    return null;
  }

  return Math.min(maxValue, Math.max(minValue, parsed));
}

function parseUrlIntegerParam(name) {
  const rawValue = URL_PARAMS.get(name);
  if (rawValue === null) {
    return null;
  }

  const parsed = Number.parseInt(rawValue, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function parseUrlClampedIntegerParam(name, minValue, maxValue) {
  const parsed = parseUrlIntegerParam(name);
  if (parsed === null) {
    return null;
  }

  return Math.min(maxValue, Math.max(minValue, parsed));
}

function waitForAnimationFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      resolve();
    });
  });
}

function waitForMs(duration) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function applyCardSizeCssVariables() {
  document.documentElement.style.setProperty("--card-height", `${getCardSizePx()}px`);
}

function applyCardHeightSetting(nextCardHeightPx) {
  const clampedCardHeight = clampCardHeightPx(nextCardHeightPx);
  setStoredInteger(CARD_HEIGHT_STORAGE_KEY, clampedCardHeight, clampCardHeightPx);

  if (cardSizeSlider) {
    cardSizeSlider.value = `${clampedCardHeight}`;
  }

  applyCardSizeCssVariables();
  updateHandGeometryValueLabels();

  if (currentCards.length > 0) {
    renderCards(currentCards);
  }
}

function isAdvancedControlsPanelOpen() {
  return advancedControlsPanel instanceof HTMLElement && !advancedControlsPanel.hidden;
}

function setAdvancedControlsPanelOpen(nextOpen) {
  if (!(advancedControlsPanel instanceof HTMLElement) || !(advancedControlsToggleButton instanceof HTMLElement)) {
    return;
  }

  const shouldOpen = Boolean(nextOpen);
  advancedControlsPanel.hidden = !shouldOpen;
  advancedControlsToggleButton.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

function toggleAdvancedControlsPanel() {
  setAdvancedControlsPanelOpen(!isAdvancedControlsPanelOpen());
}

function handleDocumentPointerDownForAdvancedControls(event) {
  if (!isAdvancedControlsPanelOpen()) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }

  if (advancedControlsPanel?.contains(target) || advancedControlsToggleButton?.contains(target)) {
    return;
  }

  setAdvancedControlsPanelOpen(false);
}

function handleDocumentEscapeForAdvancedControls(event) {
  if (event.key !== "Escape" || !isAdvancedControlsPanelOpen()) {
    return;
  }

  setAdvancedControlsPanelOpen(false);
  advancedControlsToggleButton?.focus();
}

function updateHandModeControls() {
  const viewMode = getViewMode();
  const isHandView = viewMode === "hand";
  const isWhistMode = playMechanicMode === "whist";
  const isTapTapActiveMode = playMechanicMode === "taptap";
  const handLayoutMode = getHandLayoutMode();

  syncAlphaSliderForMode();
  enforceHandSortControlCoercion();

  handLayoutControls.forEach((control) => {
    control.classList.toggle("mode-toggle--hidden", !isHandView);
  });

  if (phiDegBox) {
    phiDegBox.classList.toggle(
      "mode-toggle__subcontrol--hidden",
      !isHandView || handLayoutMode !== "classic"
    );
  }

  if (demoOuterDropBox) {
    demoOuterDropBox.classList.toggle(
      "mode-toggle__subcontrol--hidden",
      !isHandView || handLayoutMode !== "demo"
    );
  }

  if (cardSizeBox) {
    cardSizeBox.classList.toggle("col-span-4", !isHandView);
  }

  if (visibilityFactorSlider) {
    visibilityFactorSlider.disabled = !isHandView;
  }

  if (alphaDegSlider) {
    alphaDegSlider.disabled = !isHandView;
  }

  if (phiDegSlider) {
    phiDegSlider.disabled = !isHandView || handLayoutMode !== "classic";
  }

  if (demoOuterDropSlider) {
    demoOuterDropSlider.disabled = !isHandView || handLayoutMode !== "demo";
  }

  if (rankSortEnabledToggle) {
    rankSortEnabledToggle.disabled = !isHandView || HAND_SORTING_API === null;
  }

  handSortPresetInputs.forEach((input) => {
    input.disabled = !isHandView || HAND_SORTING_API === null;
  });

  handDirectionInputs.forEach((input) => {
    input.disabled = !isHandView;
  });

  if (handSuitSortModeSelect) {
    handSuitSortModeSelect.disabled = !isHandView || HAND_SORTING_API === null || !isRankSortEnabled();
  }

  if (handRankPolicySelect) {
    handRankPolicySelect.disabled = !isHandView || HAND_SORTING_API === null || !isRankSortEnabled();
  }

  if (trickAnimationSpeedSelect) {
    trickAnimationSpeedSelect.disabled = !isHandView || (!isWhistMode && !isTapTapActiveMode);
  }

  if (trickBotAnimationModeSelect) {
    trickBotAnimationModeSelect.disabled = !isHandView || !isWhistMode;
  }

  if (playMechanicModeSelect) {
    playMechanicModeSelect.disabled = !isHandView;
  }

  if (tapTapTurnDirectionSelect) {
    tapTapTurnDirectionSelect.disabled = !isHandView || !isTapTapActiveMode;
  }

  updateTapTapLogControls();

  if (handDepthShadowToggle) {
    handDepthShadowToggle.disabled = !isHandView;
  }

  if (handDepthShadowStrengthSlider) {
    handDepthShadowStrengthSlider.disabled = !isHandView || !isHandDepthShadowEnabled();
  }

  if (handDepthShadowDirectionClock) {
    handDepthShadowDirectionClock
      .querySelectorAll(".shadow-clock__hour")
      .forEach((button) => {
        button.disabled = !isHandView || !isHandDepthShadowEnabled();
      });
  }

  syncHandSortPresetControlsFromLegacy();
  updateHandGeometryValueLabels();
  updateFanControlsState();
}

function applyHandDepthShadowState(viewMode = getViewMode()) {
  cardTable.classList.toggle(
    "card-table--hand-depth",
    viewMode === "hand" && isHandDepthShadowEnabled()
  );
}

function applyTableLayout(viewMode) {
  cardTable.className = "card-table";
  cardTable.style.removeProperty("width");
  cardTable.style.removeProperty("min-width");

  if (viewMode !== "hand") {
    clearHandHoverState();
    cardTable.classList.add("card-table--matrix");
    applyHandDepthShadowState(viewMode);
    return;
  }

  cardTable.classList.add("card-table--hand");
  applyHandDepthShadowState(viewMode);
}

function degToRad(value) {
  return value * (Math.PI / 180);
}

function radToDeg(value) {
  return value * (180 / Math.PI);
}

function rotatePointClockwise(point, angleRad) {
  const cosAngle = Math.cos(angleRad);
  const sinAngle = Math.sin(angleRad);

  return {
    x: point.x * cosAngle - point.y * sinAngle,
    y: point.x * sinAngle + point.y * cosAngle
  };
}

function getCardContourPoints(anchorX, anchorY, angleRad, cardWidth, cardHeight) {
  const localPoints = [
    { x: -cardWidth / 2, y: 0 },
    { x: cardWidth / 2, y: 0 },
    { x: cardWidth / 2, y: -cardHeight },
    { x: -cardWidth / 2, y: -cardHeight }
  ];

  return localPoints.map((point) => {
    const rotatedPoint = rotatePointClockwise(point, angleRad);
    return {
      x: anchorX + rotatedPoint.x,
      y: anchorY + rotatedPoint.y
    };
  });
}

function getBoundsFromPoints(points) {
  if (points.length === 0) {
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0
    };
  }

  let minLeft = Number.POSITIVE_INFINITY;
  let minTop = Number.POSITIVE_INFINITY;
  let maxRight = Number.NEGATIVE_INFINITY;
  let maxBottom = Number.NEGATIVE_INFINITY;

  points.forEach((point) => {
    minLeft = Math.min(minLeft, point.x);
    minTop = Math.min(minTop, point.y);
    maxRight = Math.max(maxRight, point.x);
    maxBottom = Math.max(maxBottom, point.y);
  });

  return {
    left: minLeft,
    top: minTop,
    right: maxRight,
    bottom: maxBottom,
    width: maxRight - minLeft,
    height: maxBottom - minTop
  };
}

function smoothstep(edge0, edge1, value) {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }

  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function getNormalizedGapDistance(gapIndex, centerIndex, stepCount) {
  if (stepCount <= 1) {
    return 1;
  }

  const gapCenter = gapIndex + 0.5;
  const maxGapDistance = Math.abs(0.5 - centerIndex);

  if (maxGapDistance <= 0) {
    return 1;
  }

  return Math.abs(gapCenter - centerIndex) / maxGapDistance;
}

function buildClassicHandLayouts({
  total,
  cardWidth,
  cardHeight,
  visibilityFactor,
  alphaRad,
  phiRad
}) {
  const stepCount = Math.max(0, total - 1);
  let alphaEffRad = 0;

  if (stepCount > 0) {
    alphaEffRad = Math.min(alphaRad, phiRad / stepCount);
  }

  const centerIndex = (total - 1) / 2;
  const thetaStart = -centerIndex * alphaEffRad;
  const visibleWidth = visibilityFactor * cardWidth;
  const radius = alphaEffRad > 0 ? visibleWidth / alphaEffRad : Number.POSITIVE_INFINITY;
  const layouts = [];

  for (let index = 0; index < total; index += 1) {
    const thetaRad = thetaStart + index * alphaEffRad;
    const anchorX = alphaEffRad > 0
      ? radius * Math.sin(thetaRad)
      : (index - centerIndex) * visibleWidth;
    const anchorY = alphaEffRad > 0
      ? radius - radius * Math.cos(thetaRad)
      : 0;

    layouts.push({
      index,
      thetaRad,
      thetaDeg: radToDeg(thetaRad),
      anchorX,
      anchorY,
      contour: getCardContourPoints(anchorX, anchorY, thetaRad, cardWidth, cardHeight)
    });
  }

  return {
    layouts,
    visibleWidth,
    alphaEffRad,
    alphaEffDeg: radToDeg(alphaEffRad),
    thetaStart,
    thetaEnd: thetaStart + stepCount * alphaEffRad,
    radius,
    curveType: "arc"
  };
}

function buildDemoHandLayouts({
  total,
  cardWidth,
  cardHeight,
  visibilityFactor,
  alphaDeg,
  demoOuterDropPct
}) {
  const stepCount = Math.max(0, total - 1);
  const centerIndex = (total - 1) / 2;
  const visibleWidth = visibilityFactor * cardWidth;
  const centerGapAngleRad = degToRad(alphaDeg);
  const maxOuterDropPx = (demoOuterDropPct / 100) * cardHeight;
  const gapAngles = [];
  const gapDrops = [];

  for (let gapIndex = 0; gapIndex < stepCount; gapIndex += 1) {
    const normalizedDistance = getNormalizedGapDistance(gapIndex, centerIndex, stepCount);
    const angleFalloff = smoothstep(0.5, 1, normalizedDistance);
    const angleWeight = 1 - 0.75 * angleFalloff;
    const dropWeight = smoothstep(1 / 3, 1, normalizedDistance);
    gapAngles.push(centerGapAngleRad * angleWeight);
    gapDrops.push(maxOuterDropPx * dropWeight);
  }

  const thetaRaw = [0];

  for (let index = 1; index < total; index += 1) {
    thetaRaw.push(thetaRaw[index - 1] + (gapAngles[index - 1] ?? 0));
  }

  const thetaOffset = thetaRaw.length > 0 ? (thetaRaw[0] + thetaRaw[thetaRaw.length - 1]) / 2 : 0;
  const thetaValues = thetaRaw.map((value) => value - thetaOffset);
  const anchorPoints = Array.from({ length: total }, () => ({ x: 0, y: 0 }));

  if (total % 2 === 1) {
    const centerCardIndex = Math.floor(centerIndex);
    anchorPoints[centerCardIndex] = { x: 0, y: 0 };

    for (let index = centerCardIndex; index < total - 1; index += 1) {
      const avgThetaRad = (thetaValues[index] + thetaValues[index + 1]) / 2;
      const dx = visibleWidth;
      const dy = Math.tan(avgThetaRad) * dx + (gapDrops[index] ?? 0);
      anchorPoints[index + 1] = {
        x: anchorPoints[index].x + dx,
        y: anchorPoints[index].y + dy
      };
    }

    for (let index = centerCardIndex - 1; index >= 0; index -= 1) {
      const avgThetaRad = (thetaValues[index] + thetaValues[index + 1]) / 2;
      const dx = -visibleWidth;
      const dy = Math.tan(avgThetaRad) * dx + (gapDrops[index] ?? 0);
      anchorPoints[index] = {
        x: anchorPoints[index + 1].x + dx,
        y: anchorPoints[index + 1].y + dy
      };
    }
  } else {
    const rightCenterIndex = total / 2;
    const leftCenterIndex = rightCenterIndex - 1;
    anchorPoints[leftCenterIndex] = { x: -visibleWidth / 2, y: 0 };
    anchorPoints[rightCenterIndex] = { x: visibleWidth / 2, y: 0 };

    for (let index = rightCenterIndex; index < total - 1; index += 1) {
      const avgThetaRad = (thetaValues[index] + thetaValues[index + 1]) / 2;
      const dx = visibleWidth;
      const dy = Math.tan(avgThetaRad) * dx + (gapDrops[index] ?? 0);
      anchorPoints[index + 1] = {
        x: anchorPoints[index].x + dx,
        y: anchorPoints[index].y + dy
      };
    }

    for (let index = leftCenterIndex - 1; index >= 0; index -= 1) {
      const avgThetaRad = (thetaValues[index] + thetaValues[index + 1]) / 2;
      const dx = -visibleWidth;
      const dy = Math.tan(avgThetaRad) * dx + (gapDrops[index] ?? 0);
      anchorPoints[index] = {
        x: anchorPoints[index + 1].x + dx,
        y: anchorPoints[index + 1].y + dy
      };
    }
  }

  const minAnchorY = anchorPoints.reduce(
    (minValue, point) => Math.min(minValue, point.y),
    Number.POSITIVE_INFINITY
  );
  const layouts = [];

  for (let index = 0; index < total; index += 1) {
    const thetaRad = thetaValues[index];
    const anchorX = anchorPoints[index].x;
    const anchorY = anchorPoints[index].y - minAnchorY;

    layouts.push({
      index,
      thetaRad,
      thetaDeg: radToDeg(thetaRad),
      anchorX,
      anchorY,
      contour: getCardContourPoints(anchorX, anchorY, thetaRad, cardWidth, cardHeight)
    });
  }

  return {
    layouts,
    visibleWidth,
    alphaEffRad: null,
    alphaEffDeg: null,
    thetaStart: layouts[0]?.thetaRad ?? 0,
    thetaEnd: layouts[layouts.length - 1]?.thetaRad ?? 0,
    radius: null,
    curveType: "polyline",
    curvePoints: layouts.map((layout) => ({ x: layout.anchorX, y: layout.anchorY })),
    centerGapAngleDeg: alphaDeg,
    maxOuterDropPx,
    gapAnglesDeg: gapAngles.map((value) => radToDeg(value)),
    gapDropsPx: gapDrops
  };
}

function applyHandDirectionToCardLayouts(cardLayouts, handDirection) {
  if (handDirection !== "rtl") {
    return cardLayouts;
  }

  return cardLayouts.map((layout, index, allLayouts) => ({
    ...allLayouts[allLayouts.length - 1 - index],
    index
  }));
}

function getHandLayoutMetrics(total, orderedCardElements = null) {
  const firstCard = cardTable.querySelector(".card");

  if (!firstCard || total <= 0) {
    return null;
  }

  const cardWidth = firstCard.offsetWidth;
  const cardHeight = firstCard.offsetHeight;
  const faceAnchorBottom = firstCard.clientTop + firstCard.clientHeight;
  const computedStyle = window.getComputedStyle(cardTable);
  const paddingLeft = Number.parseFloat(computedStyle.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(computedStyle.paddingRight) || 0;
  const paddingTop = Number.parseFloat(computedStyle.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(computedStyle.paddingBottom) || 0;
  const baseFrameWidth =
    tableSection?.parentElement?.clientWidth ||
    cardTable.parentElement?.clientWidth ||
    window.innerWidth;
  const availableWidth = Math.max(0, baseFrameWidth - paddingLeft - paddingRight);
  const handLayoutMode = getHandLayoutMode();
  const handDirection = getHandDirection();
  const alphaDeg = getAlphaDeg();
  const phiDeg = getPhiDeg();
  const demoOuterDropPct = getDemoOuterDropPct();
  const alphaRad = degToRad(alphaDeg);
  const phiRad = degToRad(phiDeg);
  const stepCount = Math.max(0, total - 1);
  const centerIndex = (total - 1) / 2;
  const effectiveOrderedCardElements = Array.isArray(orderedCardElements)
    ? orderedCardElements
    : Array.from(cardTable.querySelectorAll(".card"));
  const sameColorSuitGapBoundaries = getWhistSameColorSuitGapBoundaries(
    total,
    effectiveOrderedCardElements
  );

  const buildLayouts = (vf) => {
    const layoutState = handLayoutMode === "demo"
      ? buildDemoHandLayouts({
        total,
        cardWidth,
        cardHeight,
        visibilityFactor: vf,
        alphaDeg,
        demoOuterDropPct
      })
      : buildClassicHandLayouts({
        total,
        cardWidth,
        cardHeight,
        visibilityFactor: vf,
        alphaRad,
        phiRad
      });

    return applySameColorSuitGapToLayoutState(layoutState, sameColorSuitGapBoundaries);
  };

  let visibilityFactor = getVisibilityFactor();
  let layoutState = buildLayouts(visibilityFactor);
  let rawBounds = getBoundsFromPoints(layoutState.layouts.flatMap((layout) => layout.contour));

  // Auto-clamp: reduce effective visibility when hand would exceed the maximum possible
  // scroll area. We derive maxContentWidth from the table's CSS max-width (resolved to
  // pixels via getComputedStyle) rather than tableScroll.clientWidth. This avoids the
  // chicken-and-egg problem where the table hasn't expanded yet (fit-content reflows
  // only after JS yields), so the orange rectangle can grow to full page width first,
  // and we only clamp when the hand would overflow even a max-width table.
  // contentWidth = A × vf + B (exactly linear in vf), exact fit formula:
  // effectiveVF = userVF × (maxContent − B) / (contentWidth − B)
  const tableSectionStyle = tableSection ? window.getComputedStyle(tableSection) : null;
  const maxTableOuterWidth = tableSectionStyle
    ? (parseFloat(tableSectionStyle.maxWidth) || 0)
    : 0;
  const tablePaddingH = tableSectionStyle
    ? (parseFloat(tableSectionStyle.paddingLeft) || 0) + (parseFloat(tableSectionStyle.paddingRight) || 0)
    : 0;
  const tableBorderH = tableSectionStyle
    ? (parseFloat(tableSectionStyle.borderLeftWidth) || 0) + (parseFloat(tableSectionStyle.borderRightWidth) || 0)
    : 0;
  const maxScrollWidth = Math.max(0, maxTableOuterWidth - tablePaddingH - tableBorderH);
  const maxContentWidth = Math.max(0, maxScrollWidth - paddingLeft - paddingRight);

  if (rawBounds.width > maxContentWidth) {
    // B = contentWidth at VF=0: all cards stacked at one point, each rotated by their arc angle.
    // In arc mode B > cardWidth because the rotated card contributes cardHeight*sin(angle) to
    // the horizontal extent. This gives the exact B for the linear model: contentWidth = A*VF + B.
    const boundsAtZeroVf = getBoundsFromPoints(
      buildLayouts(0).layouts.flatMap((layout) => layout.contour)
    );
    const B = boundsAtZeroVf.width;
    if (rawBounds.width > B && maxContentWidth > B) {
      visibilityFactor = visibilityFactor * (maxContentWidth - B) / (rawBounds.width - B);
      layoutState = buildLayouts(visibilityFactor);
      rawBounds = getBoundsFromPoints(layoutState.layouts.flatMap((layout) => layout.contour));
    }
  }

  const visibleWidth = layoutState.visibleWidth;
  const contentWidth = rawBounds.width;
  const contentHeight = rawBounds.height;
  const tableWidth = Math.ceil(contentWidth + paddingLeft + paddingRight);
  const offsetX = paddingLeft - rawBounds.left;
  const canvasHeight =
    cardTable.clientHeight ||
    Math.max(HAND_BASE_CANVAS_HEIGHT + paddingTop + paddingBottom, Math.ceil(contentHeight));
  const bottomClipPx = cardHeight * getHandBottomClipRatio(cardHeight);
  const targetBottomY = canvasHeight + bottomClipPx;
  const offsetY = targetBottomY - rawBounds.bottom;
  const positionedCards = layoutState.layouts.map((layout) => ({
    ...layout,
    screenAnchorX: offsetX + layout.anchorX,
    screenAnchorY: offsetY + layout.anchorY,
    left: offsetX + layout.anchorX - cardWidth / 2,
    top: offsetY + layout.anchorY - cardHeight
  }));
  const curvePoints = Array.isArray(layoutState.curvePoints)
    ? layoutState.curvePoints.map((point) => ({
        x: offsetX + point.x,
        y: offsetY + point.y
      }))
    : null;
  const visualCardLayouts = applyHandDirectionToCardLayouts(positionedCards, handDirection);

  return {
    handLayoutMode,
    handDirection,
    cardWidth,
    cardHeight,
    faceAnchorBottom,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    availableWidth,
    visibilityFactor,
    alphaDeg,
    phiDeg,
    demoOuterDropPct,
    alphaRad,
    phiRad,
    alphaEffRad: layoutState.alphaEffRad,
    alphaEffDeg: layoutState.alphaEffDeg,
    visibleWidth,
    stepCount,
    centerIndex,
    thetaStart: layoutState.thetaStart,
    thetaEnd: layoutState.thetaEnd,
    radius: layoutState.radius,
    rawBounds,
    contentWidth,
    contentHeight,
    tableWidth,
    offsetX,
    offsetY,
    curveType: layoutState.curveType,
    curvePoints,
    centerGapAngleDeg: layoutState.centerGapAngleDeg ?? alphaDeg,
    maxOuterDropPx: layoutState.maxOuterDropPx ?? 0,
    gapAnglesDeg: layoutState.gapAnglesDeg ?? null,
    gapDropsPx: layoutState.gapDropsPx ?? null,
    sameColorSuitGapBoundaries: Array.isArray(layoutState.sameColorSuitGapBoundaries)
      ? [...layoutState.sameColorSuitGapBoundaries]
      : [],
    sameColorSuitGapCount: Number.isInteger(layoutState.sameColorSuitGapCount)
      ? layoutState.sameColorSuitGapCount
      : 0,
    cardLayouts: visualCardLayouts
  };
}

function syncHandScrollPosition() {
  if (!tableScroll || getViewMode() !== "hand") {
    return;
  }

  const metrics = getHandLayoutMetrics(currentCards.length);

  if (!metrics || metrics.cardLayouts.length === 0) {
    return;
  }

  const handCenterX = metrics.offsetX + (metrics.rawBounds.left + metrics.rawBounds.right) / 2;
  const targetScrollLeft = Math.max(
    0,
    Math.min(
      tableScroll.scrollWidth - tableScroll.clientWidth,
      handCenterX - tableScroll.clientWidth / 2
    )
  );

  tableScroll.scrollLeft = targetScrollLeft;
}

function syncTableFrameWidth() {
  return false;
}

function layoutHandCards(total) {
  const cardElements = getCardElementsInCurrentLayoutOrder();

  if (cardElements.length === 0) {
    return;
  }

  const fullMetrics = getHandLayoutMetrics(total, cardElements);
  if (!fullMetrics) {
    return;
  }
  let metrics = fullMetrics;

  let layoutEntries = cardElements.map((cardElement, index) => ({
    cardElement,
    orderIndex: index,
    layoutIndex: index
  }));

  if (isSuitDragActive()) {
    const suitDragLayoutPlan = buildSuitDragLayoutPlan(cardElements);
    if (suitDragLayoutPlan?.metrics && Array.isArray(suitDragLayoutPlan.layoutEntries)) {
      metrics = suitDragLayoutPlan.metrics;
      layoutEntries = suitDragLayoutPlan.layoutEntries;
    }
  }

  if (!Array.isArray(metrics.cardLayouts) || metrics.cardLayouts.length === 0) {
    return;
  }

  const shadowStrengthFactor = getHandDepthShadowStrengthFactor();
  const shadowDirectionAngleRad = degToRad((getHandDepthShadowDirectionHourIndex() * 30) - 90);

  cardTable.style.width = `${Math.ceil(metrics.tableWidth)}px`;
  cardTable.style.minWidth = `${Math.ceil(metrics.tableWidth)}px`;
  const layoutCards = [];
  const layoutCardModels = [];
  layoutEntries.forEach((entry) => {
    const layoutIndex = Number.isInteger(entry.layoutIndex)
      ? entry.layoutIndex
      : entry.orderIndex;
    if (layoutIndex < 0 || layoutIndex >= metrics.cardLayouts.length) {
      return;
    }
    layoutCards.push(entry.cardElement);
    layoutCardModels.push(metrics.cardLayouts[layoutIndex]);
  });

  const dragTargetTiltDeg = getCardDragTargetTiltDegFromLayout(layoutCards, layoutCardModels);
  if (isCardDragActive()) {
    cardDragState.dragCardDynamicTiltDeg = dragTargetTiltDeg;
  }

  const suitDragShadowPlan = buildSuitDragShadowLayoutPlan(cardElements, fullMetrics);
  const suitDragCurveSamples = buildSuitDragCurveSamples(layoutEntries, metrics);
  const suitDragTargetTiltDeg = getSuitDragTargetTiltDegFromLayoutEntries(
    layoutEntries,
    metrics,
    suitDragCurveSamples
  );
  const suitDragTargetCenter = getSuitDragTargetCenterFromLayoutEntries(
    layoutEntries,
    metrics,
    suitDragCurveSamples
  );
  if (isSuitDragActive()) {
    const shadowLayoutsById = suitDragShadowPlan?.layoutsById;
    if (shadowLayoutsById instanceof Map && shadowLayoutsById.size > 0) {
      cardDragState.dragGroupShadowLayoutsById = shadowLayoutsById;
      cardDragState.dragGroupShadowModelActive = true;
    } else {
      cardDragState.dragGroupShadowLayoutsById = null;
      cardDragState.dragGroupShadowModelActive = false;
    }

    cardDragState.dragGroupCurveSamples = suitDragCurveSamples;
    cardDragState.dragGroupDynamicTiltDeg = suitDragTargetTiltDeg;
    cardDragState.dragGroupDynamicCenterTableX = suitDragTargetCenter?.centerX ?? null;
    cardDragState.dragGroupDynamicCenterTableY = suitDragTargetCenter?.centerY ?? null;
    cardDragState.dragGroupDynamicCenterClientX = getDraggedSuitGroupCenterClientX();
    cardDragState.dragGroupPointerDeltaY = cardDragState.lastClientY - cardDragState.startClientY;
  }

  layoutEntries.forEach((entry) => {
    const cardElement = entry.cardElement;
    const layoutIndex = Number.isInteger(entry.layoutIndex)
      ? Math.max(0, Math.min(entry.layoutIndex, metrics.cardLayouts.length - 1))
      : Math.max(0, Math.min(entry.orderIndex, metrics.cardLayouts.length - 1));
    const cardLayout = metrics.cardLayouts[layoutIndex];
    if (!cardLayout) {
      return;
    }

    const shadowDepth = metrics.cardLayouts.length <= 1
      ? 1
      : layoutIndex / (metrics.cardLayouts.length - 1);
    const shadowOpacity = Math.min(
      0.28,
      (0.06 + shadowDepth * 0.06) * shadowStrengthFactor
    );
    const shadowBlur = 4 + (shadowDepth * 5 + shadowStrengthFactor * 6);
    const shadowDistance = (3 + shadowDepth * 8) * shadowStrengthFactor;
    const globalShadowShift = {
      x: Math.cos(shadowDirectionAngleRad) * shadowDistance,
      y: Math.sin(shadowDirectionAngleRad) * shadowDistance
    };
    const localShadowShift = rotatePointClockwise(globalShadowShift, -cardLayout.thetaRad);
    const shadowWidth = `${Math.min(108, 86 + shadowDepth * 6 + shadowStrengthFactor * 8).toFixed(1)}%`;
    const shadowHeight = `${Math.min(112, 90 + shadowDepth * 6 + shadowStrengthFactor * 8).toFixed(1)}%`;

    cardElement.style.left = `${Math.round(cardLayout.left)}px`;
    cardElement.style.top = `${Math.round(cardLayout.top)}px`;
    cardElement.style.transformOrigin = "50% 100%";
    cardElement.dataset.handBaseTransform = `rotate(${cardLayout.thetaDeg}deg)`;
    cardElement.dataset.handThetaDeg = `${cardLayout.thetaDeg}`;
    cardElement.dataset.handCardWidthPx = `${metrics.cardWidth}`;
    cardElement.dataset.handCardHeightPx = `${metrics.cardHeight}`;
    cardElement.dataset.handBaseZIndex = `${layoutIndex + 1}`;
    applyCardHandTransform(cardElement, cardElement.dataset.handBaseTransform, layoutIndex + 1);
    applyCardDragVisual(cardElement);
    applySuitDragVisual(cardElement);
    cardElement.style.setProperty("--hand-shadow-opacity", shadowOpacity.toFixed(3));
    cardElement.style.setProperty("--hand-shadow-blur", `${shadowBlur.toFixed(1)}px`);
    cardElement.style.setProperty("--hand-shadow-width", shadowWidth);
    cardElement.style.setProperty("--hand-shadow-height", shadowHeight);
    cardElement.style.setProperty("--hand-shadow-shift-x", `${localShadowShift.x.toFixed(1)}px`);
    cardElement.style.setProperty("--hand-shadow-shift-y", `${localShadowShift.y.toFixed(1)}px`);
  });
}

function refreshHandLayoutFromControls() {
  if (currentCards.length === 0 || getViewMode() !== "hand") {
    return;
  }

  stabilizeHandLayout(currentCards.length);
  syncHandScrollPosition();
  updateDebugOverlays();

  // Skip post-transition sync during wireframe mode — no CSS transitions are running.
  // For keyboard-driven slider interaction (no pointerdown), transitions are still active
  // so the deferred sync remains useful.
  if (!isWireframeMode) {
    schedulePostTransitionHandLayoutSync();
  }
}

function getFanDurationMs() {
  return getClampedSliderValue(fanDurationSlider, DEFAULT_FAN_DURATION_SEC, MIN_FAN_DURATION_SEC, MAX_FAN_DURATION_SEC) * 1000;
}

function getFanStepMs() {
  return getClampedSliderValue(fanStepMsSlider, DEFAULT_FAN_STEP_MS, MIN_FAN_STEP_MS, MAX_FAN_STEP_MS);
}

function getEffectiveFanStepMs(cardCount) {
  const n = Math.max(1, cardCount);
  return Math.min(getFanDurationMs() / n, getFanStepMs());
}

function isFanAnimationEnabled() {
  return !fanAnimateToggle || fanAnimateToggle.checked;
}

function updateFanControlsState() {
  const enabled = isFanAnimationEnabled();
  if (fanDurationSlider) fanDurationSlider.disabled = !enabled;
  if (fanStepMsSlider) fanStepMsSlider.disabled = !enabled;
}

function clearFanAnimation() {
  fanCardTimeoutIds.forEach((id) => window.clearTimeout(id));
  fanCardTimeoutIds = [];
  if (fanAnimationTimeoutId !== null) {
    window.clearTimeout(fanAnimationTimeoutId);
    fanAnimationTimeoutId = null;
  }
  cardTable.querySelectorAll(".card").forEach((card) => {
    card.style.removeProperty("opacity");
  });
}

function enterWireframeMode() {
  clearFanAnimation();
  if (handLayoutSyncTimeoutId !== null) {
    window.clearTimeout(handLayoutSyncTimeoutId);
    handLayoutSyncTimeoutId = null;
  }
  isWireframeMode = true;
  cardTable.classList.add("card-table--hand-wireframe");
}

function exitWireframeMode() {
  isWireframeMode = false;
  cardTable.classList.remove("card-table--hand-wireframe");
}

function playFanAnimation(cardCount) {
  if (getViewMode() !== "hand") return;
  if (!isFanAnimationEnabled()) return;
  clearFanAnimation();
  const stepMs = getEffectiveFanStepMs(cardCount);
  const cards = Array.from(cardTable.querySelectorAll(".card"));

  // Hide all cards initially, then reveal each one instantly at its step time.
  cards.forEach((card) => { card.style.opacity = "0"; });
  cards.forEach((card, i) => {
    const id = window.setTimeout(() => {
      card.style.removeProperty("opacity");
    }, i * stepMs);
    fanCardTimeoutIds.push(id);
  });

  const totalMs = Math.max(0, cardCount - 1) * stepMs;
  fanAnimationTimeoutId = window.setTimeout(() => {
    cards.forEach((card) => card.style.removeProperty("opacity"));
    fanCardTimeoutIds = [];
    fanAnimationTimeoutId = null;
  }, totalMs + 50);
}

function animateViewSwitch() {
  cardTable.classList.remove("card-table--switching");
  // Trigger a restart when switching repeatedly.
  void cardTable.offsetWidth;
  cardTable.classList.add("card-table--switching");

  if (viewSwitchTimeoutId !== null) {
    window.clearTimeout(viewSwitchTimeoutId);
  }

  viewSwitchTimeoutId = window.setTimeout(() => {
    cardTable.classList.remove("card-table--switching");
    viewSwitchTimeoutId = null;
  }, VIEW_SWITCH_ANIMATION_MS);
}

function getRenderedCardBounds() {
  const cardElements = cardTable.querySelectorAll(".card");

  if (cardElements.length === 0) {
    return null;
  }

  const tableRect = cardTable.getBoundingClientRect();
  let minLeft = Number.POSITIVE_INFINITY;
  let minTop = Number.POSITIVE_INFINITY;
  let maxRight = Number.NEGATIVE_INFINITY;
  let maxBottom = Number.NEGATIVE_INFINITY;

  cardElements.forEach((cardElement) => {
    const rect = cardElement.getBoundingClientRect();
    const left = rect.left - tableRect.left + cardTable.scrollLeft;
    const top = rect.top - tableRect.top + cardTable.scrollTop;
    const right = rect.right - tableRect.left + cardTable.scrollLeft;
    const bottom = rect.bottom - tableRect.top + cardTable.scrollTop;

    minLeft = Math.min(minLeft, left);
    minTop = Math.min(minTop, top);
    maxRight = Math.max(maxRight, right);
    maxBottom = Math.max(maxBottom, bottom);
  });

  return {
    left: minLeft,
    top: minTop,
    right: maxRight,
    bottom: maxBottom,
    width: maxRight - minLeft,
    height: maxBottom - minTop
  };
}

function getHandLayoutDiagnostics() {
  const bounds = getRenderedCardBounds();
  const metrics = getHandLayoutMetrics(currentCards.length);

  return {
    timestamp: new Date().toISOString(),
    deckId: activeDeck?.deckId ?? null,
    availableJokerCount: availableJokers.length,
    jokersEnabled,
    jokerCount,
    selectedJokerId,
    lastSelectedJokerId,
    runtimeDeckCount: getDeckMaxCount(),
    cardCount: currentCards.length,
    viewMode: getViewMode(),
    handLayoutMode: getHandLayoutMode(),
    handDirection: getHandDirection(),
    handSuitSortMode: getHandSuitSortMode(),
    rankSortEnabled: isRankSortEnabled(),
    handSortModeEffective: getEffectiveHandSortMode(),
    handRankPolicy: getHandRankPolicy(),
    playMechanicMode,
    cardTransitionRenderMode,
    tapTapTurnDirection,
    trickPhase,
    trickInteractionLocked: isTrickInteractionLocked(),
    trickAnimationSpeedPreset,
    trickBotAnimationMode,
    tapTapStateActive,
    tapTapTurnSeatId,
    tapTapTurnHasDrawn,
    tapTapDrawPileCount: tapTapDrawPile.length,
    tapTapPlayedPileCount: tapTapPlayedPile.length,
    dealRequestedCount,
    playerCountForDeal,
    activeBotSeatIds: getActiveBotSeatIds(playerCountForDeal),
    lastPlayIntentCardId,
    lastPlayIntentAtIso,
    cardSizePx: getCardSizePx(),
    visibilityFactor: getVisibilityFactor(),
    alphaDeg: getAlphaDeg(),
    phiDeg: getHandLayoutMode() === "classic" ? getPhiDeg() : null,
    demoOuterDropPct: getHandLayoutMode() === "demo" ? getDemoOuterDropPct() : null,
    tableViewportHeight: tableViewport?.clientHeight ?? null,
    tableScrollHeight: tableScroll?.clientHeight ?? null,
    cardTableClientHeight: cardTable.clientHeight,
    cardTableScrollWidth: cardTable.scrollWidth,
    cardTableClientWidth: cardTable.clientWidth,
    metrics: metrics
      ? {
          visibleWidth: metrics.visibleWidth,
          alphaEffDeg: metrics.alphaEffDeg,
          alphaEffRad: metrics.alphaEffRad,
          thetaStart: metrics.thetaStart,
          thetaEnd: metrics.thetaEnd,
          radius: metrics.radius,
          curveType: metrics.curveType,
          centerGapAngleDeg: metrics.centerGapAngleDeg,
          maxOuterDropPx: metrics.maxOuterDropPx,
          sameColorSuitGapCount: metrics.sameColorSuitGapCount,
          sameColorSuitGapBoundaries: metrics.sameColorSuitGapBoundaries,
          contentWidth: metrics.contentWidth,
          contentHeight: metrics.contentHeight
        }
      : null,
    bounds: bounds
      ? {
          left: bounds.left,
          top: bounds.top,
          right: bounds.right,
          bottom: bounds.bottom,
          width: bounds.width,
          height: bounds.height
        }
      : null,
    clipping: bounds
      ? {
          top: Math.max(0, Math.ceil(bounds.top * -1)),
          bottomAgainstViewport: Math.max(
            0,
            Math.ceil(bounds.bottom - (tableViewport?.clientHeight ?? 0))
          ),
          bottomAgainstScroll: Math.max(
            0,
            Math.ceil(bounds.bottom - (tableScroll?.clientHeight ?? 0))
          )
        }
      : null
  };
}

function captureTestScenarioSnapshot(label) {
  if (!TEST_MODE) {
    return null;
  }

  const snapshot = {
    label,
    ...getHandLayoutDiagnostics()
  };
  testScenarioHistory.push(snapshot);
  return snapshot;
}

function publishHandLayoutDiagnostics() {
  if (!TEST_MODE) {
    return;
  }

  const payload = {
    scenario: TEST_SCENARIO || null,
    current: getHandLayoutDiagnostics(),
    history: testScenarioHistory
  };
  window.__CTP_TEST_REPORT__ = payload;

  let reportNode = document.getElementById("ctp-test-report");
  if (!reportNode) {
    reportNode = document.createElement("pre");
    reportNode.id = "ctp-test-report";
    reportNode.hidden = true;
    document.body.appendChild(reportNode);
  }

  reportNode.textContent = JSON.stringify(payload, null, 2);
}

async function runTestScenario() {
  if (!TEST_MODE || !TEST_SCENARIO || currentCards.length === 0) {
    publishHandLayoutDiagnostics();
    return;
  }

  testScenarioHistory.length = 0;

  if (TEST_SCENARIO === "phi-lag") {
    captureTestScenarioSnapshot("initial");

    if (phiDegSlider) {
      phiDegSlider.value = "60.0";
    }
    updateHandGeometryValueLabels();
    refreshHandLayoutFromControls();
    captureTestScenarioSnapshot("after-phi-input");

    await waitForAnimationFrame();
    await waitForMs(VIEW_SWITCH_ANIMATION_MS + 80);
    updateDebugOverlays();
    captureTestScenarioSnapshot("after-phi-transition");

    if (visibilityFactorSlider) {
      const nudgedVisibility = Math.min(1, getVisibilityFactor() + 0.01);
      visibilityFactorSlider.value = nudgedVisibility.toFixed(2);
    }
    updateHandGeometryValueLabels();
    refreshHandLayoutFromControls();
    captureTestScenarioSnapshot("after-visibility-input");

    await waitForAnimationFrame();
    await waitForMs(VIEW_SWITCH_ANIMATION_MS + 80);
    updateDebugOverlays();
    captureTestScenarioSnapshot("after-visibility-transition");
  }

  publishHandLayoutDiagnostics();
}

function ensureHandCardsFullyVisible() {
  if (getViewMode() !== "hand") {
    cardTable.style.removeProperty("--hand-pad-top");
    cardTable.style.removeProperty("--hand-pad-bottom");
    cardTable.style.removeProperty("--hand-canvas-height");
    return false;
  }

  const nextPaddingTop = HAND_BASE_PADDING_TOP;
  const nextPaddingBottom = HAND_BASE_PADDING_BOTTOM;
  const requiredCanvasHeight = HAND_BASE_CANVAS_HEIGHT;
  const nextPaddingTopValue = `${nextPaddingTop}px`;
  const nextPaddingBottomValue = `${nextPaddingBottom}px`;
  const nextCanvasHeightValue = `${requiredCanvasHeight}px`;
  const changed =
    cardTable.style.getPropertyValue("--hand-pad-top") !== nextPaddingTopValue ||
    cardTable.style.getPropertyValue("--hand-pad-bottom") !== nextPaddingBottomValue ||
    cardTable.style.getPropertyValue("--hand-canvas-height") !== nextCanvasHeightValue;

  cardTable.style.setProperty(
    "--hand-pad-top",
    nextPaddingTopValue
  );
  cardTable.style.setProperty(
    "--hand-pad-bottom",
    nextPaddingBottomValue
  );
  cardTable.style.setProperty("--hand-canvas-height", nextCanvasHeightValue);
  return changed;
}

function getTableMaxOuterHeightFromViewport() {
  if (!(tableSection instanceof HTMLElement)) {
    return 0;
  }

  const viewportHeight = window.innerHeight;
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) {
    return 0;
  }

  const tableTop = tableContainer instanceof HTMLElement
    ? tableContainer.getBoundingClientRect().top
    : tableSection.getBoundingClientRect().top;
  const safeTableTop = Number.isFinite(tableTop) ? Math.max(0, tableTop) : 0;
  const maxOuterHeight = viewportHeight - safeTableTop - TABLE_HEIGHT_BUDGET_SAFETY_PX;

  return Math.max(1, Math.floor(maxOuterHeight));
}

function applyTableHeightBudget(desiredContentHeight = null) {
  if (!(tableSection instanceof HTMLElement)) {
    return null;
  }

  const maxOuterHeight = getTableMaxOuterHeightFromViewport();
  if (maxOuterHeight <= 0) {
    return null;
  }

  const tableStyle = window.getComputedStyle(tableSection);
  const paddingTop = Number.parseFloat(tableStyle.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(tableStyle.paddingBottom) || 0;
  const borderTop = Number.parseFloat(tableStyle.borderTopWidth) || 0;
  const borderBottom = Number.parseFloat(tableStyle.borderBottomWidth) || 0;
  const nonContentHeight = paddingTop + paddingBottom + borderTop + borderBottom;
  const maxContentHeight = Math.max(1, Math.floor(maxOuterHeight - nonContentHeight));
  const desired = Number.isFinite(desiredContentHeight)
    ? Math.max(1, Math.floor(desiredContentHeight))
    : maxContentHeight;
  const nextContentHeight = Math.min(desired, maxContentHeight);
  const nextContentHeightValue = `${nextContentHeight}px`;

  const changed =
    tableSection.style.height !== nextContentHeightValue ||
    tableSection.style.minHeight !== nextContentHeightValue ||
    tableSection.style.maxHeight !== nextContentHeightValue;
  tableSection.style.height = nextContentHeightValue;
  tableSection.style.minHeight = nextContentHeightValue;
  tableSection.style.maxHeight = nextContentHeightValue;
  return {
    changed,
    appliedContentHeight: nextContentHeight
  };
}

function syncHandViewportHeight() {
  if (!tableViewport || !tableScroll || !tableSection) {
    return false;
  }

  const tableBudgetResult = applyTableHeightBudget();
  if (!tableBudgetResult) {
    return false;
  }

  const effectiveViewportHeight = Math.max(1, Math.round(tableBudgetResult.appliedContentHeight));
  const targetHeightValue = `${effectiveViewportHeight}px`;
  const viewportChanged =
    tableViewport.style.height !== targetHeightValue ||
    tableViewport.style.minHeight !== targetHeightValue ||
    tableScroll.style.height !== targetHeightValue ||
    tableScroll.style.minHeight !== targetHeightValue;
  tableViewport.style.height = targetHeightValue;
  tableViewport.style.minHeight = targetHeightValue;
  tableScroll.style.height = targetHeightValue;
  tableScroll.style.minHeight = targetHeightValue;

  return viewportChanged || Boolean(tableBudgetResult.changed);
}

function stabilizeHandLayout(total) {
  for (let pass = 0; pass < 6; pass += 1) {
    layoutHandCards(total);
    const visibilityChanged = ensureHandCardsFullyVisible();
    const frameChanged = syncTableFrameWidth();
    layoutHandCards(total);
    const viewportChanged = syncHandViewportHeight();

    if (!visibilityChanged && !frameChanged && !viewportChanged) {
      break;
    }
  }

  syncTableFrameWidth();
  layoutHandCards(total);
  syncHandViewportHeight();
}

function removeCardBoundsOverlay() {
  const existingOverlay = cardTable.querySelector(".card-bounds-overlay");

  if (existingOverlay) {
    existingOverlay.remove();
  }
}

function removeHandCurveOverlay() {
  const existingOverlay = cardTable.querySelector(".hand-curve-overlay");

  if (existingOverlay) {
    existingOverlay.remove();
  }
}

function removeSeatMarkersOverlay() {
  [cardTable, getTrickPlayfieldElement()].forEach((host) => {
    if (!(host instanceof HTMLElement)) {
      return;
    }

    const existingOverlay = host.querySelector(".seat-markers-overlay");
    if (existingOverlay) {
      existingOverlay.remove();
    }
  });
}

function updateSeatMarkersOverlay() {
  removeSeatMarkersOverlay();

  if (getViewMode() !== "hand" || (!tapTapStateActive && currentCards.length === 0)) {
    return;
  }

  const botSeatIds = getActiveBotSeatIds(playerCountForDeal);
  if (botSeatIds.length === 0) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "seat-markers-overlay";
  overlay.setAttribute("aria-hidden", "true");

  botSeatIds.forEach((seatId) => {
    const seatVisual = BOT_SEAT_VISUALS[seatId];
    const seatAnchor = getSeatAnchorById(seatId);
    if (!seatVisual || !seatAnchor) {
      return;
    }

    const marker = document.createElement("div");
    marker.className = "seat-marker";
    marker.dataset.seatId = seatId;
    marker.style.left = `${seatAnchor.x}px`;
    marker.style.top = `${seatAnchor.y}px`;
    marker.style.setProperty("--seat-color", seatVisual.color);

    const label = document.createElement("span");
    label.className = "seat-marker__label";
    label.textContent = seatVisual.label;
    marker.appendChild(label);
    overlay.appendChild(marker);
  });

  const playfieldElement = getTrickPlayfieldElement();
  if (playfieldElement instanceof HTMLElement) {
    playfieldElement.appendChild(overlay);
  }
}

function removeTapTapCenterPiles() {
  resetTapTapPileAnchors();
  [cardTable, getTrickPlayfieldElement()].forEach((host) => {
    if (!(host instanceof HTMLElement)) {
      return;
    }

    const existingOverlay = host.querySelector(".taptap-center-piles");
    if (existingOverlay) {
      existingOverlay.remove();
    }
  });
}

function getTapTapStackVisualModel(cardCount) {
  const safeCount = Number.isInteger(cardCount) && cardCount > 0 ? cardCount : 0;
  if (safeCount === 0) {
    return {
      count: 0,
      visibleLayers: 0,
      spreadPx: 0,
      layerStepPx: 0
    };
  }

  const visibleLayers = Math.max(1, Math.min(8, Math.round(Math.log2(safeCount + 1) * 2)));
  const spreadPx = Math.min(11, Math.max(1, Math.round(Math.log2(safeCount + 1) * 2.2)));
  const layerStepPx = visibleLayers > 1 ? spreadPx / (visibleLayers - 1) : 0;

  return {
    count: safeCount,
    visibleLayers,
    spreadPx,
    layerStepPx
  };
}

async function createTapTapPileStackElement({ pileKind, cardCount, playedCards = [] }) {
  const isDrawPile = pileKind === "draw";
  const visualModel = getTapTapStackVisualModel(cardCount);
  const playedCardsFromTop = Array.isArray(playedCards)
    ? [...playedCards].reverse()
    : [];
  const playedFaceLayerCount = isDrawPile
    ? 0
    : Math.min(3, playedCardsFromTop.length, visualModel.visibleLayers);

  const stackElement = document.createElement("div");
  stackElement.className = `taptap-pile__stack taptap-pile__stack--${isDrawPile ? "draw" : "played"}`;
  stackElement.style.setProperty("--stack-spread-px", `${visualModel.spreadPx.toFixed(2)}px`);

  const cardsElement = document.createElement("div");
  cardsElement.className = "taptap-pile__stack-cards";

  if (visualModel.count === 0) {
    cardsElement.classList.add("taptap-pile__stack-cards--empty");
    const emptyCard = document.createElement("span");
    emptyCard.className = "taptap-pile__stack-card taptap-pile__stack-card--empty";
    cardsElement.appendChild(emptyCard);
    stackElement.appendChild(cardsElement);
    return stackElement;
  }

  for (let layerIndex = visualModel.visibleLayers - 1; layerIndex >= 0; layerIndex -= 1) {
    const cardLayerElement = document.createElement("div");
    const depthFromTop = layerIndex;
    const offsetPx = (visualModel.layerStepPx * layerIndex).toFixed(2);
    cardLayerElement.className = "taptap-pile__stack-card";
    if (layerIndex === 0) {
      cardLayerElement.classList.add("taptap-pile__stack-card--top");
    }
    cardLayerElement.style.transform = `translate(${offsetPx}px, ${offsetPx}px)`;
    cardLayerElement.style.zIndex = `${visualModel.visibleLayers - layerIndex}`;

    if (isDrawPile) {
      cardLayerElement.classList.add("taptap-pile__stack-card--back");
    } else {
      const hasFaceLayer = depthFromTop < playedFaceLayerCount;
      if (hasFaceLayer) {
        const faceCard = playedCardsFromTop[depthFromTop];
        if (faceCard) {
          cardLayerElement.classList.add("taptap-pile__stack-card--played-face");
          const faceCardElement = await createCardElement(faceCard, "image");
          faceCardElement.classList.add("taptap-pile__stack-face-card");
          faceCardElement.setAttribute("aria-hidden", "true");
          cardLayerElement.appendChild(faceCardElement);
        } else {
          cardLayerElement.classList.add("taptap-pile__stack-card--played-under");
        }
      } else {
        cardLayerElement.classList.add("taptap-pile__stack-card--played-under");
      }
    }

    cardsElement.appendChild(cardLayerElement);
  }

  stackElement.appendChild(cardsElement);
  return stackElement;
}

function createTapTapPileInfoElement({ title, count, hint }) {
  const infoElement = document.createElement("div");
  infoElement.className = "taptap-pile__info";

  const titleElement = document.createElement("span");
  titleElement.className = "taptap-pile__title";
  titleElement.textContent = title;

  const valueElement = document.createElement("span");
  valueElement.className = "taptap-pile__value";
  valueElement.textContent = `${count}`;

  const hintElement = document.createElement("span");
  hintElement.className = "taptap-pile__hint";
  hintElement.textContent = hint;

  infoElement.appendChild(titleElement);
  infoElement.appendChild(valueElement);
  infoElement.appendChild(hintElement);
  return infoElement;
}

async function updateTapTapCenterPiles() {
  const renderToken = tapTapCenterPilesRenderToken + 1;
  tapTapCenterPilesRenderToken = renderToken;
  removeTapTapCenterPiles();

  if (!isTapTapMode() || !tapTapStateActive || getViewMode() !== "hand") {
    return;
  }

  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "taptap-center-piles";

  const drawPileButton = document.createElement("button");
  drawPileButton.type = "button";
  drawPileButton.className = "taptap-pile taptap-pile--draw";
  const drawEnabled = tapTapTurnSeatId === "S" && !tapTapTurnHasDrawn && tapTapDrawPile.length > 0;
  const drawPileCount = tapTapDrawPile.length;
  const playedPileSnapshot = [...tapTapPlayedPile];
  const playedPileCount = playedPileSnapshot.length;
  drawPileButton.disabled = !drawEnabled;
  drawPileButton.appendChild(await createTapTapPileStackElement({
    pileKind: "draw",
    cardCount: drawPileCount
  }));
  drawPileButton.appendChild(createTapTapPileInfoElement({
    title: "Draw pile",
    count: drawPileCount,
    hint: drawEnabled ? "Tap to draw (optional)" : "Draw unavailable"
  }));
  drawPileButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    void handleTapTapHumanDrawIntent();
  });

  const playedTopCard = playedPileCount > 0
    ? playedPileSnapshot[playedPileCount - 1]
    : null;
  const playedPileTopHint = playedTopCard ? getCardPlayLabel(playedTopCard) : "--";

  const playedPile = document.createElement("div");
  playedPile.className = "taptap-pile taptap-pile--played";
  playedPile.appendChild(await createTapTapPileStackElement({
    pileKind: "played",
    cardCount: playedPileCount,
    playedCards: playedPileSnapshot
  }));
  playedPile.appendChild(createTapTapPileInfoElement({
    title: "Played pile",
    count: playedPileCount,
    hint: `Top: ${playedPileTopHint}`
  }));

  const meta = document.createElement("div");
  meta.className = "taptap-center-piles__meta";
  meta.textContent = `Turn: ${formatSeatTurnLabel(tapTapTurnSeatId)} · ${
    tapTapTurnDirection === "clockwise" ? "clockwise" : "counter-clockwise"
  }`;

  if (renderToken !== tapTapCenterPilesRenderToken) {
    return;
  }

  overlay.appendChild(drawPileButton);
  overlay.appendChild(playedPile);
  overlay.appendChild(meta);
  playfieldElement.appendChild(overlay);
  refreshTapTapPileAnchorsFromDom();
}

function clearTrickLayer() {
  [cardTable, getTrickPlayfieldElement()].forEach((host) => {
    if (!(host instanceof HTMLElement)) {
      return;
    }

    const existingLayer = host.querySelector(".trick-layer");
    if (existingLayer) {
      existingLayer.remove();
    }
  });
}

function ensureTrickLayer() {
  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    return null;
  }

  let layer = playfieldElement.querySelector(".trick-layer");
  if (layer instanceof HTMLElement) {
    return layer;
  }

  layer = document.createElement("div");
  layer.className = "trick-layer";
  layer.setAttribute("aria-hidden", "true");
  playfieldElement.appendChild(layer);
  return layer;
}

function setSpritePoseFromAnchor(sprite, anchorX, anchorY, rotateDeg = 0, scale = 1) {
  const fallbackAnchor = getTapTapPlayfieldCenterAnchor();
  const safeAnchorX = Number.isFinite(anchorX) ? anchorX : fallbackAnchor.x;
  const safeAnchorY = Number.isFinite(anchorY) ? anchorY : fallbackAnchor.y;
  const cardSize = getCurrentCardRenderSizePx();
  const parsedWidth = Number.parseFloat(sprite.style.width);
  const parsedHeight = Number.parseFloat(sprite.style.height);
  const fallbackWidth = Number.isFinite(cardSize.width) && cardSize.width > 0 ? cardSize.width : 80;
  const fallbackHeight = Number.isFinite(cardSize.height) && cardSize.height > 0 ? cardSize.height : 116;
  const width = sprite.offsetWidth ||
    (Number.isFinite(parsedWidth) && parsedWidth > 0 ? parsedWidth : fallbackWidth);
  const height = sprite.offsetHeight ||
    (Number.isFinite(parsedHeight) && parsedHeight > 0 ? parsedHeight : fallbackHeight);
  sprite.style.left = `${safeAnchorX - (width / 2)}px`;
  sprite.style.top = `${safeAnchorY - (height / 2)}px`;
  sprite.style.transform = `rotate(${rotateDeg}deg) scale(${scale})`;
}

function transitionSpriteToAnchor(
  sprite,
  {
    anchorX,
    anchorY,
    rotateDeg = 0,
    scale = 1,
    durationMs = 180,
    easing = TRICK_FLIGHT_EASING,
    delayMs = 0
  }
) {
  return new Promise((resolve) => {
    const startTransition = () => {
      sprite.style.transition = `left ${durationMs}ms ${easing}, top ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}`;
      window.requestAnimationFrame(() => {
        setSpritePoseFromAnchor(sprite, anchorX, anchorY, rotateDeg, scale);
      });
      window.setTimeout(() => {
        sprite.style.removeProperty("transition");
        resolve();
      }, durationMs + 60);
    };

    if (delayMs > 0) {
      window.setTimeout(startTransition, delayMs);
      return;
    }

    startTransition();
  });
}

function getCardSelectorById(cardId) {
  if (typeof cardId !== "string" || cardId.length === 0) {
    return null;
  }

  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return `.card[data-card-id=\"${CSS.escape(cardId)}\"]`;
  }

  const escapedCardId = cardId.replace(/"/g, "\\\"");
  return `.card[data-card-id=\"${escapedCardId}\"]`;
}

function createTrickSpriteFromHandCard(cardId) {
  const selector = getCardSelectorById(cardId);
  if (!selector) {
    return null;
  }

  const sourceCardElement = cardTable.querySelector(selector);
  if (!(sourceCardElement instanceof HTMLElement)) {
    return null;
  }

  const playfieldElement = getTrickPlayfieldElement();
  if (!(playfieldElement instanceof HTMLElement)) {
    return null;
  }

  const playfieldRect = playfieldElement.getBoundingClientRect();
  const sourceRect = sourceCardElement.getBoundingClientRect();
  const sprite = sourceCardElement.cloneNode(true);
  if (!(sprite instanceof HTMLElement)) {
    return null;
  }

  const sourceCenterX = sourceRect.left + (sourceRect.width / 2);
  const sourceCenterY = sourceRect.top + (sourceRect.height / 2);
  const cardSize = getCurrentCardRenderSizePx();
  const sourceBaseTiltDeg = Number.parseFloat(sourceCardElement.dataset.handThetaDeg ?? "");
  const initialTiltDeg = Number.isFinite(sourceBaseTiltDeg) ? sourceBaseTiltDeg : 0;

  sprite.classList.add("trick-card-sprite", "trick-card-sprite--human");
  sprite.style.width = `${cardSize.width}px`;
  sprite.style.height = `${cardSize.height}px`;
  sprite.style.left = `${sourceCenterX - playfieldRect.left - (cardSize.width / 2)}px`;
  sprite.style.top = `${sourceCenterY - playfieldRect.top - (cardSize.height / 2)}px`;
  sprite.style.transformOrigin = "50% 50%";
  sprite.style.transform = `rotate(${initialTiltDeg}deg)`;
  sprite.style.pointerEvents = "none";
  sourceCardElement.style.visibility = "hidden";
  return {
    sprite,
    sourceCardElement
  };
}

function drawBotTrickCard(seatId, playOrder) {
  const runtimeCards = buildRuntimeDeckCards();
  if (!Array.isArray(runtimeCards) || runtimeCards.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * runtimeCards.length);
  const sourceCard = runtimeCards[randomIndex];
  if (!sourceCard) {
    return null;
  }

  return {
    ...sourceCard,
    cardId: `bot-${seatId}-${Date.now()}-${playOrder}-${Math.random().toString(16).slice(2, 8)}`,
    dealIndex: playOrder
  };
}

function getBotSeatBaseTiltDeg(seatId) {
  if (seatId === "W") {
    return -4;
  }

  if (seatId === "E") {
    return 4;
  }

  return 0;
}

function getPlayTiltDegFromClick(cardElement, clickClientX) {
  if (!(cardElement instanceof HTMLElement) || !Number.isFinite(clickClientX)) {
    return 0;
  }

  const rect = cardElement.getBoundingClientRect();
  if (!(rect.width > 0)) {
    return 0;
  }

  const cardCenterX = rect.left + (rect.width / 2);
  const offsetNorm = Math.max(-1, Math.min(1, (clickClientX - cardCenterX) / (rect.width / 2)));
  const safeNorm = Math.abs(offsetNorm) < 0.12 ? 0 : offsetNorm;
  const playTilt = safeNorm * 8;
  return Math.max(-8, Math.min(8, playTilt));
}

function getNaturalizedTrickTableTiltDeg(baseTiltDeg, jitterRangeDeg = 0) {
  const safeBaseTilt = Number.isFinite(baseTiltDeg) ? baseTiltDeg : 0;
  const safeJitterRange = Number.isFinite(jitterRangeDeg) ? Math.max(0, jitterRangeDeg) : 0;
  const randomJitter = ((Math.random() * 2) - 1) * safeJitterRange;
  const naturalTilt = safeBaseTilt + randomJitter;
  return Math.max(-12, Math.min(12, naturalTilt));
}

function getRankStrengthMapForCurrentPolicy() {
  if (HAND_SORTING_API && typeof HAND_SORTING_API.getRankStrengthMap === "function") {
    try {
      return HAND_SORTING_API.getRankStrengthMap(getHandRankPolicy());
    } catch (_error) {
      // Ignore and fallback.
    }
  }

  return getHandRankPolicy() === "low_high"
    ? { "2": 0, "3": 1, "4": 2, "5": 3, "6": 4, "7": 5, "8": 6, "9": 7, "10": 8, J: 9, Q: 10, K: 11, A: 12 }
    : { A: 0, K: 1, Q: 2, J: 3, "10": 4, "9": 5, "8": 6, "7": 7, "6": 8, "5": 9, "4": 10, "3": 11, "2": 12 };
}

function resolveTrickWinnerPlay(trickPlays) {
  if (!Array.isArray(trickPlays) || trickPlays.length === 0) {
    return null;
  }

  const jokerPlays = trickPlays.filter((play) => play.card?.rank === "JOKER");
  if (jokerPlays.length > 0) {
    return jokerPlays[jokerPlays.length - 1];
  }

  const leadSuit = trickPlays[0]?.card?.suit;
  const suitedPlays = trickPlays.filter((play) => play.card?.suit === leadSuit);
  if (suitedPlays.length === 0) {
    return trickPlays[0];
  }

  const rankStrengthMap = getRankStrengthMapForCurrentPolicy();
  let winner = suitedPlays[0];

  for (let index = 1; index < suitedPlays.length; index += 1) {
    const candidate = suitedPlays[index];
    const winnerStrength = rankStrengthMap[winner.card?.rank];
    const candidateStrength = rankStrengthMap[candidate.card?.rank];

    if (!Number.isFinite(winnerStrength) || !Number.isFinite(candidateStrength)) {
      continue;
    }

    if (candidateStrength < winnerStrength) {
      winner = candidate;
    }
  }

  return winner;
}

function getHandCurvePoints() {
  const metrics = getHandLayoutMetrics(currentCards.length);

  if (!metrics || currentCards.length === 0) {
    return [];
  }

  if (metrics.curveType === "polyline") {
    const anchorPoints = metrics.cardLayouts.map((layout) => ({
      x: layout.screenAnchorX,
      y: layout.screenAnchorY
    }));

    if (anchorPoints.length <= 1) {
      return anchorPoints;
    }

    const points = [];

    for (let index = 0; index < anchorPoints.length - 1; index += 1) {
      const start = anchorPoints[index];
      const end = anchorPoints[index + 1];
      const segmentSamples = 6;

      for (let step = 0; step < segmentSamples; step += 1) {
        const t = step / segmentSamples;
        points.push({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t
        });
      }
    }

    points.push(anchorPoints[anchorPoints.length - 1]);
    return points;
  }

  const sampleCount = Math.max(24, currentCards.length * 8);
  const points = [];

  for (let index = 0; index <= sampleCount; index += 1) {
    const t = index / sampleCount;
    let x = 0;
    let y = 0;

    if (metrics.alphaEffRad > 0 && Number.isFinite(metrics.radius)) {
      const theta = metrics.thetaStart + (metrics.thetaEnd - metrics.thetaStart) * t;
      x = metrics.offsetX + metrics.radius * Math.sin(theta);
      y = metrics.offsetY + metrics.radius - metrics.radius * Math.cos(theta);
    } else {
      const firstCard = metrics.cardLayouts[0];
      const lastCard = metrics.cardLayouts[metrics.cardLayouts.length - 1] ?? firstCard;
      x = firstCard.screenAnchorX + (lastCard.screenAnchorX - firstCard.screenAnchorX) * t;
      y = firstCard.screenAnchorY + (lastCard.screenAnchorY - firstCard.screenAnchorY) * t;
    }

    points.push({ x, y });
  }

  return points;
}

function buildSmoothPathFromPoints(points) {
  if (points.length === 0) {
    return "";
  }

  return points.reduce((path, point, index) => {
    const command = index === 0 ? "M" : "L";
    return `${path}${index === 0 ? "" : " "}${command} ${point.x} ${point.y}`;
  }, "");
}

function updateCardBoundsOverlay() {
  removeCardBoundsOverlay();

  if (!showCardBoundsToggle || !showCardBoundsToggle.checked) {
    return;
  }

  const bounds = getRenderedCardBounds();

  if (!bounds) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "card-bounds-overlay";
  overlay.style.left = `${bounds.left}px`;
  overlay.style.top = `${bounds.top}px`;
  overlay.style.width = `${bounds.width}px`;
  overlay.style.height = `${bounds.height}px`;
  cardTable.appendChild(overlay);
}

function updateHandCurveOverlay() {
  removeHandCurveOverlay();

  if (!showHandCurveToggle || !showHandCurveToggle.checked || getViewMode() !== "hand") {
    return;
  }

  const points = getHandCurvePoints();

  if (points.length < 2) {
    return;
  }

  const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  overlay.classList.add("hand-curve-overlay");
  overlay.setAttribute("viewBox", `0 0 ${cardTable.clientWidth} ${cardTable.clientHeight}`);
  overlay.setAttribute("aria-hidden", "true");
  overlay.setAttribute("focusable", "false");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.classList.add("hand-curve-overlay__path");
  path.setAttribute("d", buildSmoothPathFromPoints(points));

  overlay.appendChild(path);
  cardTable.appendChild(overlay);
}

function updateDebugOverlays() {
  updateSeatMarkersOverlay();
  void updateTapTapCenterPiles();
  updateCardBoundsOverlay();
  updateHandCurveOverlay();
  renderTrickDebugPanel();
  publishHandLayoutDiagnostics();
}

function schedulePostTransitionHandLayoutSync() {
  if (handLayoutSyncTimeoutId !== null) {
    window.clearTimeout(handLayoutSyncTimeoutId);
  }

  handLayoutSyncTimeoutId = window.setTimeout(() => {
    handLayoutSyncTimeoutId = null;

    if (currentCards.length === 0 || getViewMode() !== "hand") {
      return;
    }

    stabilizeHandLayout(currentCards.length);
    syncHandScrollPosition();
    updateDebugOverlays();
  }, VIEW_SWITCH_ANIMATION_MS + 40);
}

async function renderCards(cards, options = {}) {
  const { animate = false, fanAnimation = false } = options;

  // Any re-render interrupts wireframe and running fan animation.
  clearFanAnimation();
  resetCardDragState();
  exitWireframeMode();

  const renderId = renderRequestId + 1;
  renderRequestId = renderId;
  cardTable.innerHTML = "";
  const mode = getRenderMode();
  const viewMode = getViewMode();
  const cardsToRender = getCardsForView(cards, viewMode);
  applyTableLayout(viewMode);
  updateHandModeControls();
  const renderedCards = await Promise.all(
    cardsToRender.map(async (card, index) => {
      const cardElement = await createCardElement(card, mode);
      return { cardElement, index };
    })
  );

  if (renderId !== renderRequestId) {
    return;
  }

  renderedCards.forEach(({ cardElement, index }) => {
    cardTable.appendChild(cardElement);
  });

  if (viewMode === "hand") {
    stabilizeHandLayout(cardsToRender.length);
    syncHandScrollPosition();
    if (fanAnimation || animate) {
      // Fan on: explicit draw/deck-switch (fanAnimation) or matrix→hand switch (animate).
      playFanAnimation(cardsToRender.length);
    } else {
      // Render-mode toggle, card-size change, window resize — keep deferred sync.
      schedulePostTransitionHandLayoutSync();
    }
  } else {
    syncHandViewportHeight();
    if (animate) {
      animateViewSwitch(); // hand→matrix: existing fade-in keyframe
    }
  }
  updateDebugOverlays();
}

function getRequestedCount() {
  const maxCount = getDeckMaxCount();
  const value = Number.parseInt(cardCountInput.value, 10);

  if (Number.isNaN(value)) {
    return null;
  }

  if (value < 1 || value > maxCount) {
    return null;
  }

  return value;
}

function drawFromInput() {
  if (!activeDeck || !Array.isArray(activeDeck.cards) || activeDeck.cards.length === 0) {
    setStatus("No normalized deck is loaded.");
    return Promise.resolve();
  }

  const maxCount = getDeckMaxCount();
  const count = getRequestedCount();

  if (count === null) {
    setStatus(`Enter a number from 1 to ${maxCount}.`);
    return Promise.resolve();
  }

  clearStatus();
  clearManualCardOrder();
  clearManualSuitOrder();
  resetTrickDebugPlayedAnchors();
  renderTrickDebugPanel();
  resetTrickStateForDeal(count);
  if (isTapTapMode()) {
    initializeTapTapStateForDeal(count);
    setStatus("TapTap: your turn. Draw is optional.");
    return renderCards(currentCards, { fanAnimation: true });
  }

  clearTapTapState();
  setTrickPhase(TRICK_PHASE_DEAL_IDLE);
  currentCards = drawCards(count);
  return renderCards(currentCards, { fanAnimation: true });
}

cardCountInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    drawFromInput();
  }
});

let cardCountDrawTimeoutId = null;
cardCountInput.addEventListener("input", () => {
  if (cardCountDrawTimeoutId !== null) {
    window.clearTimeout(cardCountDrawTimeoutId);
  }
  cardCountDrawTimeoutId = window.setTimeout(() => {
    drawFromInput();
    cardCountDrawTimeoutId = null;
  }, 150);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const el = document.activeElement;
  if (el && (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA")) return;
  drawFromInput();
});

cardTable.addEventListener("pointermove", (event) => {
  if (handleSuitDragPointerMove(event)) {
    return;
  }

  if (handleCardDragPointerMove(event)) {
    return;
  }

  refreshHandHoverFromPointerEvent(event);
});

cardTable.addEventListener("pointerdown", (event) => {
  if (beginPendingSuitDrag(event)) {
    return;
  }

  beginPendingCardDrag(event);
});

cardTable.addEventListener("pointerup", (event) => {
  if (handleSuitDragPointerEnd(event, { commit: true })) {
    return;
  }

  if (handleCardDragPointerEnd(event, { commit: true })) {
    return;
  }

  refreshHandHoverFromPointerEvent(event);
});

cardTable.addEventListener("pointercancel", (event) => {
  if (handleSuitDragPointerEnd(event, { commit: false })) {
    return;
  }

  handleCardDragPointerEnd(event, { commit: false });
});

cardTable.addEventListener("pointerleave", () => {
  clearHandHoverState();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cardDragState !== null) {
    event.preventDefault();
    resetCardDragState();
    if (currentCards.length > 0 && getViewMode() === "hand") {
      refreshHandLayoutFromControls();
    }
    return;
  }

  if (!isHoverModifierKey(event)) {
    return;
  }

  refreshHandHoverFromKeyEvent(event);
});

document.addEventListener("keyup", (event) => {
  if (!isHoverModifierKey(event)) {
    return;
  }

  refreshHandHoverFromKeyEvent(event);
});

if (deckSelect) {
  deckSelect.addEventListener("change", async () => {
    const selectedDeckId = deckSelect.value;

    try {
      await selectDeckById(selectedDeckId);
      clearStatus();
      drawFromInput();
    } catch (_error) {
      setStatus("Failed to load selected normalized deck.");
    }
  });
}

if (jokersEnabledToggle) {
  jokersEnabledToggle.addEventListener("change", () => {
    jokersEnabled = jokersEnabledToggle.checked;

    if (jokersEnabled && !findAvailableJokerById(selectedJokerId)) {
      selectedJokerId = getPreferredJokerSelectionId();
      if (selectedJokerId) {
        lastSelectedJokerId = selectedJokerId;
      }
    }

    reconcileJokerSetupState();
    syncJokerSetupControls();
    drawFromInput();
  });
}

if (jokerCountInput) {
  jokerCountInput.addEventListener("input", () => {
    jokerCount = clampJokerCount(jokerCountInput.value);
    reconcileJokerSetupState();
    syncJokerSetupControls();
    drawFromInput();
  });
}

if (jokerDesignSelect) {
  jokerDesignSelect.addEventListener("change", () => {
    const candidateId = jokerDesignSelect.value;
    if (!findAvailableJokerById(candidateId)) {
      return;
    }

    selectedJokerId = candidateId;
    lastSelectedJokerId = candidateId;
    reconcileJokerSetupState();
    syncJokerSetupControls();
    drawFromInput();
  });
}

renderModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (currentCards.length > 0) {
      renderCards(currentCards);
    }
  });
});

viewModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const selectedViewMode = getViewMode();
    setStoredViewMode(selectedViewMode);
    updateHandModeControls();

    if (currentCards.length > 0) {
      renderCards(currentCards, {
        animate: selectedViewMode !== currentViewMode
      });
    }

    currentViewMode = selectedViewMode;
  });
});

handLayoutModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const selectedMode = getHandLayoutMode();
    syncAlphaSliderForMode();
    setStoredHandLayoutMode(selectedMode);
    updateHandModeControls();

    if (currentCards.length > 0 && getViewMode() === "hand") {
      renderCards(currentCards);
    }
  });
});

handDirectionInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const selectedDirection = getHandDirection();
    setStoredHandDirection(selectedDirection);
    updateHandModeControls();

    if (currentCards.length > 0 && getViewMode() === "hand") {
      refreshHandLayoutFromControls();
    }
  });
});

handSortPresetInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const selectedPreset = getSelectedHandSortPreset();
    applyHandSortPresetToLegacy(selectedPreset);
    updateHandModeControls();

    if (currentCards.length > 0 && getViewMode() === "hand") {
      renderCards(currentCards);
    }
  });
});

if (rankSortEnabledToggle) {
  rankSortEnabledToggle.addEventListener("change", () => {
    enforceHandSortControlCoercion();
    syncHandSortPresetControlsFromLegacy();
    updateHandModeControls();

    if (currentCards.length > 0 && getViewMode() === "hand") {
      renderCards(currentCards);
    }
  });
}

if (handSuitSortModeSelect) {
  handSuitSortModeSelect.addEventListener("change", () => {
    enforceHandSortControlCoercion();
    syncHandSortPresetControlsFromLegacy();
    updateHandModeControls();

    if (currentCards.length > 0 && getViewMode() === "hand") {
      renderCards(currentCards);
    }
  });
}

if (handRankPolicySelect) {
  handRankPolicySelect.addEventListener("change", () => {
    updateHandModeControls();

    if (currentCards.length > 0 && getViewMode() === "hand" && isRankSortEnabled()) {
      renderCards(currentCards);
    }
  });
}

[
  visibilityFactorSlider,
  alphaDegSlider,
  phiDegSlider,
  demoOuterDropSlider
].forEach((slider) => {
  if (!slider) {
    return;
  }

  slider.addEventListener("input", () => {
    if (slider === alphaDegSlider) {
      storeCurrentAlphaValueForMode();
    }
    updateHandGeometryValueLabels();
    refreshHandLayoutFromControls();
  });

  slider.addEventListener("pointerdown", () => {
    if (isFanAnimationEnabled() && getViewMode() === "hand" && currentCards.length > 0) {
      enterWireframeMode();
    }
  });

  slider.addEventListener("pointerup", () => {
    if (isWireframeMode) {
      exitWireframeMode();
      playFanAnimation(currentCards.length);
    }
  });
});

if (handDepthShadowStrengthSlider) {
  handDepthShadowStrengthSlider.addEventListener("input", () => {
    setStoredHandDepthShadowStrengthPct(getHandDepthShadowStrengthPct());
    updateHandGeometryValueLabels();
    refreshHandLayoutFromControls();
  });
}

[
  { slider: fanDurationSlider, valueEl: fanDurationSliderValue, decimals: 1 },
  { slider: fanStepMsSlider, valueEl: fanStepMsSliderValue, decimals: 0 }
].forEach(({ slider, valueEl, decimals }) => {
  if (!slider) return;
  slider.addEventListener("input", () => {
    if (valueEl) valueEl.textContent = parseFloat(slider.value).toFixed(decimals);
  });
  slider.addEventListener("pointerup", () => {
    if (currentCards.length > 0 && getViewMode() === "hand" && isFanAnimationEnabled()) {
      playFanAnimation(currentCards.length);
    }
  });
});

if (fanAnimateToggle) {
  fanAnimateToggle.addEventListener("change", () => {
    updateFanControlsState();
    if (!isFanAnimationEnabled()) {
      clearFanAnimation();
      exitWireframeMode();
    }
  });
}

if (trickAnimationSpeedSelect) {
  trickAnimationSpeedSelect.addEventListener("change", () => {
    setTrickAnimationSpeedPreset(trickAnimationSpeedSelect.value);
  });
}

if (trickBotAnimationModeSelect) {
  trickBotAnimationModeSelect.addEventListener("change", () => {
    setTrickBotAnimationMode(trickBotAnimationModeSelect.value);
  });
}

if (playMechanicModeSelect) {
  playMechanicModeSelect.addEventListener("change", () => {
    setPlayMechanicMode(playMechanicModeSelect.value);
    updateHandModeControls();
    drawFromInput();
  });
}

if (tapTapTurnDirectionSelect) {
  tapTapTurnDirectionSelect.addEventListener("change", () => {
    setTapTapTurnDirection(tapTapTurnDirectionSelect.value);
    updateHandModeControls();

    if (isTapTapMode() && tapTapStateActive) {
      stopTapTapBotLoop();
      syncTapTapTurnLock();
      updateDebugOverlays();
      if (tapTapTurnSeatId !== "S") {
        void runTapTapBotTurns();
      }
    }
  });
}

if (tapTapLogDownloadButton) {
  tapTapLogDownloadButton.addEventListener("click", () => {
    const downloadFn = window.__CTP_DOWNLOAD_TAPTAP_ACTION_LOG__;
    if (typeof downloadFn !== "function" || !downloadFn()) {
      setStatus("TapTap: no log available to download yet.");
      return;
    }

    setStatus(`TapTap: downloaded ${TAPTAP_ACTION_LOG_FILENAME}.`);
  });
}

if (advancedControlsToggleButton) {
  advancedControlsToggleButton.addEventListener("click", () => {
    toggleAdvancedControlsPanel();
  });
}

if (advancedControlsCloseButton) {
  advancedControlsCloseButton.addEventListener("click", () => {
    setAdvancedControlsPanelOpen(false);
    advancedControlsToggleButton?.focus();
  });
}

document.addEventListener("mousedown", handleDocumentPointerDownForAdvancedControls);
document.addEventListener("keydown", handleDocumentEscapeForAdvancedControls);

function handleHandWheelResize(event) {
  if (getViewMode() !== "hand" || currentCards.length === 0) {
    return;
  }

  if (isTrickInteractionLocked()) {
    return;
  }

  if (isCardDragActive() || isSuitDragActive()) {
    return;
  }

  const hoveredCardElement = getHandCardElementFromTarget(event.target);
  if (!hoveredCardElement) {
    return;
  }

  event.preventDefault();

  const direction = event.deltaY < 0 ? 1 : -1;
  const currentCardHeight = getCardSizePx();
  const nextCardHeight = clampCardHeightPx(currentCardHeight + (direction * CARD_HEIGHT_WHEEL_STEP_PX));

  if (nextCardHeight === currentCardHeight) {
    return;
  }

  applyCardHeightSetting(nextCardHeight);
}

const trickPlayfieldElementForDebug = getTrickPlayfieldElement();
if (trickPlayfieldElementForDebug) {
  trickPlayfieldElementForDebug.addEventListener("pointermove", (event) => {
    setTrickDebugMouseFromEvent(event);
    renderTrickDebugPanel();
  });

  trickPlayfieldElementForDebug.addEventListener("pointerleave", () => {
    clearTrickDebugMousePosition();
    renderTrickDebugPanel();
  });
}

if (cardSizeSlider) {
  cardSizeSlider.addEventListener("input", () => {
    applyCardHeightSetting(cardSizeSlider.value);
  });
}

if (tableViewport) {
  tableViewport.addEventListener("wheel", handleHandWheelResize, { passive: false });
}

if (showCardBoundsToggle) {
  showCardBoundsToggle.addEventListener("change", () => {
    updateDebugOverlays();
  });
}

if (showHandCurveToggle) {
  showHandCurveToggle.addEventListener("change", () => {
    updateDebugOverlays();
  });
}

if (handDepthShadowToggle) {
  handDepthShadowToggle.addEventListener("change", () => {
    setStoredHandDepthShadowEnabled(handDepthShadowToggle.checked);
    applyHandDepthShadowState();
    updateHandModeControls();
  });
}

window.addEventListener("resize", () => {
  if (currentCards.length === 0) {
    syncHandViewportHeight();
    return;
  }

  if (resizeRenderTimeoutId !== null) {
    window.clearTimeout(resizeRenderTimeoutId);
  }

  resizeRenderTimeoutId = window.setTimeout(() => {
    renderCards(currentCards);
    resizeRenderTimeoutId = null;
  }, 120);
});

async function initializeApp() {
  setAdvancedControlsPanelOpen(false);
  initializeCardTransitionRenderMode();
  initializeViewMode();
  initializeHandLayoutMode();
  initializeCardSizeControl();
  initializeHandDirection();
  initializeHandSortingControls();
  initializeJokerSetupState();
  initializePlayMechanicControls();
  initializeTrickAnimationSpeedControl();
  initializeHandDepthShadowToggle();
  initializeHandDepthShadowStrengthSlider();
  initializeHandDepthShadowDirectionClock();
  syncJokerSetupControls();
  applyCardSizeCssVariables();
  syncAlphaSliderForMode(true);
  updateHandGeometryValueLabels();
  updateHandModeControls();
  await initializeDecks();
  await applyUrlDrivenTestConfig();
  applyCardSizeCssVariables();
  updateHandGeometryValueLabels();
  await drawFromInput();
  await runTestScenario();
}

initializeApp();
