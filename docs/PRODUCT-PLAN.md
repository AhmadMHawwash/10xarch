## Product Plan: Continuous Architecture for JS/TS Teams

Last updated: 2025-08-12

### Vision and Positioning
- **Vision**: A code-aware system design workspace that keeps architecture continuously accurate, enforces guardrails in CI, and accelerates onboarding by mapping real repos into C4-style views.
- **Positioning**: Own “continuous architecture” for JS/TS teams with live C4-from-code maps and PR/CI guardrails. Not another static diagramming tool; not generic code search. Focus on mechanisms that prevent drift and reduce risk.

### Scope (Current Focus)
- **Pillar 1**: Typed System Graph + C4-from-code (JS/TS-first).
- **Pillar 2**: CI/PR guardrails + policy packs.
- **Explicit non-goal (for now)**: Simulations of traffic/failure modes. Consider later once the two pillars are mature.

### Ideal Customers and Jobs-To-Be-Done
- **ICPs**
  - Seed–Series B engineering teams growing services and APIs.
  - Tech leads who need consistent architecture reviews and drift prevention.
  - Teams onboarding new engineers into complex JS/TS monorepos.
- **JTBD**
  - **Understand topology quickly**: What services/components exist; how they interact.
  - **Catch architectural risks pre-merge**: Coupling, circular deps, shared DB tables.
  - **Prevent diagram rot**: Keep maps in sync with code and PRs.
  - **Onboard faster**: Repo-grounded guided walkthroughs (vNext).

---

## Pillar 1: Typed System Graph + C4-from-code

### Outcome
- **Deterministic `system-graph.json` per commit** derived from JS/TS code with a depth slider mapping to **C4 L2 (Containers)** and **C4 L3 (Components)**.
- **Stable IDs** and **evidence (file/line spans)** for each node/edge.
- Renders in the app with search, filters, click-to-code, and export.

### Inputs We Analyze (JS/TS-first)
- **Imports**: ES Modules, CommonJS, dynamic imports (heuristics for wrappers).
- **HTTP/API**: `fetch`, `axios`, `api.*`, `trpc`, Next.js `route.ts`, serverless handlers.
- **DB**: Drizzle, Prisma, `pg`, `mysql2`, `mongoose`, and raw SQL (tagged templates).
- **MQ/streams**: `bullmq`, `kafkajs`, `amqplib`, AWS SQS SDK.
- **Env/config**: `process.env.*`, app/runtime configs.
- **Framework hints**: Next.js app/api boundaries, workspaces, `src/server` vs `src/app`.

### Graph Model (v0.1)
- **Nodes**
  - **Context** (optional early): Logical domain boundary.
  - **Container**: Service/app/package (e.g., Next.js app, API service, worker).
  - **Component**: Coherent module group (API client, repository, handler).
- **Edges**
  - **Types**: HTTP, DB, Queue, RPC, FS/Config.
  - **Props**: `paths`, `methods`, `topics`, `tables`, `env`, `external=true/false`.
  - **Evidence**: Files and line spans.

### Example Artifact
```json
{
  "version": "0.1",
  "commit": "<sha>",
  "generatedAt": "2025-08-12T10:00:00Z",
  "nodes": [
    {"id": "container:next-web", "kind": "container", "name": "Next.js App", "tech": "Next.js"},
    {"id": "container:payments-svc", "kind": "container", "name": "Payments Service"}
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
  ],
  "componentMap": {
    "container:next-web": [
      {"id": "component:next-web.auth-client", "name": "Auth API Client", "files": ["src/lib/auth.ts"]}
    ]
  }
}
```

### Depth Slider Mapping
- **Depth 1**: Containers only (C4 L2).
- **Depth 2**: Containers + top components per container (C4 L3).
- **Depth 3+**: Components grouped by feature directories; cap fanout for readability.

### Rendering Requirements (Web UI)
- Depth toggle; filters by edge type, method/topic/table, external/internal.
- Search nodes; click-to-code (open file at line); evidence popovers.
- Export: PNG/SVG/JSON.

### Engine Design (High-Level)
- **Scanners**: Modular adapters for `http`, `db`, `mq`, `env` with a pattern registry.
- **AST + heuristics**: Use AST where possible; fall back to regex for known wrappers.
- **Container inference**: Workspaces, server vs client boundaries, Next.js routing.
- **Deterministic IDs**: Derived from file paths and semantic roles.
- **Incremental analysis**: File-hash cache; analyze only changed files; reuse base graph for PRs.

