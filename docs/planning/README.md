## Planning Workspace

This folder organizes near-term execution for the two focused pillars:
- Typed System Graph + C4-from-code
- CI/PR Guardrails + Policy Packs

Reference documents:
- Strategy: ../PRODUCT-STRATEGY-AND-ROADMAP.md
- Detailed plan/specs: ../PRODUCT-PLAN.md

### Structure
- `epics/`: outcome-level units with scope, deliverables, acceptance criteria.
- `stories/`: small increments deliverable within 2–5 days each.
- `milestones/`: grouped deliverables by release window.
- `backlog.md`: items deferred beyond v0.2.

### Conventions
- File naming: `EPIC-###-slug.md`, `SG-###-slug.md` (System Graph), `CG-###-slug.md` (CI Guardrails).
- Status tags: `[todo|in-progress|blocked|done]` at top of each file.
- Estimates: `S` (≤1 day), `M` (2–3 days), `L` (4–5 days).
- Definition of Done (DoD):
  - Code + tests merged
  - Docs/examples updated
  - Telemetry added (where applicable)
  - Feature flag or rollout plan defined (if applicable)


