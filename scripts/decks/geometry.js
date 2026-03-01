const path = require("path");

const COMMAND_ARITY = {
  M: 2,
  L: 2,
  H: 1,
  V: 1,
  C: 6,
  S: 4,
  Q: 4,
  T: 2,
  A: 7,
  Z: 0
};

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

function parseAttributeTokens(attributesText) {
  const tokens = [];
  const attrRe = /([A-Za-z_:][\w:.-]*)\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+)/g;
  let match = attrRe.exec(attributesText);

  while (match) {
    tokens.push({
      rawName: match[1],
      rawValue: match[2],
      value: stripQuotes(match[2])
    });
    match = attrRe.exec(attributesText);
  }

  return tokens;
}

function parseAttributesMap(attributesText) {
  const map = {};
  parseAttributeTokens(attributesText).forEach((token) => {
    map[token.rawName] = token.value;
  });
  return map;
}

function parseNumericLength(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^([-+]?[0-9]*\.?[0-9]+)(px)?$/i);
  if (!match) {
    return null;
  }

  const numeric = Number.parseFloat(match[1]);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseViewBox(value) {
  if (typeof value !== "string") {
    return null;
  }

  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map((part) => Number.parseFloat(part));

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isFinite(part)) ||
    parts[2] <= 0 ||
    parts[3] <= 0
  ) {
    return null;
  }

  return {
    x: parts[0],
    y: parts[1],
    width: parts[2],
    height: parts[3]
  };
}

function identityMatrix() {
  return [1, 0, 0, 1, 0, 0];
}

function multiplyMatrix(left, right) {
  return [
    left[0] * right[0] + left[2] * right[1],
    left[1] * right[0] + left[3] * right[1],
    left[0] * right[2] + left[2] * right[3],
    left[1] * right[2] + left[3] * right[3],
    left[0] * right[4] + left[2] * right[5] + left[4],
    left[1] * right[4] + left[3] * right[5] + left[5]
  ];
}

function applyMatrix(point, matrix) {
  return {
    x: matrix[0] * point.x + matrix[2] * point.y + matrix[4],
    y: matrix[1] * point.x + matrix[3] * point.y + matrix[5]
  };
}

function parseTransformList(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return identityMatrix();
  }

  const transformRe = /([A-Za-z]+)\s*\(([^)]*)\)/g;
  let match = transformRe.exec(value);
  let current = identityMatrix();

  while (match) {
    const fn = match[1].toLowerCase();
    const numbers = match[2]
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((part) => Number.parseFloat(part))
      .filter((part) => Number.isFinite(part));

    let transform = identityMatrix();

    if (fn === "matrix" && numbers.length === 6) {
      transform = numbers;
    } else if (fn === "translate") {
      const tx = numbers[0] ?? 0;
      const ty = numbers[1] ?? 0;
      transform = [1, 0, 0, 1, tx, ty];
    } else if (fn === "scale") {
      const sx = numbers[0] ?? 1;
      const sy = numbers[1] ?? sx;
      transform = [sx, 0, 0, sy, 0, 0];
    } else if (fn === "rotate") {
      const angle = ((numbers[0] ?? 0) * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      if (numbers.length >= 3) {
        const cx = numbers[1];
        const cy = numbers[2];
        const toOrigin = [1, 0, 0, 1, -cx, -cy];
        const rotate = [cos, sin, -sin, cos, 0, 0];
        const fromOrigin = [1, 0, 0, 1, cx, cy];
        transform = multiplyMatrix(fromOrigin, multiplyMatrix(rotate, toOrigin));
      } else {
        transform = [cos, sin, -sin, cos, 0, 0];
      }
    } else if (fn === "skewx") {
      const angle = ((numbers[0] ?? 0) * Math.PI) / 180;
      transform = [1, 0, Math.tan(angle), 1, 0, 0];
    } else if (fn === "skewy") {
      const angle = ((numbers[0] ?? 0) * Math.PI) / 180;
      transform = [1, Math.tan(angle), 0, 1, 0, 0];
    }

    current = multiplyMatrix(current, transform);
    match = transformRe.exec(value);
  }

  return current;
}

