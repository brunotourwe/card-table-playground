# Card Transition Contract v1

This document defines a cross-project, renderer-agnostic contract for card motion.

Schema source of truth:
- `card-transition.v1.schema.json`

Companion examples:
- `card-transition.v1.examples.json`

Frozen v1.0 implementation profile:
- `card-transition.v1.profile.json`

## Goals

- One universal contract for all card-game transitions (`draw`, `deal`, `play`, `reveal`, `collect`, ...).
- Deterministic behavior across clients (local, multiplayer, replay, spectator mode).
- Strictly separate gameplay state transitions from visual motion.
- Reuse the same contract in other projects without coupling to this repository UI.

## v1.0 Freeze

- Profile `ctp.card-transition.v1.profile.core` is frozen on `2026-03-08`.
- Feature IDs in profile level `must` define minimum cross-project implementation scope.
- `should` features are strongly recommended for broad compatibility.
- Any feature ID not listed in `must`, `should`, or `future` is treated as optional in v1.0.

## Design Principles

- Intent first, render second.
  - The contract describes what must happen and when commit occurs.
  - Renderers decide how to draw it (DOM, Canvas, WebGL, native).
- Zones over pixels.
  - Use abstract zone references (`deck.main`, `hand.p1`, `table.centerPile`) and optional offsets.
- Deterministic timing.
  - Time is authoritative (`durationMs`, `delayMs`, phase durations).
  - Optional `seed` gives reproducible visual variation.
- Concealment is explicit.
  - Hidden/flip behavior is modeled in `visibilityPolicy`, not hardcoded in renderer logic.
- Concurrency is explicit.
  - Parallel, staggered, sequential, and wave patterns are represented via `concurrency` and `sequence`.
- Safe evolution.
  - Unknown future keys live in `xExtensions`; core schema stays strict.

## Core Model

Each transition is one `CardTransition` object with these mandatory fields:

- `schemaVersion`: fixed value `ctp.card-transition.v1`
- `transitionId`: unique ID for this transition instance
- `cardRef`: card identity (`string` or structured object)
- `action`: semantic action
- `from` and `to`: abstract start/end zone references
- `timing`: base timing definition
- `visibilityPolicy`: face/conceal/flip policy
- `stateCommitPolicy`: when canonical game state is committed
- `interruptPolicy`: what to do when transition is interrupted

## Field Groups

- Motion definition:
  - `timing`, `path`, `orientation`
- Hidden/reveal behavior:
  - `visibilityPolicy`, optional `audience`
- Data-model synchronization:
  - `stateCommitPolicy`, optional `insertPolicy`
- Multi-card choreography:
  - `concurrency`, `sequence`, shared `transactionId`
- Runtime compatibility:
  - `accessibility`, `events`, `metadata`, `xExtensions`

## Canonical Rules

- `durationMs` and `delayMs` are milliseconds.
- Commit moment is authoritative and must not depend on frame rate.
- `from`/`to` zone IDs are domain identifiers, never CSS selectors.
- Renderers may add style, but cannot violate commit/conceal policies.
- If `mode = flip_at_progress`, `flipProgress` is required.
- If `mode = on_progress`, commit `progress` is required.
- If `interruptPolicy.mode = complete_fast`, `completeFastDurationMs` is required.
- `visibilityPolicy.flipAnimation` is optional visual tween metadata.
  - It never changes authoritative flip/commit gates.
  - `durationMs`, `easing`, `axis`, `revealAtProgress` are renderer-facing only.

## Authoritative Event Invariants

This section is normative for multiplayer and replay-safe behavior.

- `flip`, `reveal`, and `commit` are authoritative events, not cosmetic effects.
- Local animation speed differences are allowed only for interpolation, not for event ordering.
- Reduced-motion mode may shorten or simplify motion, but must preserve the same authoritative event moments.
- A client may visually catch up, but must not reveal a card before the authoritative reveal gate.
- A client that reaches a gate late must apply reveal/commit immediately on arrival at that gate.
- Use `accessibility.preserveAuthoritativeEvents=true` (default) to make this invariant explicit in payloads.

