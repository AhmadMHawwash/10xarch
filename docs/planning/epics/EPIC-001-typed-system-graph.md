# EPIC-001: Typed System Graph + C4-from-code

Status: todo
Owner: TBD
Links: [Product Plan](../PRODUCT-PLAN.md)

## Goal
Generate a deterministic `system-graph.json` per commit from JS/TS repos and render C4 L2/L3 with evidence and click-to-code.

## Outcome/Success
- First map < 2 minutes P95 on typical repos.
- Every edge has evidence (file/line).
- Deterministic output for same commit; stable IDs.

## Scope
- AST adapters for HTTP/DB/Env (+ basic MQ surface).
- Container and component inference.
- Graph builder + serializer with stable IDs.
- UI: L2/L3 render, depth toggle, filters, search, evidence popovers, export.

## Non-goals
- Simulations, runtime overlay.
- Multi-language analysis (JS/TS only initially).

## Deliverables
- `system-graph.json` artifact persisted per commit.
- Web UI to visualize and navigate the graph.
- Golden fixtures and performance harness.

## Acceptance Criteria
- See Product Plan v0.1 acceptance.

## Risks & Mitigations
- Custom wrappers: pattern registry + heuristics.
- Dynamic imports: conservative inference + user hints.

## Stories
- SG-001: AST adapters & observation bus
- SG-002: Container inference & ID strategy
- SG-003: Graph builder & serializer
- SG-004: C4 renderer (L2/L3) + depth/filter/evidence + export
- SG-005: Performance + golden tests

## Timeline (target 0–30 days)
- Week 1: SG-001, SG-002
- Week 2: SG-003
- Week 3: SG-004
- Week 4: SG-005 and polish