function getStyleMap(styleValue) {
  if (typeof styleValue !== "string" || styleValue.trim().length === 0) {
    return {};
  }

  const styleMap = {};
  styleValue.split(";").forEach((declaration) => {
    const separatorIndex = declaration.indexOf(":");
    if (separatorIndex < 0) {
      return;
    }

    const key = declaration.slice(0, separatorIndex).trim().toLowerCase();
    const value = declaration.slice(separatorIndex + 1).trim();
    if (!key || !value) {
      return;
    }

    styleMap[key] = value;
  });

  return styleMap;
}

function normalizeColor(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "none") {
    return "none";
  }

  if (normalized === "white") {
    return "#ffffff";
  }

  if (normalized === "black") {
    return "#000000";
  }

  if (/^#[0-9a-f]{3}$/i.test(normalized)) {
    const [r, g, b] = normalized.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  if (/^#[0-9a-f]{6}$/i.test(normalized)) {
    return normalized;
  }

  return normalized;
}

function getPaintValue(attrs, key) {
  const styleMap = getStyleMap(attrs.style);
  const attrValue = attrs[key];
  const styleValue = styleMap[key];

  if (attrValue !== undefined && attrValue !== "inherit") {
    return normalizeColor(attrValue);
  }

  if (styleValue !== undefined && styleValue !== "inherit") {
    return normalizeColor(styleValue);
  }

  return null;
}

function getNumericPaintValue(attrs, key) {
  const styleMap = getStyleMap(attrs.style);
  const attrValue = attrs[key];
  const styleValue = styleMap[key];
  const raw = attrValue ?? styleValue;

  if (raw === undefined) {
    return null;
  }

  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function bboxFromPoints(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  points.forEach((point) => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });

  return {
    x: minX,
    y: minY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY)
  };
}

function rectPoints(rect) {
  const x = parseNumericLength(rect.x) ?? 0;
  const y = parseNumericLength(rect.y) ?? 0;
  const width = parseNumericLength(rect.width) ?? 0;
  const height = parseNumericLength(rect.height) ?? 0;

  return [
    { x, y },
    { x: x + width, y },
    { x, y: y + height },
    { x: x + width, y: y + height }
  ];
}