### Acceptance Criteria (v0.1)
- Works on 80% of typical JS/TS repos; container map produced in < 2 minutes.
- Every edge includes at least one evidence link.
- Deterministic output for the same commit; stable IDs across runs.
- Monorepo support via workspaces.

### Test Plan
- **Golden tests**: Repos for Next.js app, API routes, Prisma/Drizzle, axios/fetch, trpc, bullmq.
- **Fixture compare**: `system-graph.json` should match checked-in fixtures.
- **Performance harness**: Ensure SLOs are met on sample large repos.

### Risks & Mitigations
- **Custom HTTP wrappers** → Pattern registry and customer adapters; fallback heuristics.
- **Dynamic imports** → Conservative inference with evidence; allow user hints in config.
- **False positives** → Evidence-first UX; ability to mute/override mappings.

---

## Pillar 2: CI/PR Guardrails + Policy Packs

### Outcome
- GitHub App posts architectural diffs and policy results on each PR, with Check Runs to warn/block based on severity. Configurable via repo/org policy file.

### Event Flow
- On `pull_request` opened/synchronized:
  - Compute System Graph for base and head (incremental analysis by diff).
  - Diff nodes/edges; evaluate policies; post Check Run + one summary comment.
- On `push` to default branch:
  - Generate and cache `system-graph.json` for the commit; optionally commit artifact to repo.

### Initial Policy Pack (v0.1)
- **no-circular-deps**: File/module-level and container-level cycles.
- **no-cross-context-coupling**: New edges across contexts (contexts optional early).
- **no-shared-db-table-writes**: Multiple containers writing to same table.
- **external-api-ownership**: New third-party domains without owner mapping.
- **secret-handling**: Hardcoded tokens or insecure secret usage in client bundles.
- **fanout-threshold**: Excessive increase in sync HTTP edges from a container.

### Policy Config Example
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

### PR Comment Template (Outline)
- **Architectural diff**: Nodes/edges added/removed; context crossings; summary counts.
- **Policy violations**: Grouped by severity; each with evidence (file/line) and suggested remediation.
- **Commands**: `mute rule`, `reclassify container`, `assign owner` to external API.

### GitHub App Permissions
- Contents: read; Checks: write; Pull requests: read; Issues/comments: write; Installations: read.

### Acceptance Criteria (v0.2 target)
- P95 PR check under 60 seconds on medium repos.
- Each violation links to at least one file/line of evidence.
- Mute/allowlist respected via config; false-positive rate < 10% with tunables.

### Telemetry
- Violations per PR; mute actions; rule hit rates; estimated time saved.

---

## Platform and Operations

### Processing
- Queue jobs per repo installation; dedupe by head SHA.
- Caching: file-hash → observations; commit → system graph artifact.

### Storage
- `system-graph.json` blobs keyed by commit; optional bot-commit to repo.
- Org/repo settings; policy files; audit logs of rule changes.

### Security & Privacy
- Scoped tokens; encrypt at rest/in transit; ephemeral worker sandboxes.
- Optional “artifact-in-repo-only” mode for enterprises.

### Performance SLOs
- First map < 2 minutes; PR check < 60 seconds (P95).

---

## Roadmap (0–90 Days)

### 0–30 days (v0.1: Graph + UI)
- **Analysis engine**: Scanners for imports, HTTP, DB, env; observation bus; graph aggregator.
- **Graph**: Deterministic IDs; evidence linking; serialization; artifact storage.
- **UI**: C4 L2/L3 render; search; filters; click-to-code; export.
- **Tests**: Golden fixtures; performance harness.
- **Docs**: Supported patterns; how to extend the registry.

### 31–60 days (v0.2: CI/PR Guardrails)
- **GitHub App**: Checks API; PR event handling; incremental analysis by diff.
- **Diff + policy**: Graph diff engine; default policy pack; config loader/validator.
- **PR UX**: Single concise comment; status checks; mute/allowlist; owners map; contexts.
- **Telemetry**: Rule hit rates and engagement metrics.

### 61–90 days (Hardening + Pilots)
- **Reliability**: False-positive reductions; rule tuning; more adapters (trpc, queue libs).
- **Enterprise readiness**: SSO stub; audit logs; data retention options.
- **Pilots**: 5–10 teams; measure PR review improvements and onboarding time.

