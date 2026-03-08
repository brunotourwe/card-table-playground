"use strict";

const { catalog, profile } = require("@ctp/card-transition-contract");

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function ensureUnique(list, label) {
  const seen = new Set();
  for (const id of list) {
    assert(typeof id === "string", `${label} contains non-string value.`);
    assert(!seen.has(id), `${label} has duplicate feature id '${id}'.`);
    seen.add(id);
  }
}

function run() {
  const levels = profile.levels || {};
  const must = Array.isArray(levels.must) ? levels.must : [];
  const should = Array.isArray(levels.should) ? levels.should : [];
  const future = Array.isArray(levels.future) ? levels.future : [];

  assert(profile.contractSchemaVersion === "ctp.card-transition.v1", "Profile must target ctp.card-transition.v1.");
  assert(profile.profileId === "ctp.card-transition.v1.profile.core", "Unexpected profileId.");

  ensureUnique(must, "levels.must");
  ensureUnique(should, "levels.should");
  ensureUnique(future, "levels.future");

  const allCatalogIds = new Set(catalog.map((entry) => entry.id));
  const assigned = new Set();

  const addLevel = (ids, levelName) => {
    for (const id of ids) {
      assert(allCatalogIds.has(id), `${levelName} id '${id}' missing in catalog.`);
      assert(!assigned.has(id), `Feature id '${id}' assigned to multiple levels.`);
      assigned.add(id);
    }
  };

  addLevel(must, "must");
  addLevel(should, "should");
  addLevel(future, "future");

  const optional = catalog
    .map((entry) => entry.id)
    .filter((id) => !assigned.has(id));

  assert(optional.length > 0, "Optional default level should not be empty.");
  assert(future.every((id) => id.startsWith("L.")), "Future level should only contain L.* ids.");

  console.log("transition-profile-freeze-test: ok");
  console.log(`  profile: ${profile.profileId}`);
  console.log(`  must: ${must.length}`);
  console.log(`  should: ${should.length}`);
  console.log(`  optional (derived): ${optional.length}`);
  console.log(`  future: ${future.length}`);
}

run();
