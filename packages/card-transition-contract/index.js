"use strict";

const catalog = require("./catalog.js");
const schema = require("./artifacts/card-transition.v1.schema.json");
const profile = require("./artifacts/card-transition.v1.profile.json");
const examples = require("./artifacts/card-transition.v1.examples.json");

const SCHEMA_VERSION = "ctp.card-transition.v1";
const ACTIONS = (
  schema &&
  schema.properties &&
  schema.properties.action &&
  Array.isArray(schema.properties.action.enum)
)
  ? schema.properties.action.enum
  : [];

function pushError(errors, condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function isObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function validateCardTransition(transition) {
  const errors = [];

  if (!isObject(transition)) {
    return {
      valid: false,
      errors: ["Transition must be a plain object."]
    };
  }

  pushError(errors, transition.schemaVersion === SCHEMA_VERSION, `schemaVersion must be '${SCHEMA_VERSION}'.`);
  pushError(errors, typeof transition.transitionId === "string" && transition.transitionId.length > 0, "transitionId must be a non-empty string.");
  pushError(errors, typeof transition.transactionId === "string" && transition.transactionId.length > 0, "transactionId must be a non-empty string.");

  const hasStringCardRef = typeof transition.cardRef === "string" && transition.cardRef.length > 0;
  const hasObjectCardRef = isObject(transition.cardRef)
    && typeof transition.cardRef.instanceId === "string"
    && transition.cardRef.instanceId.length > 0;
  pushError(errors, hasStringCardRef || hasObjectCardRef, "cardRef must be a string or an object with instanceId.");

  if (transition.action != null) {
    pushError(errors, ACTIONS.includes(transition.action), `action must be one of: ${ACTIONS.join(", ")}`);
  }

  if (transition.timing != null) {
    const hasDuration = isObject(transition.timing) && Number.isFinite(transition.timing.durationMs);
    pushError(errors, hasDuration, "timing.durationMs must be a finite number when timing is present.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateExamples() {
  const list = Array.isArray(examples) ? examples : [];
  const results = list.map((entry, index) => ({
    index,
    ...validateCardTransition(entry)
  }));
  return {
    valid: results.every((result) => result.valid),
    results
  };
}

module.exports = {
  SCHEMA_VERSION,
  schema,
  profile,
  examples,
  catalog,
  validateCardTransition,
  validateExamples
};
