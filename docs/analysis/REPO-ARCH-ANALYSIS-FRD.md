# Repository Architecture Analysis – Functional Requirements & Implementation Approach

Purpose: Define a predictable, consistent, and intelligent analysis pipeline that infers high‑level system components and their connections from a GitHub repository. Start with JS/TS repositories only, using a language‑agnostic architecture that scales to additional languages without tight coupling.

## Scope

- In: Public/private GitHub repos; language detection; JS/TS adapter v1; LLM‑assisted architecture inference; diagram‑ready nodes/edges output; cost/freshness tracking.
- Out (for now): Runtime dynamic tracing, full security SAST, IDE plugins.

## Functional Requirements

- Repository intake
  - Accept GitHub URL and optional token; validate and canonicalize (handles rename/redirect); fetch tree and file contents with retries and size limits.
- Language detection
  - Detect primary and significant languages via file extensions/LOC and/or GitHub Languages API; select the best adapter(s). Start with JS/TS only.
- Entry points & dependency graph
  - Find entry points (package scripts, common main/server files, framework conventions).
  - Build a dependency graph from entry points to depth d (depth slider 1–10; default 3); select analysis files based on centrality/importance; deterministic ordering.
- Signal extraction (language‑agnostic contract)
  - Extract imports/module edges, API calls/endpoints, database usage, environment variables, configuration references, external service usage.
  - De‑emphasize UI/presentation details.
- Evidence aggregation & weighting
  - Weight API calls and env/config higher than imports; DB ops next; UI lowest.
  - Produce confidence and evidence for each inferred component/connection.
- LLM single‑expert analysis
  - Generate architecture nodes/edges and summary from curated files + architectural context; enforce anti‑hallucination rules and deterministic seeds.
- Validation & normalization
  - Merge static and LLM insights; rule‑based coherence checks; threshold‑based filtering by confidence; normalize to canonical component types.
- Outputs
  - Nodes/edges with evidence and confidence; summary; recommendations; detected frameworks/languages; token/cost estimation.
- Freshness & re‑use
  - Track analyzed commit SHA; compare to current; mark analyses stale when commits behind ≥ 3.
- Security & privacy
  - Token least‑privilege; privacy mode to redact content; avoid persisting full source unless required.
- Observability
  - Structured logs, metrics, and error categories per pipeline stage.

## Non‑Functional Requirements

- Scalability: Async jobs; horizontal scale of compute‑intensive stages.
- Extensibility: Pluggable Language Adapter SPI; core is library‑agnostic.
- Determinism: Stable sorting, seeded LLM requests, consistent selection.
- Resilience: AST parsing fallbacks; partial results tolerant.
- Cost control: Pre‑analysis token estimation and budget guardrails.

## Architecture Overview (Multi‑Layered)

1) Repository preprocessing
   - Canonicalize repo; fetch tree; detect languages; collect file metadata.
2) Static analysis layer (adapter‑backed)
   - Identify entry points; build dependency graph; extract signals (APIs/DB/env/config/imports); compute centrality/importance.
3) LLM intelligence layer (single expert)
   - Prompt with architectural context and curated file excerpts; enforce anti‑hallucination and return JSON nodes/edges with evidence + confidence.
4) Hybrid validation & synthesis
   - Merge static + LLM results; rule‑based coherence checks; threshold filtering; architecture classification; normalization for diagramming.

## Language Adapter SPI (Service Provider Interface)

Define a stable, language‑agnostic contract. Core orchestrator depends only on this SPI.

```ts
interface LanguageAdapter {
  id(): string;
  supports(files: RepoFileMeta[]): boolean;
  detectFrameworks?(files: RepoFileMeta[]): string[];
  identifyEntryPoints(files: RepoFile[]): EntryPoint[];
  buildDependencyGraph(files: RepoFile[], entryPoints: EntryPoint[], depth: number): DependencyGraph;
  extractSignals(files: RepoFile[]): Signals; // apiCalls, dbOps, envVars, configRefs, imports, endpoints, externalServices
  resolveModulePath(fromPath: string, specifier: string): string;
}
```

Initial adapter (JS/TS v1): may internally use tree‑sitter, regex, or ecosystem tools (e.g., bundler analyzers). Core never imports language‑specific libraries.

Future adapters: Python (ast/tree‑sitter), Go (go/packages), Java (JavaParser/tree‑sitter), etc.

## File Selection Strategy (Graph‑First)

- Primary: Dependency traversal from entry points to depth d; include hub/central nodes; deterministic order; cap by importance.
- Secondary fallback: Minimal, generic heuristics to ensure coverage of categories (entry, API, data model, config, middleware, integrations).
- Optional (flagged, off by default): LLM‑assisted triage to fill category gaps using only file metadata and extracted signals (no raw code). LLM can only select from the candidate set and cannot introduce new files; deterministic seed applied.

## Confidence & Validation

- Confidence composition: static_score (signals weight) + llm_score (model certainty) − conflicts_penalty.
- Thresholds: filter low‑confidence nodes/edges; expose sliders in UI for expert users.
- Coherence rules: e.g., API server must have at least one endpoint or inbound API calls; DB component requires query evidence.

## Prompting & LLMs

- Single expert persona; anti‑hallucination rules; deterministic seed; strictly structured JSON output.
- Chain‑of‑thought is internal to the model; do not persist intermediate reasoning.
- Support remote (OpenAI) and optional local (Ollama) backends via an abstract LLM client.
  - Current decision: Remote only; local models are out of scope for now.

## Diagram Generation

- Normalize to canonical component types: Client, Server, API Server, Database, Cache, CDN, MQ, Load Balancer, Custom.
- Output format independent of renderer (e.g., Mermaid, Structurizr, custom React canvas). Renderer chosen at UI layer.
  - Current decision: Keep React‑based view only; no exports for now.

## Performance & Cost Controls

- Limits: repository size, per‑file size, selected file count; early exit on budget breach.
- Parallelization: fetch, AST parsing, and graph analysis in parallel where safe.
- Caching: reuse previous analysis for same commit; cache adapter‑level artifacts.
  - Current decision: Token cost guardrails deferred.

## Security & Privacy

- Never store tokens; secure env/config; privacy mode redacts file contents and external URLs as needed.
- Respect robots/security signals where applicable.
  - Current decision: Privacy mode policies deferred.

## Observability

- Emit metrics per stage: files considered/selected, dependency depth, endpoints/db ops found, token estimates/actuals, LLM latency, cache hit rate.
- Structured logs with prompt hashes for reproducibility.

## Phased Delivery Plan

1) Stabilize core and SPI
   - Introduce adapter registry; wrap existing JS/TS logic behind the SPI; keep current behavior.
2) Graph‑first selection & confidence
   - Implement depth slider; unify evidence weights; add confidence and coherence filters.
3) Abstractions for LLM backend
   - Pluggable LLM client (OpenAI now; optional Ollama later); deterministic seeding.
4) Observability & guardrails
   - Metrics, budgets, caching, and error categorization.
5) Second language PoC
   - Add Python adapter with minimal features to validate multi‑language boundaries.

## Open Questions

1) Depth defaults and caps: default 3, cap 10?
2) Confidence weighting: confirm API/env > DB > imports > UI; suggested numeric weights?
3) Privacy mode: what evidence can be stored (paths, endpoints, env var names)? Any PII constraints?
4) Cost guardrail: hard token budget per analysis to auto‑stop?
5) Freshness threshold: <=5 commits behind = fresh?
6) Diagram renderer: continue with existing React canvas; also export Mermaid/Structurizr?
7) Local models: should we support an opt‑in local LLM backend early for privacy/cost?