function pathBBox(d) {
  if (typeof d !== "string" || d.trim().length === 0) {
    return null;
  }

  const tokenRe = /([AaCcHhLlMmQqSsTtVvZz])|([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/g;
  const tokens = [];
  let tokenMatch = tokenRe.exec(d);

  while (tokenMatch) {
    if (tokenMatch[1]) {
      tokens.push({ type: "cmd", value: tokenMatch[1] });
    } else {
      tokens.push({ type: "num", value: Number.parseFloat(tokenMatch[2]) });
    }
    tokenMatch = tokenRe.exec(d);
  }

  const points = [];
  let current = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };
  let command = "M";
  let index = 0;

  function readNumber() {
    if (index >= tokens.length || tokens[index].type !== "num") {
      return null;
    }

    const value = tokens[index].value;
    index += 1;
    return value;
  }

  while (index < tokens.length) {
    if (tokens[index].type === "cmd") {
      command = tokens[index].value;
      index += 1;
    }

    const absolute = command === command.toUpperCase();
    const normalized = command.toUpperCase();
    const arity = COMMAND_ARITY[normalized];

    if (arity === undefined) {
      break;
    }

    if (normalized === "Z") {
      current = { x: start.x, y: start.y };
      points.push({ x: current.x, y: current.y });
      continue;
    }

    const values = [];
    while (values.length < arity) {
      const number = readNumber();
      if (number === null) {
        break;
      }
      values.push(number);
    }

    if (values.length < arity) {
      break;
    }

    if (normalized === "M") {
      const next = {
        x: absolute ? values[0] : current.x + values[0],
        y: absolute ? values[1] : current.y + values[1]
      };
      current = next;
      start = { ...next };
      points.push({ x: current.x, y: current.y });

      while (true) {
        const x = readNumber();
        const y = readNumber();
        if (x === null || y === null) {
          break;
        }

        current = {
          x: absolute ? x : current.x + x,
          y: absolute ? y : current.y + y
        };
        points.push({ x: current.x, y: current.y });
      }

      continue;
    }

    if (normalized === "L") {
      current = {
        x: absolute ? values[0] : current.x + values[0],
        y: absolute ? values[1] : current.y + values[1]
      };
      points.push({ x: current.x, y: current.y });
      continue;
    }

    if (normalized === "H") {
      current = {
        x: absolute ? values[0] : current.x + values[0],
        y: current.y
      };
      points.push({ x: current.x, y: current.y });
      continue;
    }

    if (normalized === "V") {
      current = {
        x: current.x,
        y: absolute ? values[0] : current.y + values[0]
      };
      points.push({ x: current.x, y: current.y });
      continue;
    }

    if (normalized === "C") {
      const control1 = {
        x: absolute ? values[0] : current.x + values[0],
        y: absolute ? values[1] : current.y + values[1]
      };
      const control2 = {
        x: absolute ? values[2] : current.x + values[2],
        y: absolute ? values[3] : current.y + values[3]
      };
      const end = {
        x: absolute ? values[4] : current.x + values[4],
        y: absolute ? values[5] : current.y + values[5]
      };
      points.push(control1, control2, end);
      current = end;
      continue;
    }

    if (normalized === "S") {
      const control = {
        x: absolute ? values[0] : current.x + values[0],
        y: absolute ? values[1] : current.y + values[1]
      };
      const end = {
        x: absolute ? values[2] : current.x + values[2],
        y: absolute ? values[3] : current.y + values[3]
      };
      points.push(control, end);
      current = end;
      continue;
    }

    if (normalized === "Q") {
      const control = {
        x: absolute ? values[0] : current.x + values[0],
        y: absolute ? values[1] : current.y + values[1]
      };
      const end = {
        x: absolute ? values[2] : current.x + values[2],
        y: absolute ? values[3] : current.y + values[3]
      };
      points.push(control, end);
      current = end;
      continue;
    }

    if (normalized === "T") {
      const end = {
        x: absolute ? values[0] : current.x + values[0],
        y: absolute ? values[1] : current.y + values[1]
      };
      points.push(end);
      current = end;
      continue;
    }

    if (normalized === "A") {
      const end = {
        x: absolute ? values[5] : current.x + values[5],
        y: absolute ? values[6] : current.y + values[6]
      };

      // Exact arc bounds require full center/angle solving; endpoints are stable
      // enough for deck ingest boundary heuristics.
      points.push({ x: current.x, y: current.y }, end);
      current = end;
    }
  }

  return bboxFromPoints(points);
}

function transformBbox(bbox, matrix) {
  if (!bbox) {
    return null;
  }

  const corners = [
    { x: bbox.x, y: bbox.y },
    { x: bbox.x + bbox.width, y: bbox.y },
    { x: bbox.x, y: bbox.y + bbox.height },
    { x: bbox.x + bbox.width, y: bbox.y + bbox.height }
  ].map((point) => applyMatrix(point, matrix));

  return bboxFromPoints(corners);
}

function areaOfBbox(bbox) {
  if (!bbox) {
    return 0;
  }
  return Math.max(0, bbox.width) * Math.max(0, bbox.height);
}

function parseSvgGeometry(svgText) {
  const tagRe = /<\s*(\/?)\s*([A-Za-z_:][\w:.-]*)([^>]*)>/g;
  const stack = [{ matrix: identityMatrix() }];
  const rects = [];
  const paths = [];
  const clipPaths = [];
  const masks = [];
  const shapes = [];
  let shapeTokenIndex = 0;
  let rootAttributes = null;

  let match = tagRe.exec(svgText);
  while (match) {
    const isClosing = match[1] === "/";
    const rawName = match[2];
    const tagName = localName(rawName).toLowerCase();
    const attributesText = match[3] ?? "";
    const isSelfClosing = /\/\s*>$/.test(match[0]);

    if (tagName.startsWith("?") || tagName.startsWith("!")) {
      match = tagRe.exec(svgText);
      continue;
    }

    if (isClosing) {
      if (stack.length > 1) {
        stack.pop();
      }
      match = tagRe.exec(svgText);
      continue;
    }

    const attrs = parseAttributesMap(attributesText);
    const parentMatrix = stack[stack.length - 1].matrix;
    const ownMatrix = parseTransformList(attrs.transform);
    const currentMatrix = multiplyMatrix(parentMatrix, ownMatrix);

    if (tagName === "svg" && !rootAttributes) {
      rootAttributes = attrs;
    }

    if (tagName === "rect") {
      const baseBbox = bboxFromPoints(rectPoints(attrs));
      const bbox = transformBbox(baseBbox, currentMatrix);
      const rx = parseNumericLength(attrs.rx) ?? 0;
      const ry = parseNumericLength(attrs.ry) ?? 0;
      const shape = {
        type: "rect",
        tagName,
        tokenIndex: shapeTokenIndex,
        tagStart: match.index,
        tagEnd: match.index + match[0].length,
        attrs,
        bbox,
        area: areaOfBbox(bbox),
        fill: getPaintValue(attrs, "fill"),
        stroke: getPaintValue(attrs, "stroke"),
        strokeWidth: getNumericPaintValue(attrs, "stroke-width") ?? 0,
        rx,
        ry
      };
      rects.push(shape);
      shapes.push(shape);
      shapeTokenIndex += 1;
    } else if (tagName === "path") {
      const baseBbox = pathBBox(attrs.d);
      const bbox = transformBbox(baseBbox, currentMatrix);
      const shape = {
        type: "path",
        tagName,
        tokenIndex: shapeTokenIndex,
        tagStart: match.index,
        tagEnd: match.index + match[0].length,
        attrs,
        bbox,
        area: areaOfBbox(bbox),
        fill: getPaintValue(attrs, "fill"),
        stroke: getPaintValue(attrs, "stroke"),
        strokeWidth: getNumericPaintValue(attrs, "stroke-width") ?? 0,
        rx: 0,
        ry: 0
      };
      paths.push(shape);
      shapes.push(shape);
      shapeTokenIndex += 1;
    } else if (tagName === "clippath") {
      clipPaths.push({ tagStart: match.index, attrs });
    } else if (tagName === "mask") {
      masks.push({ tagStart: match.index, attrs });
    }

    if (!isSelfClosing) {
      stack.push({ matrix: currentMatrix });
    }

    match = tagRe.exec(svgText);
  }

  return {
    rootAttributes,
    rects,
    paths,
    clipPaths,
    masks,
    shapes
  };
}

function shapeAspectRatio(shape) {
  if (!shape?.bbox || shape.bbox.height <= 0) {
    return null;
  }

  return shape.bbox.width / shape.bbox.height;
}

function isNone(value) {
  const normalized = normalizeColor(value);
  return normalized === "none" || normalized === null;
}

function isBorderLikeShape(shape) {
  if (!shape) {
    return false;
  }

  const fill = normalizeColor(shape.fill);
  const stroke = normalizeColor(shape.stroke);
  const strokeWidth = Number.isFinite(shape.strokeWidth) ? shape.strokeWidth : 0;

  if (fill !== "#ffffff") {
    return false;
  }

  if (stroke === "#000000") {
    return strokeWidth <= 4;
  }

  return stroke === "none" || stroke === null;
}

function boundaryRule(shape, viewBox, tolerancePx = 2) {
  if (!shape || !shape.bbox || !viewBox) {
    return false;
  }

  const bbox = shape.bbox;
  const viewAspect = viewBox.width / viewBox.height;
  const shapeAspect = shapeAspectRatio(shape);
  const aspectDelta = shapeAspect === null ? Number.POSITIVE_INFINITY : Math.abs(viewAspect - shapeAspect);

  const nearLeft = Math.abs(bbox.x - viewBox.x) <= tolerancePx;
  const nearTop = Math.abs(bbox.y - viewBox.y) <= tolerancePx;
  const nearRight = Math.abs(bbox.x + bbox.width - (viewBox.x + viewBox.width)) <= tolerancePx;
  const nearBottom = Math.abs(bbox.y + bbox.height - (viewBox.y + viewBox.height)) <= tolerancePx;

  const paintRule = isBorderLikeShape(shape) || (!isNone(shape.stroke) && isNone(shape.fill));

  return nearLeft && nearTop && nearRight && nearBottom && aspectDelta <= 0.02 && paintRule;
}

function candidateScore(shape, viewBox) {
  if (!shape || !shape.bbox || !viewBox) {
    return Number.POSITIVE_INFINITY;
  }

  const bbox = shape.bbox;
  const viewArea = viewBox.width * viewBox.height;
  const coverage = viewArea > 0 ? shape.area / viewArea : 0;
  const coveragePenalty = Math.abs(1 - coverage);
  const positionPenalty =
    (Math.abs(bbox.x - viewBox.x) +
      Math.abs(bbox.y - viewBox.y) +
      Math.abs(bbox.x + bbox.width - (viewBox.x + viewBox.width)) +
      Math.abs(bbox.y + bbox.height - (viewBox.y + viewBox.height))) /
    Math.max(1, viewBox.width + viewBox.height);

  const viewAspect = viewBox.width / viewBox.height;
  const shapeAspect = shapeAspectRatio(shape);
  const aspectPenalty = shapeAspect === null ? 2 : Math.abs(viewAspect - shapeAspect);

  const boundaryPenalty = boundaryRule(shape, viewBox) ? 0 : 1;
  const borderLikePenalty = isBorderLikeShape(shape) ? 0 : 0.4;
  const roundedRectPenalty =
    shape.type === "rect" && (shape.rx > 0 || shape.ry > 0) ? 0 : 0.12;

  return (
    coveragePenalty * 2 +
    positionPenalty +
    aspectPenalty * 2 +
    boundaryPenalty +
    borderLikePenalty +
    roundedRectPenalty
  );
}

function pickOuterBoundary(shapes, viewBox) {
  if (!Array.isArray(shapes) || shapes.length === 0 || !viewBox) {
    return { candidate: null, ambiguous: true, scored: [] };
  }

  const roundedRects = shapes.filter(
    (shape) => shape.type === "rect" && (shape.rx > 0 || shape.ry > 0)
  );
  const borderLikeShapes = shapes.filter((shape) => isBorderLikeShape(shape));

  const pool =
    borderLikeShapes.length > 0
      ? borderLikeShapes
      : roundedRects.length > 0
        ? roundedRects
        : shapes;

  const scored = pool
    .map((shape) => ({ shape, score: candidateScore(shape, viewBox) }))
    .sort((left, right) => left.score - right.score);

  const boundaryPassing = scored.filter((entry) => boundaryRule(entry.shape, viewBox));
  const ranked = boundaryPassing.length > 0 ? boundaryPassing : scored;

  let candidate = ranked.length > 0 ? ranked[0].shape : null;
  let ambiguous = false;

  if (ranked.length > 1 && Math.abs(ranked[1].score - ranked[0].score) <= 0.002) {
    const firstStroke = Number.isFinite(ranked[0].shape.strokeWidth) ? ranked[0].shape.strokeWidth : 0;
    const secondStroke = Number.isFinite(ranked[1].shape.strokeWidth) ? ranked[1].shape.strokeWidth : 0;

    if (Math.abs(firstStroke - secondStroke) <= 0.1) {
      ambiguous = true;
    } else if (secondStroke > firstStroke) {
      candidate = ranked[1].shape;
    }
  }

  return { candidate, ambiguous, scored: ranked };
}

function pointInsideRoundedRect(point, bbox, radius) {
  const left = bbox.x;
  const top = bbox.y;
  const right = bbox.x + bbox.width;
  const bottom = bbox.y + bbox.height;

  if (point.x < left || point.x > right || point.y < top || point.y > bottom) {
    return false;
  }

  if (radius <= 0) {
    return true;
  }

  const r = Math.min(radius, bbox.width / 2, bbox.height / 2);

  const inLeft = point.x < left + r;
  const inRight = point.x > right - r;
  const inTop = point.y < top + r;
  const inBottom = point.y > bottom - r;

  if (inLeft && inTop) {
    const dx = point.x - (left + r);
    const dy = point.y - (top + r);
    return dx * dx + dy * dy <= r * r;
  }

  if (inRight && inTop) {
    const dx = point.x - (right - r);
    const dy = point.y - (top + r);
    return dx * dx + dy * dy <= r * r;
  }

  if (inLeft && inBottom) {
    const dx = point.x - (left + r);
    const dy = point.y - (bottom - r);
    return dx * dx + dy * dy <= r * r;
  }

  if (inRight && inBottom) {
    const dx = point.x - (right - r);
    const dy = point.y - (bottom - r);
    return dx * dx + dy * dy <= r * r;
  }

  return true;
}

function sampleBboxPoints(bbox) {
  if (!bbox) {
    return [];
  }

  const left = bbox.x;
  const right = bbox.x + bbox.width;
  const top = bbox.y;
  const bottom = bbox.y + bbox.height;
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: left, y: bottom },
    { x: right, y: bottom },
    { x: cx, y: top },
    { x: cx, y: bottom },
    { x: left, y: cy },
    { x: right, y: cy },
    { x: cx, y: cy }
  ];
}

