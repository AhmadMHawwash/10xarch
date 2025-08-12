# SG-001: AST adapters & observation bus

Status: todo | Estimate: L | Owner: TBD
Epic: EPIC-001

## Description
Implement modular adapters for HTTP, DB, Env (basic MQ surface) that parse JS/TS files and emit normalized observations with evidence. Provide an observation bus to collect per-file results.

## Deliverables
- `http`, `db`, `env` adapters with tests.
- Observation type definitions and bus API.
- Pattern registry for common wrappers (axios, fetch, trpc, drizzle/prisma).

## Acceptance Criteria
- Adapters return observations with file and [start,end] lines.
- Coverage on sample repos (fixtures) producing expected observations.

## Test Plan
- Golden tests on fixtures containing axios/fetch, drizzle/prisma, process.env usage.

## Dependencies
- None (foundational).