---

## Go-To-Market and Pricing

### Packaging
- **Free**: Manual graph runs for 1 repo; basic UI.
- **Pro**: Auto-sync, CI/PR checks, policy packs, Slack alerts.
- **Team**: Org policies, SSO, audit logs, optional private hosting.

### Channels
- GitHub Marketplace (primary); VS Code Marketplace; Slack App Directory.
- Content: “Architectural diff reviews,” “C4-from-code for JS/TS,” “Preventing drift.”

### Sales Motion
- Bottoms-up adoption via individuals; convert to team via PR guardrail value.
- Founder-led sales for Team tier; security review packet for enterprise prospects.

---

## Metrics and Proof of Value
- **Activation**: Time-to-first-map; first PR check enabled.
- **Engagement**: Weekly active repos; PR comment open/click rates; actions taken.
- **Outcome**: Reduced review time; fewer post-merge rollbacks due to coupling errors; onboarding time reduction.
- **Quality**: False-positive rate; mute usage; remediation success.

---

## Risks and Mitigations
- **Shallow/slow analysis** → JS/TS excellence first; incremental diff analysis; clear unsupported patterns.
- **PR noise** → Severity tuning; allowlists; single-comment strategy; evidence links and fix suggestions.
- **Diagram rot** → Artifact versioning; CI-in-loop updates; future runtime overlay.
- **Security blockers** → Least-privilege tokens; encryption; enterprise “repo-only artifacts.”
- **Competition** → Differentiate with in-repo typed artifacts, CI guardrails, and depth in JS/TS analysis.

---

## Implementation Notes (Developer-Facing)

### Types and Schemas (Draft)
```ts
// system-graph.ts
export type GraphNodeKind = 'context' | 'container' | 'component';

export interface GraphEvidence {
  file: string;
  lines: [number, number];
}

export interface GraphNodeBase {
  id: string;          // stable, deterministic
  kind: GraphNodeKind;
  name: string;
  tech?: string;
  evidence?: GraphEvidence[];
}

export interface GraphEdge {
  id: string;          // stable, deterministic
  from: string;        // node id
  to: string;          // node id
  type: 'HTTP' | 'DB' | 'QUEUE' | 'RPC' | 'FS' | 'CONFIG';
  paths?: string[];
  methods?: string[];
  topics?: string[];
  tables?: string[];
  env?: string[];
  external?: boolean;
  evidence: GraphEvidence[];
}

export interface SystemGraph {
  version: string;
  commit: string;
  generatedAt: string;
  nodes: GraphNodeBase[];
  edges: GraphEdge[];
  componentMap?: Record<string, GraphNodeBase[]>; // containerId -> components
}
```

```ts
// system-graph.policy.ts
export type RuleLevel = 'off' | 'warn' | 'error';

export interface PolicyRuleConfig {
  level: RuleLevel;
  [key: string]: unknown;
}

export interface SystemGraphPolicy {
  $schema?: string;
  extends?: string[];
  rules: Record<string, PolicyRuleConfig>;
  contexts?: {
    containers?: Record<string, string>; // containerId -> context name
  };
}
```

### AST Adapter Interfaces (Draft)
```ts
// analyzer-adapters.ts
export interface FileObservation {
  kind: 'http' | 'db' | 'mq' | 'env' | 'import';
  metadata: Record<string, unknown>; // paths, methods, tables, topics, env, domains
  evidence: { file: string; lines: [number, number] };
}

export interface AnalyzerAdapter {
  name: string;
  match(filename: string, content: string): boolean;
  extract(content: string): FileObservation[];
}
```

### Integration Points
- Hook AST adapters into existing extraction points like `src/lib/github/simple-ast.ts` (e.g., `extractAPIEndpoints`, `extractDatabaseQueries`, `extractEnvUsage`) to produce normalized observations consumed by the graph aggregator.

---

## Backlog (Post v0.2)
- Runtime overlay (OpenTelemetry/Datadog) for drift detection and reality overlays.
- Repo onboarding assistant with guided flows and “read next” sequences.
- Additional languages beyond JS/TS (after leadership is established in JS/TS).

---

## Glossary
- **C4 Model**: A visual notation for software architecture across Context, Containers, Components, and Code.
- **System Graph**: Typed, versioned representation of containers, components, and their edges with evidence.
- **Policy Pack**: Set of rules that evaluate graph diffs to catch risks during PRs.


