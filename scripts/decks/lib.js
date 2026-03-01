const fs = require("fs");
const path = require("path");
const {
  parseAttributeTokens,
  parseNumericLength,
  parseViewBox,
  analyzeSvgGeometry,
  boundaryTagFromTokenIndex,
  analysisPath
} = require("./geometry");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DECKS_ROOT = path.join(REPO_ROOT, "assets", "decks");
const DEFAULT_ANALYSIS_ROOT = path.join(REPO_ROOT, "analysis");

const STANDARD_SUITS = ["spades", "hearts", "diamonds", "clubs"];
const STANDARD_RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
const SEMVER_RE =
  /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

const SVG_ALLOWED_ELEMENTS = new Set([
  "svg",
  "g",
  "defs",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "path",
  "text",
  "tspan",
  "title",
  "desc",
  "metadata",
  "rdf",
  "work",
  "format",
  "type",
  "clippath",
  "mask",
  "lineargradient",
  "radialgradient",
  "stop",
  "symbol",
  "use",
  "pattern",
  "path-effect"
]);

const SVG_ALLOWED_ATTRIBUTES = new Set([
  "id",
  "class",
  "style",
  "version",
  "viewbox",
  "preserveaspectratio",
  "transform",
  "opacity",
  "fill",
  "fill-rule",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-linejoin",
  "stroke-linecap",
  "stroke-miterlimit",
  "stroke-opacity",
  "d",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "width",
  "height",
  "points",
  "font-family",
  "font-size",
  "font-weight",
  "text-anchor",
  "dominant-baseline",
  "about",
  "resource",
  "effect",
  "href",
  "offset",
  "stop-color",
  "stop-opacity",
  "gradientunits",
  "gradienttransform",
  "xlink:href",
  "xml:space",
  "data-card-boundary",
  "data-ctp-normalized"
]);

const SVG_FORBIDDEN_ELEMENTS_RE =
  /<\s*\/?\s*(script|foreignObject|iframe|object|embed|audio|video|canvas|link|style)\b/i;
const SVG_FORBIDDEN_PROTOCOL_RE = /(javascript:|data:\s*text\/html|vbscript:)/i;
const SVG_FORBIDDEN_DOCTYPE_RE = /<!DOCTYPE/i;

function localName(name) {
  return name.includes(":") ? name.split(":").pop() : name;
}

