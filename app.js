const cardTable = document.getElementById("card-table");
const tableSection = document.querySelector(".table");
const tableViewport = document.querySelector(".table-viewport");
const tableScroll = document.querySelector(".table-scroll");
const cardCountInput = document.getElementById("card-count");
const cardCountLabel = document.getElementById("card-count-label");
const deckSelect = document.getElementById("deck-select");
const drawButton = document.getElementById("draw-button");
const statusMessage = document.getElementById("status");
const renderModeInputs = document.querySelectorAll(
  "input[name=\"render-mode\"]"
);
const viewModeInputs = document.querySelectorAll("input[name=\"view-mode\"]");
const handLayoutModeInputs = document.querySelectorAll("input[name=\"hand-layout-mode\"]");
const handLayoutControls = document.querySelectorAll(".hand-layout-control");
const cardSizeBox = document.getElementById("card-size-box");
const handSortEnabledToggle = document.getElementById("hand-sort-enabled");
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
const fanDurationSlider = document.getElementById("fan-duration-sec");
const fanDurationSliderValue = document.getElementById("fan-duration-sec-value");
const fanStepMsSlider = document.getElementById("fan-step-ms");
const fanStepMsSliderValue = document.getElementById("fan-step-ms-value");
const fanAnimateToggle = document.getElementById("fan-animate-toggle");

let currentCards = [];
let currentViewMode = "hand";
let availableDecks = [];
let activeDeck = null;
const VIEW_STORAGE_KEY = "ctp:view-mode";
const HAND_LAYOUT_MODE_STORAGE_KEY = "ctp:hand-layout-mode";
const HAND_DEPTH_SHADOW_STORAGE_KEY = "ctp:hand-depth-shadow";
const DECK_INDEX_PATH = "assets/decks/decks.index.json";
const DEFAULT_DECK_ID = "standard54-english";
const HAND_SORTING_API = globalThis.__CTP_HAND_SORTING__ ?? null;
const PRELOADED_DECK_INDEX = globalThis.__CTP_DECK_INDEX__;
const PRELOADED_DECK_MANIFESTS = globalThis.__CTP_DECK_MANIFESTS__;
const PRELOADED_SVG_MARKUP = globalThis.__CTP_DECK_SVG__;
const VIEW_SWITCH_ANIMATION_MS = 240;
const HAND_BASE_PADDING_TOP = 18;
const HAND_BASE_PADDING_BOTTOM = 34;
const HAND_PADDING_SAFETY = 2;
const HAND_BASE_CANVAS_HEIGHT = 230;
let viewSwitchTimeoutId = null;
let resizeRenderTimeoutId = null;
let handLayoutSyncTimeoutId = null;
let fanAnimationTimeoutId = null;
let renderRequestId = 0;
let isWireframeMode = false;
let fanCardTimeoutIds = [];
const svgMarkupCache = new Map();
const STANDARD_SUIT_CONFIG = [
  { suit: "spades", symbol: "♠︎" },
  { suit: "hearts", symbol: "♥︎" },
  { suit: "diamonds", symbol: "♦︎" },
  { suit: "clubs", symbol: "♣︎" }
];
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
const BASE_CARD_HEIGHT_PX = 130;
const IDEAL_CARD_HEIGHT_PX = Math.round(BASE_CARD_HEIGHT_PX / 0.7);
const MIN_CARD_HEIGHT_PX = 90;
const MAX_CARD_HEIGHT_PX = IDEAL_CARD_HEIGHT_PX * 2;
const DEFAULT_HAND_LAYOUT_MODE = "classic";
const DEFAULT_HAND_SORT_ENABLED = true;
const DEFAULT_HAND_RANK_POLICY = "high_low";
const DEFAULT_VISIBILITY_FACTOR = 0.5;
const DEFAULT_ALPHA_DEG = 4;
const DEFAULT_PHI_DEG = 40;
const DEMO_MIN_ALPHA_DEG = 0.3;
const DEMO_MAX_ALPHA_DEG = 2.0;
const DEFAULT_DEMO_ALPHA_DEG = 0.8;
const DEFAULT_DEMO_OUTER_DROP_PCT = 2.0;
const DEFAULT_HAND_DEPTH_SHADOW_ENABLED = true;
const DEFAULT_FAN_DURATION_SEC = 1.0;
const MIN_FAN_DURATION_SEC = 0.5;
const MAX_FAN_DURATION_SEC = 2.0;
const DEFAULT_FAN_STEP_MS = 50;
const MIN_FAN_STEP_MS = 10;
const MAX_FAN_STEP_MS = 100;
const URL_PARAMS = new URLSearchParams(window.location.search);
const TEST_MODE = URL_PARAMS.get("test") === "1";
const TEST_SCENARIO = URL_PARAMS.get("scenario") ?? "";
const testScenarioHistory = [];
let classicAlphaDegValue = DEFAULT_ALPHA_DEG;
let demoAlphaDegValue = DEFAULT_DEMO_ALPHA_DEG;

