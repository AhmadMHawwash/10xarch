# SG-002: Container inference & ID strategy

Status: todo | Estimate: M | Owner: TBD
Epic: EPIC-001

## Description
Infer containers from workspace packages, Next.js app/api boundaries, and server vs client directories. Define deterministic ID generation for containers/components/edges.

## Deliverables
- Container inference rules with tests.
- Stable ID generator functions.

## Acceptance Criteria
- Given the same commit, IDs are stable across runs.
- Component grouping produces predictable results on fixtures.

## Test Plan
- Golden tests for monorepo and single-repo structures.

## Dependencies
- SG-001 (observations available).


