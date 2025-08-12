# CG-002: Incremental analysis & graph diff

Status: todo | Estimate: L | Owner: TBD
Epic: EPIC-002

## Description
Compute System Graph for base and head SHAs by analyzing only changed files and reusing cached results. Produce node/edge diff for policy evaluation and PR summary.

## Deliverables
- Incremental analyzer using file-hash cache.
- Graph diff module (added/removed/changed nodes/edges).

## Acceptance Criteria
- Average PR run P95 < 60s on sample repos.
- Diff output is stable and correct on fixtures.

## Dependencies
- EPIC-001 (graph available), CG-001.