function detectArtworkCornerRisk(shapes, outerBoundary) {
  if (!outerBoundary?.bbox) {
    return false;
  }

  const radius = Math.max(outerBoundary.rx ?? 0, outerBoundary.ry ?? 0);
  if (radius <= 0) {
    return false;
  }

  const outerBbox = outerBoundary.bbox;

  return shapes.some((shape) => {
    if (shape.tokenIndex === outerBoundary.tokenIndex || !shape.bbox) {
      return false;
    }

    const samples = sampleBboxPoints(shape.bbox);
    return samples.some((sample) => {
      const insideOuterRect =
        sample.x >= outerBbox.x &&
        sample.x <= outerBbox.x + outerBbox.width &&
        sample.y >= outerBbox.y &&
        sample.y <= outerBbox.y + outerBbox.height;

      if (!insideOuterRect) {
        return false;
      }

      return !pointInsideRoundedRect(sample, outerBbox, radius);
    });
  });
}

function detectArtworkTouchesViewBoxEdge(shapes, viewBox, outerBoundary, epsilon = 1) {
  if (!viewBox) {
    return false;
  }

  return shapes.some((shape) => {
    if (!shape.bbox) {
      return false;
    }

    if (outerBoundary && shape.tokenIndex === outerBoundary.tokenIndex) {
      return false;
    }

    const bbox = shape.bbox;
    const touchesLeft = Math.abs(bbox.x - viewBox.x) < epsilon;
    const touchesTop = Math.abs(bbox.y - viewBox.y) < epsilon;
    const touchesRight = Math.abs(bbox.x + bbox.width - (viewBox.x + viewBox.width)) < epsilon;
    const touchesBottom = Math.abs(bbox.y + bbox.height - (viewBox.y + viewBox.height)) < epsilon;

    return touchesLeft || touchesTop || touchesRight || touchesBottom;
  });
}