function stripQuotes(value) {
  if (!value) {
    return "";
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function getDeckFolderName(deckDir) {
  return path.basename(deckDir);
}

function discoverDeckManifestPaths() {
  if (!fs.existsSync(DECKS_ROOT)) {
    return [];
  }

  return fs
    .readdirSync(DECKS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(DECKS_ROOT, entry.name, "deck.json"))
    .filter((manifestPath) => fs.existsSync(manifestPath));
}

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function writeJsonFile(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

function validateStandard52Coverage(deckManifest, errors) {
  const cards = Array.isArray(deckManifest.cards) ? deckManifest.cards : [];
  const expectedPairs = new Set();
  const seenPairs = new Set();
  const seenCardIds = new Set();

  STANDARD_SUITS.forEach((suit) => {
    STANDARD_RANKS.forEach((rank) => {
      expectedPairs.add(`${rank}|${suit}`);
    });
  });

  let jokerCount = 0;

  cards.forEach((card, index) => {
    if (!card || typeof card !== "object") {
      errors.push(`cards[${index}] must be an object.`);
      return;
    }

    const { cardId, rank, suit } = card;

    if (typeof cardId !== "string" || cardId.trim().length === 0) {
      errors.push(`cards[${index}].cardId must be a non-empty string.`);
    } else if (seenCardIds.has(cardId)) {
      errors.push(`Duplicate cardId: ${cardId}.`);
    } else {
      seenCardIds.add(cardId);
    }

    if (rank === "JOKER") {
      jokerCount += 1;
      if (suit !== null) {
        errors.push(`cards[${index}] joker cards must use suit: null.`);
      }
      return;
    }

    if (!STANDARD_RANKS.includes(rank)) {
      errors.push(`cards[${index}] has unsupported rank: ${rank}.`);
      return;
    }

    if (!STANDARD_SUITS.includes(suit)) {
      errors.push(`cards[${index}] has unsupported suit: ${suit}.`);
      return;
    }

    const key = `${rank}|${suit}`;
    if (seenPairs.has(key)) {
      errors.push(`Duplicate standard card coverage entry: ${rank} of ${suit}.`);
      return;
    }

    seenPairs.add(key);
  });

  expectedPairs.forEach((pair) => {
    if (!seenPairs.has(pair)) {
      const [rank, suit] = pair.split("|");
      errors.push(`Missing required standard52 card: ${rank} of ${suit}.`);
    }
  });

  const configuredJokers = Number.isInteger(deckManifest.model?.jokers)
    ? deckManifest.model.jokers
    : 0;

  if (jokerCount !== configuredJokers) {
    errors.push(
      `Configured jokers (${configuredJokers}) does not match joker card entries (${jokerCount}).`
    );
  }
}

function validateDeckManifest(deckManifest, deckDir) {
  const errors = [];
  const warnings = [];

  if (!deckManifest || typeof deckManifest !== "object") {
    errors.push("deck.json root must be an object.");
    return { errors, warnings };
  }

  if (deckManifest.manifestVersion !== 1) {
    errors.push("manifestVersion must be exactly 1.");
  }

  if (typeof deckManifest.deckId !== "string" || !/^[a-z0-9][a-z0-9-]{1,63}$/.test(deckManifest.deckId)) {
    errors.push("deckId must match ^[a-z0-9][a-z0-9-]{1,63}$.");
  }

  if (typeof deckManifest.deckVersion !== "string" || !SEMVER_RE.test(deckManifest.deckVersion)) {
    errors.push("deckVersion must be a valid semver string.");
  }

  if (typeof deckManifest.title !== "string" || deckManifest.title.trim().length === 0) {
    errors.push("title must be a non-empty string.");
  }

  if (!deckManifest.model || typeof deckManifest.model !== "object") {
    errors.push("model must be an object.");
  } else {
    if (typeof deckManifest.model.kind !== "string" || deckManifest.model.kind.length === 0) {
      errors.push("model.kind must be a non-empty string.");
    }

    if (
      deckManifest.model.jokers !== undefined &&
      ![0, 1, 2].includes(deckManifest.model.jokers)
    ) {
      errors.push("model.jokers must be 0, 1, or 2 when provided.");
    }
  }

  if (!Array.isArray(deckManifest.cards) || deckManifest.cards.length === 0) {
    errors.push("cards must be a non-empty array.");
  }

  if (deckManifest.locale && typeof deckManifest.locale !== "object") {
    errors.push("locale must be an object when provided.");
  }

  if (!deckManifest.locale || typeof deckManifest.locale.code !== "string") {
    warnings.push("locale.code is missing; runtime will fall back to default labels.");
  }

  if (
    deckManifest.model &&
    deckManifest.model.kind === "standard52" &&
    Array.isArray(deckManifest.cards)
  ) {
    validateStandard52Coverage(deckManifest, errors);
  }

  if (Array.isArray(deckManifest.cards)) {
    deckManifest.cards.forEach((card, index) => {
      if (!card || typeof card !== "object") {
        return;
      }

      if (typeof card.asset !== "string" || card.asset.trim().length === 0) {
        errors.push(`cards[${index}].asset must be a non-empty string.`);
        return;
      }

      if (!card.asset.toLowerCase().endsWith(".svg")) {
        errors.push(`cards[${index}].asset must point to an .svg file.`);
      }

      if (path.isAbsolute(card.asset) || card.asset.includes("..")) {
        errors.push(`cards[${index}].asset must be a relative in-deck path without '..'.`);
        return;
      }

      const resolvedAssetPath = path.resolve(deckDir, card.asset);
      if (!resolvedAssetPath.startsWith(deckDir)) {
        errors.push(`cards[${index}].asset resolves outside deck directory.`);
        return;
      }

      if (!fs.existsSync(resolvedAssetPath)) {
        errors.push(`cards[${index}] missing asset file: ${card.asset}`);
      }
    });
  }

  return { errors, warnings };
}

function validateSvgContent(svgText, displayPath) {
  const errors = [];

  if (typeof svgText !== "string" || svgText.trim().length === 0) {
    errors.push(`${displayPath}: SVG is empty.`);
    return errors;
  }

  if (SVG_FORBIDDEN_DOCTYPE_RE.test(svgText)) {
    errors.push(`${displayPath}: DOCTYPE declarations are forbidden.`);
  }

  if (SVG_FORBIDDEN_ELEMENTS_RE.test(svgText)) {
    errors.push(`${displayPath}: contains forbidden element (script/foreignObject/etc).`);
  }

  if (SVG_FORBIDDEN_PROTOCOL_RE.test(svgText)) {
    errors.push(`${displayPath}: contains forbidden protocol (javascript:/data:text/html/vbscript:).`);
  }

  const tagRe = /<\s*(\/?)\s*([A-Za-z_:][\w:.-]*)([^>]*)>/g;
  let match = tagRe.exec(svgText);

  while (match) {
    const isClosing = match[1] === "/";
    const rawTagName = match[2];

    if (rawTagName.startsWith("?") || rawTagName.startsWith("!")) {
      match = tagRe.exec(svgText);
      continue;
    }

    const tagName = localName(rawTagName).toLowerCase();
    if (!SVG_ALLOWED_ELEMENTS.has(tagName)) {
      errors.push(`${displayPath}: element <${rawTagName}> is not allowlisted.`);
      match = tagRe.exec(svgText);
      continue;
    }

    if (isClosing) {
      match = tagRe.exec(svgText);
      continue;
    }

    const attributes = parseAttributeTokens(match[3] ?? "");
    attributes.forEach((attribute) => {
      const rawAttrName = attribute.rawName;
      const rawAttrNameLower = rawAttrName.toLowerCase();
      const localAttrNameLower = localName(rawAttrNameLower);

      if (rawAttrNameLower.startsWith("on")) {
        errors.push(`${displayPath}: event handler attribute is forbidden (${rawAttrName}).`);
        return;
      }

      const isXmlNamespace =
        rawAttrNameLower === "xmlns" || rawAttrNameLower.startsWith("xmlns:");

      if (!isXmlNamespace) {
        const rawAllowed = SVG_ALLOWED_ATTRIBUTES.has(rawAttrNameLower);
        const localAllowed = SVG_ALLOWED_ATTRIBUTES.has(localAttrNameLower);

        if (!rawAllowed && !localAllowed) {
          errors.push(`${displayPath}: attribute ${rawAttrName} is not allowlisted.`);
          return;
        }
      }

      const value = stripQuotes(attribute.value).trim();

      if (SVG_FORBIDDEN_PROTOCOL_RE.test(value)) {
        errors.push(`${displayPath}: attribute ${rawAttrName} has forbidden protocol.`);
        return;
      }

      if (localAttrNameLower === "href") {
        if (!(value.startsWith("#") || value.length === 0)) {
          errors.push(
            `${displayPath}: href/xlink:href must be an internal fragment reference (#{id}).`
          );
          return;
        }
      }

      const urlRefRe = /url\(([^)]+)\)/gi;
      let urlMatch = urlRefRe.exec(value);
      while (urlMatch) {
        const normalizedUrlRef = stripQuotes(urlMatch[1].trim());
        if (!normalizedUrlRef.startsWith("#")) {
          errors.push(`${displayPath}: url(...) references must be internal fragment ids.`);
          break;
        }
        urlMatch = urlRefRe.exec(value);
      }
    });

    match = tagRe.exec(svgText);
  }

  if (!/<\s*svg\b/i.test(svgText)) {
    errors.push(`${displayPath}: root <svg> element is missing.`);
  }

  return errors;
}

function sanitizeSvgText(svgText) {
  let sanitized = svgText;

  sanitized = sanitized.replace(/<!DOCTYPE[^>]*>/gi, "");
  sanitized = sanitized.replace(/<\s*script\b[\s\S]*?<\s*\/\s*script\s*>/gi, "");
  sanitized = sanitized.replace(/<\s*foreignObject\b[\s\S]*?<\s*\/\s*foreignObject\s*>/gi, "");
  sanitized = sanitized.replace(/<\s*(iframe|object|embed|audio|video|canvas|link|style)\b[^>]*>.*?<\s*\/\s*\1\s*>/gi, "");
  sanitized = sanitized.replace(/<\s*(iframe|object|embed|audio|video|canvas|link|style)\b[^>]*\/\s*>/gi, "");

  sanitized = sanitized.replace(/\s+on[a-zA-Z0-9:-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g, "");

  sanitized = sanitized.replace(
    /\s+(xlink:href|href)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,
    (raw, attributeName, attributeValue) => {
      const value = stripQuotes(attributeValue).trim();
      if (value.startsWith("#") || value.length === 0) {
        return ` ${attributeName}=${attributeValue}`;
      }
      return "";
    }
  );

  return sanitized;
}

function normalizeRootSvgTag(svgText, displayPath) {
  const rootMatch = svgText.match(/<\s*svg\b([^>]*)>/i);
  if (!rootMatch) {
    throw new Error(`${displayPath}: missing root <svg> tag.`);
  }

  const rootAttributesRaw = rootMatch[1] ?? "";
  const tokens = parseAttributeTokens(rootAttributesRaw);
  const attrByLower = new Map();

  tokens.forEach((token) => {
    attrByLower.set(token.rawName.toLowerCase(), token.value);
  });

  let normalizedViewBox = parseViewBox(attrByLower.get("viewbox"));
  if (!normalizedViewBox) {
    const width = parseNumericLength(attrByLower.get("width"));
    const height = parseNumericLength(attrByLower.get("height"));

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new Error(
        `${displayPath}: missing valid viewBox and cannot derive from numeric width/height.`
      );
    }

    normalizedViewBox = { x: 0, y: 0, width, height };
  }

  const rebuiltAttributes = [];
  let hasXmlns = false;

  tokens.forEach((token) => {
    const key = token.rawName.toLowerCase();
    if (key === "width" || key === "height" || key === "viewbox") {
      return;
    }

    if (key.startsWith("on")) {
      return;
    }

    if (key === "xmlns") {
      hasXmlns = true;
    }

    rebuiltAttributes.push(`${token.rawName}=${token.rawValue}`);
  });

  if (!hasXmlns) {
    rebuiltAttributes.push('xmlns="http://www.w3.org/2000/svg"');
  }

  rebuiltAttributes.push(
    `viewBox="${normalizedViewBox.x} ${normalizedViewBox.y} ${normalizedViewBox.width} ${normalizedViewBox.height}"`
  );
  rebuiltAttributes.push('data-ctp-normalized="true"');

  const normalizedRootTag = `<svg ${rebuiltAttributes.join(" ")}>`;
  return svgText.replace(rootMatch[0], normalizedRootTag);
}

function validateDeckAssets(deckManifest, deckDir, options = {}) {
  const errors = [];
  const assetCache = new Map();
  const writeAnalysis = options.writeAnalysis === true;
  const analysisOutputRoot = options.analysisOutputRoot ?? DEFAULT_ANALYSIS_ROOT;

  if (!Array.isArray(deckManifest.cards)) {
    return { errors, assetCache };
  }

  for (const card of deckManifest.cards) {
    if (!card || typeof card.asset !== "string") {
      continue;
    }

    if (assetCache.has(card.asset)) {
      continue;
    }

    const absoluteAssetPath = path.resolve(deckDir, card.asset);
    if (!fs.existsSync(absoluteAssetPath)) {
      continue;
    }

    const svgText = fs.readFileSync(absoluteAssetPath, "utf8");
    const displayPath = toPosixPath(path.relative(REPO_ROOT, absoluteAssetPath));

    const svgErrors = validateSvgContent(svgText, displayPath);
    svgErrors.forEach((error) => errors.push(error));

    const geometryAnalysis = analyzeSvgGeometry(svgText, displayPath);
    geometryAnalysis.errors.forEach((error) => errors.push(error));

    const entry = {
      absoluteAssetPath,
      displayPath,
      svgText,
      analysis: geometryAnalysis.summary
    };

    assetCache.set(card.asset, entry);

    if (writeAnalysis) {
      ensureDirectory(analysisOutputRoot);
      const outputPath = analysisPath(analysisOutputRoot, path.basename(card.asset));
      writeJsonFile(outputPath, geometryAnalysis.summary);
    }
  }

  return { errors, assetCache };
}

function validateDeckAtPath(manifestPath, options = {}) {
  const deckDir = path.dirname(manifestPath);
  const relativeManifestPath = toPosixPath(path.relative(REPO_ROOT, manifestPath));

  let deckManifest;
  try {
    deckManifest = readJsonFile(manifestPath);
  } catch (error) {
    return {
      manifestPath,
      relativeManifestPath,
      deckDir,
      deckManifest: null,
      errors: [`${relativeManifestPath}: invalid JSON (${error.message}).`],
      warnings: []
    };
  }

  const { errors, warnings } = validateDeckManifest(deckManifest, deckDir);
  const assetValidation = validateDeckAssets(deckManifest, deckDir, options);
  assetValidation.errors.forEach((error) => errors.push(error));

  return {
    manifestPath,
    relativeManifestPath,
    deckDir,
    deckManifest,
    errors,
    warnings,
    assetCache: assetValidation.assetCache
  };
}

function getNormalizedDeckPaths(deckDir) {
  const normalizedDir = path.join(deckDir, ".normalized");
  return {
    normalizedDir,
    normalizedCardsDir: path.join(normalizedDir, "cards"),
    normalizedManifestPath: path.join(normalizedDir, "deck.normalized.json")
  };
}

function normalizeSvg(assetInfo) {
  const { svgText, displayPath, analysis } = assetInfo;

  if (!analysis || analysis.ambiguousOuterBoundary) {
    throw new Error(`${displayPath}: ambiguous outer boundary; normalization blocked.`);
  }

  if (analysis.artworkExceedsSafeCorner) {
    throw new Error(`${displayPath}: artwork exceeds rounded-corner safe region; normalization blocked.`);
  }

  if (!analysis.candidateOuterBoundary) {
    throw new Error(`${displayPath}: missing outer boundary candidate.`);
  }

  let normalized = sanitizeSvgText(svgText);
  normalized = normalizeRootSvgTag(normalized, displayPath);
  normalized = boundaryTagFromTokenIndex(
    normalized,
    analysis.candidateOuterBoundary.tokenIndex
  );

  if (!/\bdata-card-boundary\s*=\s*"true"/.test(normalized)) {
    throw new Error(`${displayPath}: failed to tag outer boundary with data-card-boundary.`);
  }

  return normalized.endsWith("\n") ? normalized : `${normalized}\n`;
}

function normalizeDeck(validationResult) {
  const { deckDir, deckManifest, assetCache } = validationResult;
  const { normalizedDir, normalizedCardsDir, normalizedManifestPath } =
    getNormalizedDeckPaths(deckDir);

  fs.rmSync(normalizedDir, { recursive: true, force: true });
  ensureDirectory(normalizedCardsDir);

  const deckFolderName = getDeckFolderName(deckDir);
  const normalizedCardsByAsset = new Map();

  for (const [relativeAssetPath, assetInfo] of assetCache.entries()) {
    const normalizedSvg = normalizeSvg(assetInfo);
    const normalizedFileName = path.basename(relativeAssetPath);
    const outputPath = path.join(normalizedCardsDir, normalizedFileName);
    fs.writeFileSync(outputPath, normalizedSvg);

    normalizedCardsByAsset.set(relativeAssetPath, {
      outputPath,
      runtimePath: `assets/decks/${deckFolderName}/.normalized/cards/${normalizedFileName}`
    });
  }

  const normalizedCards = deckManifest.cards.map((card) => {
    const normalizedAsset = normalizedCardsByAsset.get(card.asset);
    return {
      cardId: card.cardId,
      rank: card.rank,
      suit: card.suit,
      assetPath: normalizedAsset ? normalizedAsset.runtimePath : null
    };
  });

  if (normalizedCards.some((card) => typeof card.assetPath !== "string" || card.assetPath.length === 0)) {
    throw new Error(`${deckManifest.deckId}: normalization produced missing card asset paths.`);
  }

  const normalizedManifest = {
    manifestVersion: 1,
    normalized: true,
    normalizedAt: new Date().toISOString(),
    sourceManifestPath: `assets/decks/${deckFolderName}/deck.json`,
    deckId: deckManifest.deckId,
    deckVersion: deckManifest.deckVersion,
    title: deckManifest.title,
    description: deckManifest.description ?? "",
    model: {
      kind: deckManifest.model.kind,
      jokers: deckManifest.model.jokers ?? 0
    },
    locale: deckManifest.locale ?? {},
    cards: normalizedCards
  };

  writeJsonFile(normalizedManifestPath, normalizedManifest);
  return {
    normalizedManifest,
    normalizedManifestPath,
    normalizedDir
  };
}

function discoverNormalizedManifests() {
  if (!fs.existsSync(DECKS_ROOT)) {
    return [];
  }

  const normalizedManifests = [];
  const deckFolders = fs.readdirSync(DECKS_ROOT, { withFileTypes: true });

  deckFolders.forEach((entry) => {
    if (!entry.isDirectory()) {
      return;
    }

    const normalizedManifestPath = path.join(
      DECKS_ROOT,
      entry.name,
      ".normalized",
      "deck.normalized.json"
    );

    if (fs.existsSync(normalizedManifestPath)) {
      normalizedManifests.push(normalizedManifestPath);
    }
  });

  return normalizedManifests;
}

function generateDeckIndex() {
  const manifests = discoverNormalizedManifests();
  const decks = manifests
    .map((manifestPath) => {
      const relativePath = toPosixPath(path.relative(REPO_ROOT, manifestPath));
      let manifest;

      try {
        manifest = readJsonFile(manifestPath);
      } catch (_error) {
        return null;
      }

      if (!manifest || manifest.normalized !== true || manifest.manifestVersion !== 1) {
        return null;
      }

      return {
        deckId: manifest.deckId,
        title: manifest.title,
        deckVersion: manifest.deckVersion,
        model: manifest.model,
        manifestPath: relativePath,
        status: "valid"
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.title.localeCompare(right.title));

  const payload = {
    generatedAt: new Date().toISOString(),
    decks
  };

  const indexPath = path.join(DECKS_ROOT, "decks.index.json");
  writeJsonFile(indexPath, payload);
  return { indexPath, payload };
}

function generateDeckRuntimeBundle(indexPayload) {
  const manifests = discoverNormalizedManifests();
  const normalizedManifestsByPath = {};
  const svgMarkupByPath = {};

  manifests.forEach((manifestPath) => {
    const relativeManifestPath = toPosixPath(path.relative(REPO_ROOT, manifestPath));
    let manifest;

    try {
      manifest = readJsonFile(manifestPath);
    } catch (_error) {
      return;
    }

    normalizedManifestsByPath[relativeManifestPath] = manifest;

    if (!Array.isArray(manifest.cards)) {
      return;
    }

    manifest.cards.forEach((card) => {
      if (!card || typeof card.assetPath !== "string" || card.assetPath.length === 0) {
        return;
      }

      if (Object.prototype.hasOwnProperty.call(svgMarkupByPath, card.assetPath)) {
        return;
      }

      const absoluteAssetPath = path.join(REPO_ROOT, card.assetPath);
      if (!fs.existsSync(absoluteAssetPath)) {
        return;
      }

      svgMarkupByPath[card.assetPath] = fs.readFileSync(absoluteAssetPath, "utf8");
    });
  });

  const effectiveIndex = indexPayload ?? generateDeckIndex().payload;
  const runtimePayload = [
    "/* This file is generated by npm run decks:normalize */",
    `window.__CTP_DECK_INDEX__ = ${JSON.stringify(effectiveIndex, null, 2)};`,
    `window.__CTP_DECK_MANIFESTS__ = ${JSON.stringify(normalizedManifestsByPath, null, 2)};`,
    `window.__CTP_DECK_SVG__ = ${JSON.stringify(svgMarkupByPath)};`
  ].join("\n\n");

  const runtimePath = path.join(DECKS_ROOT, "decks.runtime.js");
  fs.writeFileSync(runtimePath, `${runtimePayload}\n`);

  return { runtimePath };
}

function analyzeDeckAssetsFromDirectory(sourceDir, outputRoot = DEFAULT_ANALYSIS_ROOT) {
  const absoluteSourceDir = path.resolve(REPO_ROOT, sourceDir);

  if (!fs.existsSync(absoluteSourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }

  ensureDirectory(outputRoot);

  const svgFiles = fs
    .readdirSync(absoluteSourceDir)
    .filter((fileName) => fileName.toLowerCase().endsWith(".svg"))
    .sort((left, right) => left.localeCompare(right));

  const summaries = [];
  svgFiles.forEach((fileName) => {
    const absolutePath = path.join(absoluteSourceDir, fileName);
    const relativePath = toPosixPath(path.relative(REPO_ROOT, absolutePath));
    const svgText = fs.readFileSync(absolutePath, "utf8");
    const analysis = analyzeSvgGeometry(svgText, relativePath);
    const outputPath = analysisPath(outputRoot, fileName);
    writeJsonFile(outputPath, analysis.summary);

    summaries.push({
      fileName,
      relativePath,
      outputPath: toPosixPath(path.relative(REPO_ROOT, outputPath)),
      errors: analysis.errors
    });
  });

  return summaries;
}

module.exports = {
  REPO_ROOT,
  DECKS_ROOT,
  STANDARD_SUITS,
  STANDARD_RANKS,
  SVG_ALLOWED_ELEMENTS,
  SVG_ALLOWED_ATTRIBUTES,
  DEFAULT_ANALYSIS_ROOT,
  discoverDeckManifestPaths,
  validateDeckAtPath,
  normalizeDeck,
  generateDeckIndex,
  generateDeckRuntimeBundle,
  analyzeDeckAssetsFromDirectory,
  toPosixPath,
  getNormalizedDeckPaths
};