function getDeckMaxCount() {
  return activeDeck && Array.isArray(activeDeck.cards) && activeDeck.cards.length > 0
    ? activeDeck.cards.length
    : 52;
}

function updateCardCountRangeLabel() {
  const maxCount = getDeckMaxCount();

  if (cardCountLabel) {
    cardCountLabel.textContent = `Number of cards (1-${maxCount})`;
  }

  cardCountInput.max = `${maxCount}`;
  const currentValue = Number.parseInt(cardCountInput.value, 10);

  if (!Number.isFinite(currentValue) || currentValue < 1) {
    cardCountInput.value = `${Math.min(7, maxCount)}`;
    return;
  }

  if (currentValue > maxCount) {
    cardCountInput.value = `${maxCount}`;
  }
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
    cards: normalizedCards
  };
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
}

async function selectDeckById(deckId) {
  const selected = availableDecks.find((deckEntry) => deckEntry.deckId === deckId);

  if (!selected || selected.status !== "valid" || typeof selected.manifestPath !== "string") {
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
    const selectable = deckEntry.status === "valid" && typeof deckEntry.manifestPath === "string";
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
    populateDeckSelect();

    const firstValidDeck = availableDecks.find(
      (deckEntry) => deckEntry.status === "valid" && typeof deckEntry.manifestPath === "string"
    );
    if (!firstValidDeck) {
      throw new Error("No valid normalized decks available.");
    }

    const preferredDeck =
      availableDecks.find(
        (deckEntry) =>
          deckEntry.deckId === DEFAULT_DECK_ID &&
          deckEntry.status === "valid" &&
          typeof deckEntry.manifestPath === "string"
      ) ?? firstValidDeck;

    if (deckSelect) {
      deckSelect.value = preferredDeck.deckId;
      deckSelect.disabled = false;
    }

    await selectDeckById(preferredDeck.deckId);
    drawButton.disabled = false;
    clearStatus();
  } catch (_error) {
    availableDecks = [];
    populateDeckSelect();
    setActiveDeck(null);
    drawButton.disabled = true;
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

function drawCards(count) {
  const deck = activeDeck && Array.isArray(activeDeck.cards) ? activeDeck.cards : [];
  const shuffled = shuffleDeck(deck);
  return shuffled.slice(0, count);
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
  cardElement.dataset.suit = card.suit;

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
  try {
    const storedMode = sessionStorage.getItem(HAND_LAYOUT_MODE_STORAGE_KEY);
    return isSupportedHandLayoutMode(storedMode) ? storedMode : DEFAULT_HAND_LAYOUT_MODE;
  } catch (_error) {
    return DEFAULT_HAND_LAYOUT_MODE;
  }
}

function setStoredHandLayoutMode(mode) {
  if (!isSupportedHandLayoutMode(mode)) {
    return;
  }

  try {
    sessionStorage.setItem(HAND_LAYOUT_MODE_STORAGE_KEY, mode);
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

function initializeHandDepthShadowToggle() {
  if (!handDepthShadowToggle) {
    return;
  }

  handDepthShadowToggle.checked = getStoredHandDepthShadowEnabled();
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

function isSupportedHandRankPolicy(value) {
  return value === "high_low" || value === "low_high";
}

function isHandSortEnabled() {
  return HAND_SORTING_API !== null &&
    (
      handSortEnabledToggle
        ? handSortEnabledToggle.checked
        : DEFAULT_HAND_SORT_ENABLED
    );
}

function getHandRankPolicy() {
  if (!handRankPolicySelect || !isSupportedHandRankPolicy(handRankPolicySelect.value)) {
    return DEFAULT_HAND_RANK_POLICY;
  }

  return handRankPolicySelect.value;
}

function getCardsForView(cards, viewMode) {
  if (viewMode !== "hand" || !isHandSortEnabled()) {
    return cards;
  }

  try {
    return HAND_SORTING_API.sortHandCards(cards, {
      rankPolicy: getHandRankPolicy()
    }).sortedCards;
  } catch (_error) {
    return cards;
  }
}

function isHandDepthShadowEnabled() {
  return handDepthShadowToggle
    ? handDepthShadowToggle.checked
    : DEFAULT_HAND_DEPTH_SHADOW_ENABLED;
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
      IDEAL_CARD_HEIGHT_PX,
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

function updateHandModeControls() {
  const viewMode = getViewMode();
  const isHandView = viewMode === "hand";
  const handLayoutMode = getHandLayoutMode();

  syncAlphaSliderForMode();

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

  if (handSortEnabledToggle) {
    handSortEnabledToggle.disabled = !isHandView || HAND_SORTING_API === null;
  }

  if (handRankPolicySelect) {
    handRankPolicySelect.disabled = !isHandView || HAND_SORTING_API === null || !isHandSortEnabled();
  }

  if (handDepthShadowToggle) {
    handDepthShadowToggle.disabled = !isHandView;
  }

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

function getHandLayoutMetrics(total) {
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
  const alphaDeg = getAlphaDeg();
  const phiDeg = getPhiDeg();
  const demoOuterDropPct = getDemoOuterDropPct();
  const alphaRad = degToRad(alphaDeg);
  const phiRad = degToRad(phiDeg);
  const stepCount = Math.max(0, total - 1);
  const centerIndex = (total - 1) / 2;

  const buildLayouts = (vf) => {
    if (handLayoutMode === "demo") {
      return buildDemoHandLayouts({
        total,
        cardWidth,
        cardHeight,
        visibilityFactor: vf,
        alphaDeg,
        demoOuterDropPct
      });
    }

    return buildClassicHandLayouts({
      total,
      cardWidth,
      cardHeight,
      visibilityFactor: vf,
      alphaRad,
      phiRad
    });
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
  const offsetY = paddingTop - rawBounds.top;
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

  return {
    handLayoutMode,
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
    cardLayouts: positionedCards
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
  const cardElements = Array.from(cardTable.querySelectorAll(".card"));
  const metrics = getHandLayoutMetrics(total);

  if (cardElements.length === 0 || !metrics) {
    return;
  }

  cardTable.style.width = `${Math.ceil(metrics.tableWidth)}px`;
  cardTable.style.minWidth = `${Math.ceil(metrics.tableWidth)}px`;

  cardElements.forEach((cardElement, index) => {
    const cardLayout = metrics.cardLayouts[index];
    const shadowDepth = metrics.cardLayouts.length <= 1
      ? 1
      : index / (metrics.cardLayouts.length - 1);
    const shadowOpacity = 0.09 + shadowDepth * 0.11;
    const shadowBlur = 8 + shadowDepth * 10;
    const shadowShiftY = shadowDepth * 3;

    cardElement.style.left = `${Math.round(cardLayout.left)}px`;
    cardElement.style.top = `${Math.round(cardLayout.top)}px`;
    cardElement.style.transformOrigin = "50% 100%";
    cardElement.style.transform = `rotate(${cardLayout.thetaDeg}deg)`;
    cardElement.style.zIndex = `${index + 1}`;
    cardElement.style.setProperty("--hand-shadow-opacity", shadowOpacity.toFixed(3));
    cardElement.style.setProperty("--hand-shadow-blur", `${shadowBlur.toFixed(1)}px`);
    cardElement.style.setProperty("--hand-shadow-shift-y", `${shadowShiftY.toFixed(1)}px`);
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
    cardCount: currentCards.length,
    viewMode: getViewMode(),
    handLayoutMode: getHandLayoutMode(),
    handSortEnabled: isHandSortEnabled(),
    handRankPolicy: getHandRankPolicy(),
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

  const metrics = getHandLayoutMetrics(currentCards.length);

  if (!metrics) {
    return false;
  }

  const nextPaddingTop = HAND_BASE_PADDING_TOP;
  const nextPaddingBottom = HAND_BASE_PADDING_BOTTOM;
  const requiredCanvasHeight = Math.max(
    HAND_BASE_CANVAS_HEIGHT,
    Math.ceil(metrics.contentHeight + HAND_PADDING_SAFETY)
  );
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

function syncHandViewportHeight() {
  if (!tableViewport || !tableScroll) {
    return false;
  }

  if (getViewMode() !== "hand") {
    const changed =
      tableViewport.style.getPropertyValue("height") !== "" ||
      tableViewport.style.getPropertyValue("min-height") !== "" ||
      tableScroll.style.getPropertyValue("height") !== "" ||
      tableScroll.style.getPropertyValue("min-height") !== "";
    tableViewport.style.removeProperty("height");
    tableViewport.style.removeProperty("min-height");
    tableScroll.style.removeProperty("height");
    tableScroll.style.removeProperty("min-height");
    return changed;
  }

  const bounds = getRenderedCardBounds();
  const metrics = getHandLayoutMetrics(currentCards.length);
  const geometryHeight = metrics
    ? metrics.paddingTop + metrics.contentHeight + metrics.paddingBottom
    : 0;
  const targetHeight = Math.max(
    cardTable.clientHeight,
    bounds ? Math.ceil(bounds.bottom - Math.min(0, bounds.top) + HAND_PADDING_SAFETY) : 0,
    Math.ceil(geometryHeight + HAND_PADDING_SAFETY)
  );

  if (targetHeight <= 0) {
    return false;
  }

  const targetHeightValue = `${targetHeight}px`;
  const changed =
    tableViewport.style.height !== targetHeightValue ||
    tableViewport.style.minHeight !== targetHeightValue ||
    tableScroll.style.height !== targetHeightValue ||
    tableScroll.style.minHeight !== targetHeightValue;
  tableViewport.style.height = targetHeightValue;
  tableViewport.style.minHeight = targetHeightValue;
  tableScroll.style.height = targetHeightValue;
  tableScroll.style.minHeight = targetHeightValue;
  return changed;
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
  updateCardBoundsOverlay();
  updateHandCurveOverlay();
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
  currentCards = drawCards(count);
  return renderCards(currentCards, { fanAnimation: true });
}

drawButton.addEventListener("click", drawFromInput);
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

if (handSortEnabledToggle) {
  handSortEnabledToggle.addEventListener("change", () => {
    updateHandModeControls();

    if (currentCards.length > 0 && getViewMode() === "hand") {
      renderCards(currentCards);
    }
  });
}

if (handRankPolicySelect) {
  handRankPolicySelect.addEventListener("change", () => {
    updateHandModeControls();

    if (currentCards.length > 0 && getViewMode() === "hand" && isHandSortEnabled()) {
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

if (cardSizeSlider) {
  cardSizeSlider.addEventListener("input", () => {
    applyCardSizeCssVariables();
    updateHandGeometryValueLabels();

    if (currentCards.length > 0) {
      renderCards(currentCards);
    }
  });
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
  });
}

window.addEventListener("resize", () => {
  if (currentCards.length === 0) {
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
  initializeViewMode();
  initializeHandLayoutMode();
  initializeHandDepthShadowToggle();
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