function detectMultipleRoundedRects(rects) {
  return rects.filter((rect) => rect.rx > 0 || rect.ry > 0).length > 1;
}

function analyzeSvgGeometry(svgText, sourcePath = "") {
  const geometry = parseSvgGeometry(svgText);
  const rootAttrs = geometry.rootAttributes ?? {};
  const rawViewBox = parseViewBox(rootAttrs.viewBox);
  const width = parseNumericLength(rootAttrs.width);
  const height = parseNumericLength(rootAttrs.height);

  const viewBox =
    rawViewBox ??
    (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0
      ? { x: 0, y: 0, width, height }
      : null);

  const boundarySelection = pickOuterBoundary(geometry.shapes, viewBox);
  const outerBoundary = boundarySelection.candidate;

  const largestShapeArea = geometry.shapes.reduce(
    (largest, shape) => Math.max(largest, shape.area),
    0
  );

  const hasMultipleRoundedRects = detectMultipleRoundedRects(geometry.rects);
  const artworkTouchesViewBoxEdge = detectArtworkTouchesViewBoxEdge(
    geometry.shapes,
    viewBox,
    outerBoundary
  );
  const artworkExceedsSafeCorner = detectArtworkCornerRisk(geometry.shapes, outerBoundary);

  const errors = [];

  if (!outerBoundary) {
    errors.push(`${sourcePath}: failed to detect outer boundary.`);
  } else if (!boundaryRule(outerBoundary, viewBox)) {
    errors.push(`${sourcePath}: detected outer boundary does not satisfy boundary rule.`);
  }

  if (boundarySelection.ambiguous) {
    errors.push(`${sourcePath}: ambiguous outer boundary candidate.`);
  }

  if (artworkExceedsSafeCorner) {
    errors.push(`${sourcePath}: artwork exceeds rounded-corner safe region.`);
  }

  const candidateOuterBoundary = outerBoundary
    ? {
        type: outerBoundary.type,
        area: outerBoundary.area,
        rx: outerBoundary.rx,
        ry: outerBoundary.ry,
        tokenIndex: outerBoundary.tokenIndex,
        id: outerBoundary.attrs.id ?? null,
        bbox: outerBoundary.bbox
      }
    : null;

  const summary = {
    sourcePath,
    viewBox,
    width,
    height,
    candidateOuterBoundary,
    largestShapeArea,
    shapesCount: geometry.shapes.length,
    hasMultipleRoundedRects,
    artworkTouchesViewBoxEdge,
    artworkExceedsSafeCorner,
    ambiguousOuterBoundary: boundarySelection.ambiguous,
    clipPathCount: geometry.clipPaths.length,
    maskCount: geometry.masks.length,
    rectCount: geometry.rects.length,
    pathCount: geometry.paths.length
  };

  return {
    summary,
    geometry,
    errors
  };
}

