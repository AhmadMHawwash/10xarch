import { describe, it, expect, vi, beforeAll } from 'vitest';
import { setupTestEnvironment, createTestCaller } from '@/server/api/__tests__/test-utils';

// Ensure env is set for any modules that read it on import
beforeAll(() => {
  setupTestEnvironment();
});

// Mock Simple AST to avoid tree-sitter and provide deterministic insights
vi.mock('@/lib/github/simple-ast', () => ({
  createSimpleAnalyzer: vi.fn(async () => ({
    analyzeFiles: vi.fn(async (files: Array<{ path: string; content: string }>) => {
      return files.map(f => ({
        path: f.path,
        imports: [],
        apiEndpoints: f.path.includes('/api/') ? [{ path: '/api/x', method: 'GET', framework: 'nextjs' }] : [],
        frameworks: f.path.endsWith('.tsx') ? ['next.js', 'react'] : [],
        hasDatabase: /db\./.test(f.content),
        environmentVars: (f.content.match(/process\.env\.(\w+)/g) ?? []).map(s => s.split('.').pop() ?? ''),
      }));
    }),
  })),
}));

// Mock GitHubService to avoid network calls and return stable analysis artifacts
vi.mock('@/lib/github/github-service', () => {
  class GitHubService {
    constructor(_token?: string) {
      // empty constructor to satisfy class constructor
    }
    static parseGitHubUrl(url: string) {
      const m = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/);
      return m ? { owner: m[1]!, repo: m[2]! } : null;
    }
    async getRepositoryInfo(owner: string, repo: string) {
      return { fullName: `${owner}/${repo}`, defaultBranch: 'main', size: 123, language: 'TypeScript', isPrivate: false };
    }
    async analyzeRepository(_owner: string, _repo: string, _branch?: string, _depth?: number) {
      const files = [
        { path: 'src/app/page.tsx', content: 'export default function Page(){}', size: 32, type: 'other', importance: 'medium' },
        { path: 'src/app/api/health/route.ts', content: 'export const GET = () => new Response()\nprocess.env.API_URL', size: 64, type: 'other', importance: 'high' },
        { path: 'src/server/db/index.ts', content: 'export const db = { select(){}, query(){} }', size: 64, type: 'other', importance: 'high' },
      ];
      const dependencyTrackerGraph = {
        nodes: [
          { path: 'src/app/page.tsx', type: 'entry_point', level: 0, importance: 5, inDegree: 0, outDegree: 2, references: [] },
          { path: 'src/app/api/health/route.ts', type: 'dependency', level: 1, importance: 3, inDegree: 1, outDegree: 0, references: [] },
        ],
        edges: [
          { from: 'src/app/page.tsx', to: 'src/app/api/health/route.ts', weight: 8, types: ['api_call'] },
          { from: 'src/app/page.tsx', to: 'env:API_URL', weight: 7, types: ['env_var'] },
        ],
        levels: [{ level: 0, nodes: ['src/app/page.tsx'], description: 'Entry Points' }],
        statistics: { totalNodes: 2, totalEdges: 2, maxDepth: 1, entryPoints: 1, hubNodes: ['src/app/page.tsx'] },
      };
      const entryPointAnalysis = {
        entryPoints: [{ path: 'src/app/page.tsx', type: 'frontend', importance: 'high', source: 'pattern', confidence: 85 }],
        packageJsonMain: undefined,
        scripts: {},
        detectedFrameworks: ['Next.js'],
      };
      const dependencyGraph = { dependencies: [], serviceBoundaries: [], dataFlow: [], entryPoints: [], isolatedFiles: [] };
      const estimation = { totalFiles: files.length, selectedFiles: files.length, estimatedInputTokens: 1000, estimatedOutputTokens: 400, estimatedCost: 0.01, costBreakdown: { baseAnalysis: 1500, fileAnalysis: 300, contentAnalysis: 0, architecturalContext: 0 } };
      return { files, estimation, dependencyGraph, architecturalContext: '"{}"', entryPointAnalysis, dependencyTrackerGraph, stageAScan: { priorityPaths: ['src/app/api/health/route.ts'], summary: { endpoints: 1, dbFiles: 1, configFiles: 0, webhookFiles: 0, jobFiles: 0 } } };
    }
  }
  return { GitHubService };
});

describe('githubRouter', () => {
  it('validateRepository parses URL and returns repository info', async () => {
    const { caller } = await createTestCaller('user-1');
    const result = await caller.github.validateRepository({ url: 'https://github.com/acme/repo' });
    expect(result.success).toBe(true);
    expect(result.owner).toBe('acme');
    expect(result.repo).toBe('repo');
    expect(result.repository.fullName).toBe('acme/repo');
  });

  it('getAnalysisEstimation returns estimation and AST insights with deps summary when includeDeps=true', async () => {
    const { caller } = await createTestCaller('user-1');
    const result = await caller.github.getAnalysisEstimation({ owner: 'acme', repo: 'repo', includeDeps: true });
    expect(result.success).toBe(true);
    expect(result.fileCount).toBeGreaterThan(0);
    expect(result.estimation.estimatedInputTokens).toBeGreaterThan(0);
    // AST insights present
    if (result.astInsights) {
      expect(result.astInsights.frameworks.length).toBeGreaterThanOrEqual(1);
      expect(typeof result.astInsights.apiEndpoints === 'number').toBe(true);
    }
    // Dependency summary present
    expect(result.entryPointAnalysis).toBeDefined();
    expect(result.dependencyTrackerGraph).toBeDefined();
    expect(result.dependencySummary).toBeDefined();
  });
});


