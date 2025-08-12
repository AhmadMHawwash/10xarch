# CG-003: Policy engine & default pack

Status: todo | Estimate: M | Owner: TBD
Epic: EPIC-002

## Description
Implement rule evaluation on graph diffs with severity levels and parameters. Ship default rules: circular deps, cross-context coupling, shared DB writes, external API ownership, secret handling, fanout threshold.

## Deliverables
- Rule evaluation engine; rule interfaces.
- Default policy pack with tests.

## Acceptance Criteria
- Rules produce correct findings on fixtures with linked evidence.

## Dependencies
- CG-002.