function boundaryTagFromTokenIndex(svgText, tokenIndex) {
  if (!Number.isInteger(tokenIndex) || tokenIndex < 0) {
    return svgText;
  }

  const shapeTagRe = /<\s*(rect|path)\b[^>]*>/gi;
  let shapeIndex = 0;
  let match = shapeTagRe.exec(svgText);

  while (match) {
    if (shapeIndex === tokenIndex) {
      if (/\bdata-card-boundary\s*=/.test(match[0])) {
        return svgText;
      }

      const isSelfClosing = /\/\s*>$/.test(match[0]);
      const insertionIndex = isSelfClosing
        ? match.index + match[0].length - 2
        : match.index + match[0].length - 1;
      const insertion = ' data-card-boundary="true"';
      return `${svgText.slice(0, insertionIndex)}${insertion}${svgText.slice(insertionIndex)}`;
    }

    shapeIndex += 1;
    match = shapeTagRe.exec(svgText);
  }

  return svgText;
}

function analysisPath(outputRoot, cardFileName) {
  const cardId = path.basename(cardFileName, path.extname(cardFileName));
  return path.join(outputRoot, `${cardId}.json`);
}

module.exports = {
  parseAttributeTokens,
  parseAttributesMap,
  parseNumericLength,
  parseViewBox,
  analyzeSvgGeometry,
  boundaryTagFromTokenIndex,
  analysisPath
};
