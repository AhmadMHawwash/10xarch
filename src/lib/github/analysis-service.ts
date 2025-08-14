import type { AnalysisFile, GitHubRepoInfo } from './github-service';
import { openai } from '@/lib/openai';
import { z } from 'zod';

type ComponentNode = {
  id: string;
  name: string;
  displayName?: string;
  confidence: number;
  type?: string;
};

type ComponentEdge = {
  id: string;
  source: string;
  target: string;
  confidence: number;
  data?: { label?: string };
};

type AnalysisResult = {
  nodes?: ComponentNode[];
  edges?: ComponentEdge[];
  summary?: string;
  architecture?: { type: string; confidence: number; description?: string };
  estimatedCosts?: { tokensUsed?: number };
  [key: string]: unknown;
};

export class AnalysisService {
  async analyzeRepository(
    files: AnalysisFile[],
    _repoInfo: GitHubRepoInfo,
    _mode?: unknown,
    _architecturalContext?: string
  ): Promise<AnalysisResult> {
    const DEBUG = true;
    const log = (...args: unknown[]) => { if (DEBUG) console.log('[ANALYZER]', ...args); };
    // Try LLM-based analysis first; fall back to heuristic if it fails
    const context = safeParseJson<Record<string, unknown>>(_architecturalContext) ?? {};
    const ast = (context.astInsights ?? {}) as { frameworks?: string[]; apiEndpoints?: Array<{ method?: string; path?: string }>; hasDatabase?: boolean };
    const frameworks: string[] = (context.frameworksDetected as string[] | undefined) ?? ast.frameworks ?? [];
    const apiEndpoints: Array<{ method?: string; path?: string }> = (context.apiEndpointsFound as Array<{ method?: string; path?: string }> | undefined) ?? ast.apiEndpoints ?? [];
    const hasDatabase = Boolean((context.databaseUsage as boolean | undefined) ?? ast.hasDatabase ?? false);
    // Detect plugin directories for repos like Electron apps
    const pluginDirs = detectPluginDirs(files);
    const isElectron = files.some(f => /electron|preload|main\.(ts|js)|electron-builder\.yml|electron\.vite/i.test(f.path));
    log('context', { frameworks, apiEndpoints: apiEndpoints.length, hasDatabase, isElectron, pluginDirs: pluginDirs.slice(0, 12) });

    try {
      contextRef = context; // allow buildUserPrompt to include upstream summaries
      const userContent = buildUserPrompt({ files, frameworks, apiEndpoints, hasDatabase });
      console.log('userContent----', userContent);
      // Deterministic seed: derive from architectural context + file manifest so same repo@state yields stable ids
      const stableSeed = computeDeterministicSeed(
        JSON.stringify({ ctx: context, manifestHash: simpleHash(userContent) })
      );
      const completion = await openai.chat.completions.create({
        model: 'gpt-5-nano',
        seed: stableSeed,
        messages: [
          { role: 'system', content: LLM_SYSTEM_INSTRUCTION },
          { role: 'user', content: userContent },
        ],
      });
      const content = completion.choices[0]?.message?.content ?? '';
      log('usage', completion.usage, 'finish_reason', completion.choices[0]?.finish_reason);
      log('modelContentSnippet', content);
      console.log('modelContentSnippet----', JSON.stringify(completion.choices[0]?.message, null, 2));
      const parsed = parseModelJson(content);
      if (parsed) {
        // Guard: ensure ids are non-empty; start with raw nodes
        const initialNodes = parsed.nodes.filter((n) => Boolean(n.id));

        // Preserve distinct nodes; lightly normalize ids but DO NOT merge
        const { nodes, edges } = canonicalizeNodesAndEdges(initialNodes, parsed.edges);
        const nodeIdSet = new Set(nodes.map(n => n.id));

        // Merge deterministic plugin nodes if any (attach to canonical server/client)
        const attachServerId = pickPrimaryServerId(nodes) ?? ensureCanonicalCoreNode(nodes, 'server');
        const attachClientId = ensureCanonicalCoreNode(nodes, 'client');
        if (pluginDirs.length) {
          const pluginAdditions = materializePluginNodes(pluginDirs, isElectron ? attachClientId : attachServerId);
          for (const n of pluginAdditions.nodes) if (!nodeIdSet.has(n.id)) { nodes.push(n); nodeIdSet.add(n.id); }
          edges.push(...pluginAdditions.edges
            .map(e => ({ ...e, source: e.source === 'server' ? attachServerId : (e.source === 'client' ? attachClientId : e.source) }))
          );
        }

        // Deterministic enrichments: APIs and external services
        if (apiEndpoints.length) {
          // enrich API nodes with up to 3 top example endpoints for display
          const apiAdds = materializeApiNodes(apiEndpoints, attachServerId);
          // Attach example list into node name/displayName for better UX
          for (const n of apiAdds.nodes) {
            const seg = (n.displayName ?? '').replace(/^\//, '');
            const examples = apiEndpoints
              .filter(ep => (ep.path ?? '/').split('/').filter(Boolean)[0] === seg)
              .slice(0, 3)
              .map(ep => `${(ep.method ?? 'GET').toUpperCase()} ${(ep.path ?? '/').replace(/\?.*$/, '')}`);
            if (examples.length > 0) {
              n.name = 'API';
              n.displayName = `/${seg} — ${examples.join(', ')}`.slice(0, 80);
              // attach examples for UI details
              (n as unknown as { examples?: string[] }).examples = examples;
            }
          }
          for (const n of apiAdds.nodes) if (!nodeIdSet.has(n.id)) { nodes.push(n); nodeIdSet.add(n.id); }
          edges.push(...apiAdds.edges.filter(e => nodeIdSet.has(e.source) && nodeIdSet.has(e.target)));

          // Create leaf nodes under each API group (limited) for richer visibility
          try {
            const leafAdds = materializeApiLeafNodes(apiEndpoints, apiAdds.nodes.map(n => n.id));
            for (const n of leafAdds.nodes) if (!nodeIdSet.has(n.id)) { nodes.push(n); nodeIdSet.add(n.id); }
            edges.push(...leafAdds.edges.filter(e => nodeIdSet.has(e.source) && nodeIdSet.has(e.target)));
          } catch {}
        }

        const envVars = (context.environmentVariables as string[] | undefined) ?? [];
        if (envVars.length) {
          const extAdds = materializeExternalServiceNodes(envVars, attachServerId);
          for (const n of extAdds.nodes) if (!nodeIdSet.has(n.id)) { nodes.push(n); nodeIdSet.add(n.id); }
          edges.push(...extAdds.edges.map(e => ({ ...e, source: attachServerId })));
        }

        // Enrich tRPC group with router names if provided by context
        try {
          const routers: string[] = Array.isArray((contextRef as { trpcRouters?: unknown })?.trpcRouters)
            ? ((contextRef as { trpcRouters?: unknown }).trpcRouters as string[])
            : [];
          if (routers.length > 0) {
            // Find API group nodes that likely represent tRPC
            for (const n of nodes) {
              const dn = (n.displayName ?? '').toLowerCase();
              if (n.type === 'endpoint-group' || /trpc/.test(dn)) {
                const label = `tRPC: ${routers.slice(0, 5).join(', ')}`;
                n.displayName = n.displayName ? `${n.displayName} • ${label}`.slice(0, 100) : label;
                (n as unknown as { trpcRouters?: string[] }).trpcRouters = routers.slice(0, 8);
              }
            }
          }
        } catch {}

        // Add explicit service-layer nodes when evidence suggests (Next.js, tRPC)
        try {
          const frameworksSet = new Set(frameworks.map(f => f.toLowerCase()));
          const hasNext = Array.from(frameworksSet).some(f => f.includes('next'));
          const trpcRouters: string[] = Array.isArray((contextRef as { trpcRouters?: unknown })?.trpcRouters)
            ? ((contextRef as { trpcRouters?: unknown }).trpcRouters as string[])
            : [];
          let nextServerId: string | null = null;
          if (hasNext) {
            nextServerId = ensureOrGetNode(nodes, 'nextjs-server', 'Next.js Server', 0.85, 'service');
            if (!nodeIdSet.has(nextServerId)) nodeIdSet.add(nextServerId);
            // wire client->nextjs-server (do not duplicate if already present)
            if (!edges.some(e => e.source === attachClientId && e.target === nextServerId)) {
              edges.push({ id: `${attachClientId}->${nextServerId}:${edges.length}` , source: attachClientId, target: nextServerId, confidence: 0.8, data: { label: isElectron ? 'IPC' : 'HTTP' } });
            }
          }
          if (trpcRouters.length > 0) {
            const trpcId = ensureOrGetNode(nodes, 'trpc-api-server', 'tRPC API Server', 0.85, 'service');
            if (!nodeIdSet.has(trpcId)) nodeIdSet.add(trpcId);
            // connect next→trpc or server→trpc
            const fromId = nextServerId ?? attachServerId;
            if (fromId !== trpcId && !edges.some(e => e.source === fromId && e.target === trpcId)) {
              edges.push({ id: `${fromId}->${trpcId}:${edges.length}`, source: fromId, target: trpcId, confidence: 0.8, data: { label: 'HTTP' } });
            }
          }
        } catch {}

        // Hybrid backfill using static data when available in context
        try {
          const cref = contextRef as unknown;
          const staticDataFlow = ((): Array<{ from?: string; to?: string; via?: string; confidence?: number }> => {
            if (!cref || typeof cref !== 'object') return [];
            const maybe = (cref as { staticDataFlow?: unknown }).staticDataFlow;
            return Array.isArray(maybe) ? maybe as Array<{ from?: string; to?: string; via?: string; confidence?: number }> : [];
          })();
          const haveEdge = new Set(edges.map(e => `${e.source}->${e.target}`));
          const pushEdge = (src: string, dst: string, label: string, conf = 0.6) => {
            if (src && dst && src !== dst && nodeIdSet.has(src) && nodeIdSet.has(dst)) {
              const key = `${src}->${dst}`;
              if (!haveEdge.has(key)) {
                edges.push({ id: `${src}->${dst}:${edges.length}`, source: src, target: dst, confidence: conf, data: { label } });
                haveEdge.add(key);
              }
            }
          };
          // Ensure client->server
          pushEdge(attachClientId, attachServerId, isElectron ? 'IPC' : 'HTTP', 0.7);
          // Server->db if DB node exists
          if (nodeIdSet.has('db')) pushEdge(attachServerId, 'db', 'queries', 0.65);
          // Use static dataflow to add hints
          for (const df of staticDataFlow) {
            const from = canonicalCoreId((df.from ?? '').toLowerCase());
            const to = canonicalCoreId((df.to ?? '').toLowerCase());
            const via = df.via ?? 'link';
            const conf = Math.max(0.5, Math.min(0.95, (df.confidence ?? 60) / 100));
            if (from && to && nodeIdSet.has(from) && nodeIdSet.has(to)) {
              pushEdge(from, to, via, conf);
            }
          }
        } catch {}

        // Confidence and coherence adjustments + filtering
        try {
          const adjusted = enforceCoherenceAndConfidence({
            nodes,
            edges,
            facts: {
              hasDatabase,
              apiEndpointCount: apiEndpoints.length,
              staticDataFlowCount: Array.isArray((contextRef as { staticDataFlow?: unknown })?.staticDataFlow)
                ? ((contextRef as { staticDataFlow?: unknown }).staticDataFlow as unknown[]).length
                : 0,
            },
          });
          nodes.splice(0, nodes.length, ...adjusted.nodes);
          edges.splice(0, edges.length, ...adjusted.edges);
        } catch {}

        return {
          nodes,
          edges,
          summary: enhanceSummary(parsed.summary, { frameworks, apiCount: apiEndpoints.length, hasDatabase }),
          architecture: parsed.architecture ?? deriveArchitecture({ isElectron, frameworks }),
          estimatedCosts: { tokensUsed: estimateTokens(files) },
          fileCount: files.length,
        };
      }
      log('parse_failed_falling_back');
    } catch (err) {
      // Swallow and fallback
      // eslint-disable-next-line no-console
      console.warn('[AnalysisService] LLM analysis failed, using heuristic', err);
    }

    // Heuristic fallback
    return buildHeuristicResult({ frameworks, apiEndpoints, hasDatabase, files, pluginDirs, isElectron });
  }
}

function safeParseJson<T = any>(s?: string): T | null {
  if (!s || typeof s !== 'string') return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function estimateTokens(files: AnalysisFile[]): number {
  // Super rough heuristic: ~4 chars per token
  let chars = 0;
  for (const f of files) {
    if (typeof f.content === 'string') chars += f.content.length;
  }
  return Math.min(500_000, Math.ceil(chars / 4));
}

function buildSummary(opts: { frameworks: string[]; hasDatabase: boolean; apiCount: number }): string {
  const parts: string[] = [];
  if (opts.frameworks.length) parts.push(`Frameworks: ${opts.frameworks.join(', ')}`);
  parts.push(`API endpoints detected: ${opts.apiCount}`);
  parts.push(`Database: ${opts.hasDatabase ? 'yes' : 'no'}`);
  return parts.join(' · ');
}

// ---- LLM helpers ----

const LLM_SYSTEM_INSTRUCTION = `You are a precise system architecture extractor.
Return ONLY JSON (no prose) matching this schema:
{
  "nodes": Array<{ id: string; name: string; displayName?: string; confidence: number }>,
  "edges": Array<{ id: string; source: string; target: string; confidence: number; data?: { label?: string } }>,
  "summary"?: string,
  "architecture"?: { type: string; confidence: number }
}

Hard rules:
- Node ids: stable, lowercase slugs without spaces. Canonical set:
  client, server, db, cache, cdn, mq, lb, api-<group>, ext-<service>
  Examples: api-users, api-auth, ext-stripe, ext-sentry
- Edge integrity: every edge.source and edge.target MUST match a nodes[].id.
- Always include core path: client, server, and an edge client→server (label: "HTTP" unless Electron is indicated, then "IPC").
- If a database is indicated, include db and edge server→db (label: "queries").
- Group HTTP endpoints by first URL segment into 1–6 API nodes:
  • Each API node must be: { id: "api-<group>", name: "API", displayName: "/<group> — up to 3 examples like 'GET /<path>', 'POST /<path>'" }
  • Example: displayName: "/users — GET /api/users, POST /api/users, GET /api/users/:id"
- If tRPC routers are indicated in context, append " • tRPC: routerA, routerB" to the API node displayName for that group.
- External services from env/config: create ext-<service> nodes (name: "External Service", displayName: "<Service>") and edge server→ext-<service> (label: "API").
- Do NOT include framework nodes (Next.js, Drizzle, tRPC) as separate nodes; focus on system flows.
- Keep confidence values in [0, 1]. Do not invent components without evidence.

Allowed edge labels in data.label: "HTTP", "IPC", "queries", "webhook", "API".`;

function buildUserPrompt(input: {
  files: AnalysisFile[];
  frameworks: string[];
  apiEndpoints: Array<{ method?: string; path?: string }>;
  hasDatabase: boolean;
}): string {
  const manifest = buildCompactManifest(input.files, 30, 600);
  const endpointSample = input.apiEndpoints.slice(0, 20).map((e) => `${(e.method ?? 'GET').toUpperCase()} ${e.path ?? '/'}`).join('\n');
  const electronSignals = input.files.some(f => /electron|preload|main\.(ts|js)|electron-builder\.yml|electron\.vite/i.test(f.path))
    ? 'Electron app detected: yes' : 'Electron app detected: unknown';
  // Pull in optional backend summaries if present in context (added upstream)
  const depSummary = contextRef && typeof contextRef === 'object' && (contextRef).dependencyGraphSummary
    ? safeStringify((contextRef).dependencyGraphSummary)
    : '';
  const dirSummary = contextRef && typeof contextRef === 'object' && (contextRef).directorySummary
    ? safeStringify((contextRef).directorySummary)
    : '';
  const pluginSummary = summarizePlugins(input.files);
  return [
    `Frameworks: ${input.frameworks.join(', ') || 'unknown'}`,
    `Database: ${input.hasDatabase ? 'yes' : 'no'}`,
    electronSignals,
    depSummary ? `Dependency summary: ${depSummary}` : '',
    dirSummary ? `Directory summary: ${dirSummary}` : '',
    pluginSummary ? `Plugins detected: ${pluginSummary}` : '',
    `Endpoint sample (up to 20):\n${endpointSample || '(none detected)'}`,
    `Code manifest (top files, truncated):\n${manifest}`,
    `Infer key components and connections as per schema. Output JSON only.`,
  ].join('\n\n');
}

function buildCompactManifest(files: AnalysisFile[], maxFiles: number, maxCharsPerFile: number): string {
  // Prefer entry-like files (paths containing api, route, server, index) first
  const score = (p: string) => (/\b(api|route|server|index|main|app|electron|preload|renderer)\b/i.test(p) ? 2 : 0) - p.length * 0.0001;
  const picked = [...files]
    .filter((f) => typeof f.content === 'string' && f.content.length > 0)
    .sort((a, b) => score(b.path) - score(a.path))
    .slice(0, Math.max(1, Math.min(maxFiles, files.length)));
  return picked
    .map((f) => {
      const snippet = String(f.content).slice(0, maxCharsPerFile).replace(/```/g, '');
      return `### ${f.path}\n${snippet}`;
    })
    .join('\n\n');
}

// This reference will be set before buildUserPrompt is called
let contextRef: Record<string, unknown> | null = null;
function safeStringify(obj: unknown): string {
  try { return obj ? JSON.stringify(obj).slice(0, 1000) : ''; } catch { return ''; }
}

// Simple deterministic 32-bit hash for seeds
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0; // 32-bit
  }
  return h >>> 0; // unsigned
}

function computeDeterministicSeed(s: string): number {
  // Constrain to [0, 2^31-1]
  return simpleHash(s) & 0x7fffffff;
}

function detectPluginDirs(files: AnalysisFile[]): string[] {
  const set = new Set<string>();
  for (const f of files) {
    const m = f.path.match(/^src\/(plugins|extensions)\/([^\/]+)/i);
    if (m) set.add(`${m[1]}/${m[2]}`);
  }
  return Array.from(set);
}

function summarizePlugins(files: AnalysisFile[]): string {
  const dirs = detectPluginDirs(files);
  return dirs.slice(0, 12).join(', ');
}

function materializePluginNodes(pluginDirs: string[], attachToId: string) {
  const nodes: ComponentNode[] = [];
  const edges: ComponentEdge[] = [];
  for (let i = 0; i < Math.min(pluginDirs.length, 12); i += 1) {
    const dir = pluginDirs[i]!;
    const id = `plugin-${dir.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
    nodes.push({ id, name: 'Plugin', displayName: dir, confidence: 0.6, type: 'plugin' });
    edges.push({ id: `${attachToId}->${id}`, source: attachToId, target: id, confidence: 0.6, data: { label: 'extension' } });
  }
  return { nodes, edges };
}

function materializeApiNodes(apiEndpoints: Array<{ method?: string; path?: string }>, attachToId: string) {
  const grouped: Record<string, number> = {};
  for (const ep of apiEndpoints) {
    const path = (ep.path ?? '/').replace(/\?.*$/, '');
    const seg = path.split('/').filter(Boolean)[0] ?? 'root';
    grouped[seg] = (grouped[seg] ?? 0) + 1;
  }
  const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const nodes: ComponentNode[] = [];
  const edges: ComponentEdge[] = [];
  entries.forEach(([seg], idx) => {
    const id = `api-${seg}`;
    nodes.push({ id, name: 'API', displayName: `/${seg}`, confidence: 0.7, type: 'endpoint-group' });
    edges.push({ id: `${attachToId}->${id}-${idx}`, source: attachToId, target: id, confidence: 0.7, data: { label: 'HTTP' } });
  });
  return { nodes, edges };
}

function materializeApiLeafNodes(apiEndpoints: Array<{ method?: string; path?: string }>, parentIds: string[]) {
  const nodes: ComponentNode[] = [];
  const edges: ComponentEdge[] = [];
  // Build a map from group -> parent id
  const byGroup: Record<string, string> = {};
  for (const pid of parentIds) {
    const group = pid.replace(/^api-/, '');
    byGroup[group] = pid;
  }
  let count = 0;
  for (const ep of apiEndpoints) {
    const path = (ep.path ?? '/').replace(/\?.*$/, '');
    const seg = path.split('/').filter(Boolean)[0] ?? 'root';
    const parent = byGroup[seg];
    if (!parent) continue;
    const id = `api-leaf-${seg}-${Math.abs(simpleHash(`${ep.method}:${path}`)).toString(36).slice(0,6)}`;
    nodes.push({ id, name: 'API Endpoint', displayName: `${(ep.method ?? 'GET').toUpperCase()} ${path}`.slice(0, 80), confidence: 0.65, type: 'endpoint' });
    edges.push({ id: `${parent}->${id}`, source: parent, target: id, confidence: 0.7, data: { label: 'HTTP' } });
    count += 1;
    if (count >= 24) break; // cap
  }
  return { nodes, edges };
}

function materializeExternalServiceNodes(envVars: string[], attachToId: string) {
  const candidates = [
    { key: 'STRIPE', name: 'Stripe' },
    { key: 'SUPABASE', name: 'Supabase' },
    { key: 'SENTRY', name: 'Sentry' },
  ];
  const nodes: ComponentNode[] = [];
  const edges: ComponentEdge[] = [];
  for (const c of candidates) {
    if (envVars.some(v => v.includes(c.key))) {
      const id = `ext-${c.name.toLowerCase()}`;
      nodes.push({ id, name: 'External Service', displayName: c.name, confidence: 0.6, type: 'external' });
      edges.push({ id: `${attachToId}->${id}`, source: attachToId, target: id, confidence: 0.6, data: { label: 'API' } });
    }
  }
  return { nodes, edges };
}

function deriveArchitecture(opts: { isElectron: boolean; frameworks: string[] }) {
  if (opts.isElectron) return { type: 'desktop (Electron)', confidence: 0.6 };
  if (opts.frameworks.some(f => /next/i.test(f))) return { type: 'web-app (Next.js)', confidence: 0.6 };
  return { type: 'service', confidence: 0.5 };
}

function enhanceSummary(summary: string | undefined, facts: { frameworks: string[]; apiCount: number; hasDatabase: boolean }): string {
  const factLine = `Frameworks: ${facts.frameworks.join(', ') || 'unknown'} · API endpoints: ${facts.apiCount} · Database: ${facts.hasDatabase ? 'yes' : 'no'}`;
  if (!summary || summary.length < 40) return factLine;
  return `${summary}${summary.endsWith('.') ? '' : '.'} ${factLine}`;
}

// --- Phase 1 helpers: canonicalization and safe attachment ---
function canonicalCoreId(raw: string): string {
  const id = raw.trim().toLowerCase();
  if (/^(client|frontend|renderer|ui)$/.test(id)) return 'client';
  if (/^(server|backend|api-server|application-server|app-server|main|webserver)$/.test(id)) return 'server';
  if (/^(db|database|datasource|postgres|mysql|sqlite|mongodb)$/.test(id)) return 'db';
  if (/^(cache|redis|memcached)$/.test(id)) return 'cache';
  return id;
}

function ensureCanonicalCoreNode(nodes: Array<{ id: string; name: string; confidence: number; type?: string }>, coreId: 'client' | 'server' | 'db' | 'cache'): string {
  const exists = nodes.find(n => n.id === coreId);
  if (exists) return coreId;
  const displayName = coreId === 'db' ? 'Database' : (coreId.charAt(0).toUpperCase() + coreId.slice(1));
  nodes.push({ id: coreId, name: displayName, confidence: 0.7, type: coreId === 'db' ? 'database' : (coreId === 'cache' ? 'cache' : coreId) });
  return coreId;
}

function ensureOrGetNode(
  nodes: Array<{ id: string; name: string; confidence: number; type?: string; displayName?: string }>,
  id: string,
  name: string,
  confidence: number,
  type?: string
): string {
  const found = nodes.find(n => n.id === id);
  if (found) return found.id;
  nodes.push({ id, name, confidence, type, displayName: name });
  return id;
}

function pickPrimaryServerId(nodes: Array<{ id: string; name: string; displayName?: string }>): string | null {
  // Prefer a Next.js or app server if present, else any server-like node
  const prefer = nodes.find(n => /next|server|app/i.test(n.name) || /next/i.test(n.displayName ?? ''));
  return prefer ? prefer.id : null;
}

function canonicalizeNodesAndEdges(nodesIn: Array<{ id: string; name: string; displayName?: string; confidence: number; type?: string }>,
  edgesIn: Array<{ id: string; source: string; target: string; confidence: number; data?: { label?: string } }>
): { nodes: Array<{ id: string; name: string; displayName?: string; confidence: number; type?: string }>; edges: Array<{ id: string; source: string; target: string; confidence: number; data?: { label?: string } }> } {
  const idMap = new Map<string, string>();
  const normalized: Array<{ id: string; name: string; displayName?: string; confidence: number; type?: string }> = [];
  for (const n of nodesIn) {
    const canon = canonicalCoreId(n.id);
    // Do not merge; only normalize id if it differs, but keep original id as displayName if helpful
    const normId = canon === n.id ? n.id : `${canon}-${Math.abs(simpleHash(n.id)).toString(36).slice(0,4)}`;
    idMap.set(n.id, normId);
    normalized.push({ ...n, id: normId });
  }
  // Ensure core nodes exist for enrichments
  ensureCanonicalCoreNode(normalized, 'server');
  ensureCanonicalCoreNode(normalized, 'client');

  const edgesOut = edgesIn.map(e => ({
    ...e,
    source: idMap.get(e.source) ?? canonicalCoreId(e.source),
    target: idMap.get(e.target) ?? canonicalCoreId(e.target),
  }));
  // De-duplicate edges by (source,target,label)
  const edgeSeen = new Set<string>();
  const deduped: typeof edgesOut = [];
  for (const e of edgesOut) {
    const key = `${e.source}->${e.target}:${e.data?.label ?? ''}`;
    if (!edgeSeen.has(key)) { edgeSeen.add(key); deduped.push(e); }
  }
  return { nodes: normalized, edges: deduped };
}

function enforceCoherenceAndConfidence(input: {
  nodes: Array<{ id: string; name: string; displayName?: string; confidence: number; type?: string }>;
  edges: Array<{ id: string; source: string; target: string; confidence: number; data?: { label?: string } }>;
  facts: { hasDatabase: boolean; apiEndpointCount: number; staticDataFlowCount: number };
}): {
  nodes: Array<{ id: string; name: string; displayName?: string; confidence: number; type?: string }>;
  edges: Array<{ id: string; source: string; target: string; confidence: number; data?: { label?: string } }>;
} {
  const nodes = [...input.nodes];
  const edges = [...input.edges];
  const nodeById = new Map(nodes.map(n => [n.id, n] as const));
  const incident = new Map<string, number>();
  for (const n of nodes) incident.set(n.id, 0);
  for (const e of edges) {
    incident.set(e.source, (incident.get(e.source) ?? 0) + 1);
    incident.set(e.target, (incident.get(e.target) ?? 0) + 1);
  }
  // Boost confidence for edges with labels from static data or API indications
  for (const e of edges) {
    if (e.data?.label && /http|ipc|queries|external|api/i.test(e.data.label)) {
      e.confidence = Math.min(0.95, Math.max(e.confidence, 0.7));
    }
  }
  // Loosen filtering: keep nodes with any API/DB/external evidence even if confidence is low
  const CORE = new Set(['client','server','db']);
  const hasEvidence = (n: { id: string; name: string; displayName?: string }): boolean => {
    const id = n.id.toLowerCase();
    const name = (n.displayName ?? n.name).toLowerCase();
    return /api|endpoint|ext-|stripe|redis|sentry|openai|github|backup|queue|mq/.test(id + ' ' + name);
  };
  const filteredNodes = nodes.filter(n => CORE.has(n.id) || (n.confidence ?? 0) >= 0.25 || hasEvidence(n));
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));
  // If DB is expected by facts but missing, keep any DB-like node even if low confidence
  if (input.facts.hasDatabase && !filteredNodeIds.has('db')) {
    const dbLike = nodes.find(n => /db|database|postgres|mysql|mongo|sqlite/i.test(n.id));
    if (dbLike) {
      filteredNodes.push(dbLike);
      filteredNodeIds.add(dbLike.id);
    }
  }
  // Ensure at least one API/external node is kept if evidence suggests APIs
  if (input.facts.apiEndpointCount > 0) {
    const hasApiNode = filteredNodes.some(n => /api|endpoint/i.test((n.displayName ?? n.name).toLowerCase()));
    if (!hasApiNode) {
      const candidate = nodes.find(n => /api|endpoint/i.test((n.displayName ?? n.name).toLowerCase()));
      if (candidate && !filteredNodeIds.has(candidate.id)) filteredNodes.push(candidate);
    }
  }
  // Recompute edges after any re-injection
  const finalNodeIds = new Set(filteredNodes.map(n => n.id));
  const finalEdges = filteredEdges.filter(e => finalNodeIds.has(e.source) && finalNodeIds.has(e.target));
  return { nodes: filteredNodes, edges: finalEdges };
}

const ModelOutputSchema = z.object({
  nodes: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    displayName: z.string().optional(),
    confidence: z.number().min(0).max(1),
  })).min(2),
  edges: z.array(z.object({
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
    confidence: z.number().min(0).max(1),
    data: z.object({ label: z.string().optional() }).partial().optional(),
  })).min(1),
  summary: z.string().optional(),
  architecture: z.object({ type: z.string(), confidence: z.number().min(0).max(1) }).optional(),
});

function parseModelJson(content: string): { nodes: ComponentNode[]; edges: ComponentEdge[]; summary?: string; architecture?: { type: string; confidence: number } } | null {
  // Extract JSON block if model adds prose; prefer fenced code blocks
  let raw = content.trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) raw = fence[1];
  else {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) raw = m[0];
  }
  try {
    const parsed = JSON.parse(raw);
    const valid = ModelOutputSchema.parse(parsed);
    return valid as unknown as { nodes: ComponentNode[]; edges: ComponentEdge[]; summary?: string; architecture?: { type: string; confidence: number } };
  } catch {
    return null;
  }
}

function buildHeuristicResult(input: { frameworks: string[]; apiEndpoints: Array<{ method?: string; path?: string }>; hasDatabase: boolean; files: AnalysisFile[]; pluginDirs?: string[]; isElectron?: boolean }): AnalysisResult {
  const nodes: ComponentNode[] = [];
  const edges: ComponentEdge[] = [];
  nodes.push({ id: 'client', name: 'Client', displayName: 'Client', confidence: 0.7, type: 'client' });
  nodes.push({ id: 'server', name: 'Server', displayName: 'Application Server', confidence: 0.8, type: 'service' });
  edges.push({ id: 'client->server', source: 'client', target: 'server', confidence: 0.9, data: { label: input.isElectron ? 'IPC' : 'HTTP' } });
  if (input.frameworks.length > 0) {
    nodes.push({ id: 'framework', name: input.frameworks.join(', '), displayName: 'Framework', confidence: 0.7, type: 'framework' });
    edges.push({ id: 'server->framework', source: 'server', target: 'framework', confidence: 0.7 });
  }
  if (input.hasDatabase) {
    nodes.push({ id: 'db', name: 'Database', displayName: 'Database', confidence: 0.7, type: 'database' });
    edges.push({ id: 'server->db', source: 'server', target: 'db', confidence: 0.75, data: { label: 'queries' } });
  }
  for (let i = 0; i < Math.min(input.apiEndpoints.length, 10); i += 1) {
    const ep = input.apiEndpoints[i] ?? {};
    const label = `${(ep.method ?? 'GET').toUpperCase()} ${ep.path ?? '/'}`;
    const id = `api-${i}`;
    nodes.push({ id, name: 'API', displayName: label, confidence: 0.6, type: 'endpoint' });
    edges.push({ id: `server->${id}`, source: 'server', target: id, confidence: 0.65 });
  }
  if (input.pluginDirs?.length) {
    const adds = materializePluginNodes(input.pluginDirs, 'client');
    nodes.push(...adds.nodes);
    edges.push(...adds.edges);
  }
  const summary = buildSummary({ frameworks: input.frameworks, hasDatabase: input.hasDatabase, apiCount: input.apiEndpoints.length });
  const architectureType = input.frameworks.some(f => /next|remix|nuxt|sveltekit/i.test(f)) ? 'web-app' : 'service';
  return {
    nodes,
    edges,
    summary,
    architecture: { type: architectureType, confidence: 0.5 },
    estimatedCosts: { tokensUsed: estimateTokens(input.files) },
    fileCount: input.files.length,
  };
}

export type { AnalysisFile, GitHubRepoInfo };

 
