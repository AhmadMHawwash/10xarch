## Product Strategy and Roadmap

> This is the high-level narrative and milestones. For detailed feature specs, schemas, and acceptance criteria, see the [Product Plan](./PRODUCT-PLAN.md).

### Vision and Positioning
- **Vision**: A code-aware system design workspace that keeps architecture continuously accurate and enforces guardrails in CI for JS/TS teams.
- **Positioning**: Own "continuous architecture" for JavaScript/TypeScript. Deliver live C4-from-code maps plus PR/CI guardrails that prevent architectural drift and risky coupling (not just static diagrams).

### Ideal Customers and Jobs-To-Be-Done (JTBD)
- **ICPs**
  - Seed–Series B engineering teams scaling services, onboarding new engineers, and increasing review throughput.
  - Tech leads wanting architectural consistency and drift prevention without manual diagrams.
- **JTBD**
  - Understand repo topology and data/API flows fast.
  - Catch architectural risks in PRs before merge.
  - Keep diagrams from rotting; detect and prevent drift.
  - Onboard engineers faster with repo-grounded walkthroughs.

### Strategic Focus (Pillars)
- **Pillar 1**: Typed System Graph + C4-from-code (JS/TS-first)
- **Pillar 2**: CI/PR Guardrails + Policy Packs
- Out of scope for now: simulations, runtime overlay. We’ll revisit after these pillars are strong.

---

## Pillar 1: Typed System Graph + C4-from-code

### Outcome
- Deterministic `system-graph.json` generated per commit, derived from JS/TS code.
- Renders C4 L2 (Containers) and L3 (Components) with a depth slider.
- Every node/edge is backed by evidence (files/line numbers) and has stable IDs.

### Inputs We Analyze (v0.1)
- **Imports**: ES Modules, CommonJS, dynamic imports (heuristics).
- **HTTP/API**: `fetch`, `axios`, known wrappers (`api.*`), Next.js `route.ts`, TRPC, serverless handlers.
- **Database**: Drizzle, Prisma, `pg`, `mysql2`, `mongoose`, raw SQL in tagged templates.
- **Messaging/Queues**: `bullmq`, `kafkajs`, `amqplib`, AWS SQS SDK (surface only, v0.1 optional).
- **Env/Config**: `process.env.*`, config files, Next.js runtime config.
- **Framework hints**: Next.js app/api boundaries, workspaces from `package.json`, conventions like `src/server`, `src/lib`.

### Graph Model (v0.1)
- **Nodes**
  - Context (optional early; can be assigned via policy file)
  - Container: service/app/package (Next.js app, API service, worker)
  - Component: meaningful module groups (API client, repository, handler)
- **Edges**
  - Types: HTTP, DB, Queue, RPC, FS/Config
  - Attributes: `paths`, `methods`, `topics`, `tables`, `env`, `external`
- **Evidence**: file and line spans per node/edge
- **Determinism**: Stable IDs derived from repo path + semantic role

### Artifact Example: `system-graph.json`
```json
{
  "version": "0.1",
  "commit": "<sha>",
  "generatedAt": "2025-08-12T10:00:00Z",
  "nodes": [
    {"id": "container:next-web", "kind": "container", "name": "Next.js App", "tech": "Next.js"},
    {"id": "container:payments-svc", "kind": "container", "name": "Payments Service"},
    {"id": "component:next-web.auth-client", "kind": "component", "name": "Auth API Client", "parent": "container:next-web"}
  ],
  "edges": [
    {
      "id": "edge:http:next-web->payments-svc",
      "from": "container:next-web",
      "to": "container:payments-svc",
      "type": "HTTP",
      "paths": ["/v1/pay"],
      "methods": ["POST"],
      "env": ["PAYMENTS_URL"],
      "evidence": [{"file": "src/lib/payments.ts", "lines": [10, 40]}]
    }
  ]
}
```

### Depth Slider Mapping
- **Depth 1**: Containers only (C4 L2)
- **Depth 2**: Containers + top components per container (C4 L3)
- **Depth 3+**: Components grouped by feature directories; cap fanout for readability

### Rendering Requirements (Web UI)
- Depth toggle, filters (edge type, method/topic/table, external/internal)
- Search nodes; click-to-code (open file+line)
- Evidence popovers on edges
- Export PNG/SVG/JSON

### Engine Design (High-Level)
- Modular scanners/adapters: `http`, `db`, `mq`, `env` with a registry for custom patterns
- AST-first with heuristic fallbacks for common wrappers
- Container inference: workspaces/packages, server vs client boundaries, Next.js routing
- Deterministic ID strategy; golden tests for stability
- Incremental analysis: file-hash cache; reuse base graphs for PRs

### Acceptance Criteria (v0.1)
- 80% of typical JS/TS repos produce correct container maps in < 2 minutes
- Every edge has at least one evidence link
- Deterministic output for the same commit; stable IDs across runs
- Monorepo workspace support

### Engineering Hooks in This Repo (Getting Started)
- Integrate scanners with the AST layer (e.g., `extractAPIEndpoints`, `extractDatabaseQueries`, `extractEnvUsage`) to emit normalized observations that the graph aggregator consumes.

---

## Pillar 2: CI/PR Guardrails + Policy Packs

### Outcome
- GitHub App posts architectural diffs and policy results on PRs. Checks can warn/block based on severity. Configurable via repo/org policy file.

### Events and Flow
- On `pull_request` opened/synchronized:
  - Generate System Graph for base and head (incremental)
  - Diff nodes/edges; evaluate policies
  - Post a Check Run + single summary comment with evidence and remediation
- On `push` to default branch: generate/cache `system-graph.json`