Practical implication:
- If two players use different local animation speeds, their card path smoothness can differ.
- The logical flip/reveal/commit order and timing must still be identical.

## Concealment Model

Use `visibilityPolicy.mode`:

- `face_up_always`
- `face_down_always`
- `face_down_until_arrival`
- `flip_on_start`
- `flip_on_complete`
- `flip_at_progress`
- `flip_at_phase`

Optional `perAudience` enables player/spectator-specific face control.

Optional `flipAnimation` enables visible flip tween control:

- `durationMs`: visual flip tween duration
- `easing`: visual easing for the flip tween
- `axis`: `y` (default) or `x`
- `revealAtProgress`: when face-up artwork becomes visible inside flip tween

Authoritative gate still comes from `mode` + `flipProgress`/`flipPhase`, not from `flipAnimation`.

## Insert and State Commit

`insertPolicy` and `stateCommitPolicy` are intentionally separate:

- `stateCommitPolicy` controls game-truth timing.
- `insertPolicy` controls visual container insertion timing (hand/pile/slot).

This avoids race conditions in networked flows where visual arrival and canonical state updates differ.

## Dealing and Batch Patterns

The contract models one card transition per object.

For dealing multiple cards (including simultaneous patterns like 4-at-once variants):

- emit multiple transitions sharing the same `transactionId`
- coordinate them with `concurrency.groupId`, `concurrency.mode`, and `sequence` fields
- use `sequence.staggerMs`, `sequence.batchSize`, and `sequence.waveIndex` for layout
- for visual block dealing in any block size (for example 2, 3, 4, 5, ... cards per block), use:
  - `sequence.packetId`
  - `sequence.packetSlotIndex`
  - `sequence.holdFormationUntilProgress`
  - `sequence.formationCompactness`

Block segmentation itself (for example `4-4-5`) is game logic, not contract logic.

No game-specific dealing rule is hardcoded in the schema.

For transaction-level behavior (for example shared interrupt/ack policy across many card transitions), use an orchestrator-level batch envelope around multiple `CardTransition` objects.

## Cross-Project Reuse Contract

To reuse in other repositories:

- Keep `schemaVersion` and semantic meanings unchanged.
- Keep zone naming conventions project-local but stable (domain IDs).
- Implement an adapter layer:
  - game/domain state -> `CardTransition`
  - `CardTransition` -> renderer-specific animation
- Keep project-specific data inside `metadata` or `xExtensions`.
- Versioning policy:
  - additive optional fields: stay in v1
  - semantic or required-field break: publish `v2`

## Renderer Boundary (Important)

`CardTransition` is not responsible for playfield clipping or zone masking.

- Keep clipping, masking, and layer overflow in a separate renderer contract.
- `CardTransition` references zones only (`from.zoneId`, `to.zoneId`).
- The renderer resolves zone clip rules from zone/layer profile definitions.

See:
- `docs/specs/zone-render-profile-v1.md`
- `docs/specs/schemas/zone-render-profile.v1.schema.json`

## Potential v1.x Extensions (Not Core v1)

Based on current review, keep these as optional future additions:

- Per-audience flip timing overrides (today only face-state is per audience).
- Optional global `packInstanceId` convention for `cardRef` uniqueness across mixed packs.

## Validation and Testing

Minimum contract tests recommended in every project:

- JSON schema validation pass/fail fixtures.
- Deterministic replay test for fixed `seed` and timestamps.
- Concealment tests for each `visibilityPolicy.mode`.
- State-commit timing tests (`on_start`, `on_progress`, `on_complete`).
- Interrupt tests (`cancel`, `complete_fast`, `snap_to_end`).
- Batch choreography tests (`simultaneous`, `staggered`, `wave`).

Reference scripts in this repository:

- `scripts/transition-feature-catalog-test.js`
- `scripts/transition-profile-freeze-test.js`
- `scripts/transition-conformance-test.js`
