# Project Status

- Mode: `POC`
- PrimaryArchetype: `POC-Only Prototype`
- PrimarySecurityProfile: `poc-local-no-prod`
- Owner: `bruno`
- Created: `2026-02-22`
- ReviewBy: `2026-04-30`
- Rationale: Lightweight local playground to test card rendering and interaction ideas quickly.

## POC Constraints

- Local/private usage only
- No production deployment
- No real user/sensitive data
- No external API or realtime contract surface

## Standards Applicability

- `01-architecture.md`: applies with `POC` lane constraints and temporary exception listed below
- `02-security-profiles.md`: `poc-local-no-prod` profile applies
- `03-api-events.md`: `N/A` while no external API/realtime contract exists
- `04-operations.md`: POC operational minimum applies
- `05-ui-tokens.json`: optional; not required for this POC

## Promotion Triggers (POC -> LIVE or PROD)

Promotion to `LIVE` or `PROD` is mandatory before:
- sustained deployment beyond local/private usage
- introducing externally consumed API or realtime contracts
- processing real user/sensitive data
- adding production uptime/release commitments

Promotion from `LIVE` to `PROD` is mandatory before:
- enabling unsupervised account creation or self-signup
- opening onboarding beyond admin-supervised flows
- taking product-grade public/support commitments

## Temporary Architecture Exception

- ExceptionId: `ctp-arch-boundary-001`
- Scope: `app.js` currently contains both domain-like card logic and UI rendering concerns.
- Rationale: keep this POC disposable and fast to iterate while it remains local/private.
- Owner: `bruno`
- Expires: `2026-04-30`
- ExitCriteria:
  - on promotion to `LIVE` or `PROD`, split domain logic from adapters/UI
  - enforce boundary checks in CI according to shared standards