### Default Policy Pack (v0.1)
- **Circular dependencies**: module-level and container-level
- **Cross-context coupling**: new edges crossing declared contexts
- **Shared DB tables**: writes/reads to the same table across containers
- **Unowned external API calls**: new domains without owners
- **Secret handling**: hardcoded tokens; insecure env usage
- **Fanout threshold**: warn on > N new sync HTTP edges from a container

### Policy Config File Example: `system-graph.policy.json`
```json
{
  "$schema": "https://example.com/system-graph.policy.schema.json",
  "extends": ["default@1"],
  "rules": {
    "no-circular-deps": {"level": "error"},
    "no-cross-context-coupling": {"level": "warn", "allow": ["auth->payments"]},
    "no-shared-db-table-writes": {"level": "error"},
    "external-api-ownership": {"level": "warn", "owners": {"api.stripe.com": "payments-team"}},
    "secret-handling": {"level": "error"},
    "fanout-threshold": {"level": "warn", "maxNewSyncEdges": 3}
  },
  "contexts": {
    "containers": {
      "next-web": "frontend",
      "payments-svc": "payments"
    }
  }
}
```

### PR Comment Template (Concise, Actionable)
- Architectural diff summary: nodes/edges added/removed; context crossings
- Violations grouped by severity with evidence links and suggested fixes
- Commands: mute rule, reclassify container, assign owner to external API

### GitHub App Permissions
- Contents: read; Checks: write; Pull requests: read; Issues/Comments: write; Installations: read

### Acceptance Criteria (v0.2)
- P95 PR check runtime < 60 seconds on medium repos
- Every violation links to at least one file/line of evidence
- Mute/allowlist respected via config; low false-positive rate (< 10%) with tunables

### Telemetry
- Violations per PR, mute actions, time saved estimates
- Rule hit rates to refine defaults

---

## Platform & Ops

### Processing & Storage
- Queue jobs per repo installation; dedupe by head SHA
- Caching: file-hash → observations; commit → system graph; PR (base, head) → diff
- Storage: `system-graph.json` blobs keyed by commit; policy files; org settings; audit logs

### Security & Privacy
- Scoped tokens; encrypt at rest/in transit; ephemeral workspaces
- Optional "artifact-in-repo-only" mode for enterprises

### Performance SLOs
- First map < 2 minutes; PR check < 60s P95; memory-bounded scanning in large monorepos

---

## Roadmap (90 Days)

### 0–30 days (v0.1: Graph + UI)
- JS/TS scanners for imports, HTTP, DB, env + observation bus and graph aggregator
- Deterministic graph builder with evidence; artifact storage
- Web UI: C4 L2/L3 render, search, filter, click-to-code, export
- Golden test suites on sample repos; performance harness
- Documentation: how the graph is built, supported patterns, extension registry

### 31–60 days (v0.2: CI/PR Guardrails)
- GitHub App with Checks API; PR event handling; incremental analysis by diff
- Graph diff engine; policy evaluator; default policy pack
- PR comment + status checks; policy config file and org defaults
- Mute/allowlist, owners map, context assignment; telemetry

### 61–90 days (Hardening + Pilots)
- False-positive reduction; rule tuning; more adapters (TRPC, queue libs)
- Enterprise readiness: SSO stub, audit logs, data retention options
- 5–10 pilot teams; measure PR review friction reduction and onboarding improvements

---

## Metrics
- **Activation**: time-to-first-map, first PR check enabled, time-to-first-drift alert
- **Engagement**: weekly active repos, PR comment read rate, actions taken on suggestions
- **Outcome**: reduced review time, fewer post-merge rollbacks due to coupling errors, onboarding time reduction
- **Quality**: false-positive rate, muted policy rate, remediation success rate

---

## Go-To-Market & Packaging

### Tiers
- **Free**: manual graph runs for 1 repo; basic UI
- **Pro**: auto commit graphs; CI/PR checks; default policy packs; Slack notifications
- **Team**: org policies; SSO; audit logs; private hosting option

### Channels & Motion
- GitHub Marketplace (primary), VS Code Marketplace, Slack
- Content: architectural diff reviews; C4-from-code for JS/TS; preventing drift
- Pilots: 6–12 week co-development; measure PR review gains and onboarding time

---

## Risks & Mitigations
- **Missed edges due to custom HTTP wrappers**: pattern registry; customer adapters; "teach the analyzer" UX
- **PR noise**: severity tuning; allowlists; single concise comment per PR with evidence and fix suggestions
- **Monorepo scale**: incremental diff analysis; parallel scanning; capped depth/fanout in UI
- **Security blockers**: early security brief; data residency; artifact-in-repo mode

---

## Engineering Epics (High-Level)
- **Analysis Engine**: adapters (`http`, `db`, `mq`, `env`), component/container inference, ID strategy, incremental cache
- **Graph Renderer**: L2/L3 view, depth slider, filters, search, evidence overlays, export
- **GitHub Integration**: app install UX, webhook handling, job queue, Check Runs, PR comment worker, secrets
- **Policy System**: graph diff, rule engine, config loader/validator, default packs, mute/allowlist, owners & contexts
- **QA & DX**: golden fixtures, stress tests, CLI for local runs, observability and SLO dashboards

---

## Appendix A: Supported Patterns (v0.1 target)
- **HTTP**: `fetch`, `axios`, `node-fetch`, simple custom wrappers; Next.js routes; TRPC (core patterns)
- **DB**: Drizzle, Prisma, `pg`, `mysql2`, simple raw SQL templates
- **Env**: `process.env.*` usage and mapping
- **Queues**: `bullmq` (surface), `kafkajs` (surface)

---

## Appendix B: Implementation Notes
Detailed implementation guidance, adapter interfaces, and schemas are documented in the [Product Plan](./PRODUCT-PLAN.md). This strategy document intentionally avoids deep technical details to reduce duplication.


