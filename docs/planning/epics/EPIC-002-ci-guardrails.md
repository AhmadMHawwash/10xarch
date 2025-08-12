# EPIC-002: CI/PR Guardrails + Policy Packs

Status: todo
Owner: TBD
Links: [Product Plan](../PRODUCT-PLAN.md)

## Goal
Post architectural diffs and policy results on PRs with actionable evidence; configurable severity and allowlists.

## Outcome/Success
- P95 PR check < 60s on medium repos.
- Each violation links to file/line evidence.
- Mute/allowlist respected via config; false positives < 10%.

## Scope
- GitHub App + webhook handling.
- Incremental analysis by diff (base vs head).
- Graph diff engine.
- Policy engine + default pack.
- PR comment template + Checks API integration.
- Config loader/schema validation + owners/contexts.
- Telemetry and mute/allowlist flows.

## Non-goals
- Runtime overlays, simulations.

## Deliverables
- Installed GitHub App with checks.
- One concise PR comment per run.
- `system-graph.policy.json` with schema.

## Acceptance Criteria
- See Product Plan v0.2 acceptance.

## Risks & Mitigations
- Noise in PRs: severity tuning + single-comment strategy.
- Large monorepos: incremental/diff analysis + caching.

## Stories
- CG-001: GitHub App setup & webhooks
- CG-002: Incremental analysis & graph diff
- CG-003: Policy engine & default rules
- CG-004: PR comment + Checks API
- CG-005: Config loader & schema validation
- CG-006: Telemetry + mute/allowlist

## Timeline (target 31–60 days)
- Week 5: CG-001
- Week 6: CG-002
- Week 7: CG-003
- Week 8: CG-004, CG-005
- Week 9: CG-006 + polish


