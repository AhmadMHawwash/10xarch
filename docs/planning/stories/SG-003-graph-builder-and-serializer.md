# SG-003: Graph builder & serializer

Status: todo | Estimate: M | Owner: TBD
Epic: EPIC-001

## Description
Aggregate observations into a typed System Graph. Serialize to deterministic `system-graph.json` with evidence for each edge/node and optional component map.

## Deliverables
- Graph builder module and TypeScript types.
- Serializer producing stable JSON ordering.

## Acceptance Criteria
- Deterministic output for identical inputs.
- Evidence present for all edges; CI snapshot tests pass.

## Test Plan
- Golden fixtures comparing JSON output.

## Dependencies
- SG-001, SG-002.


