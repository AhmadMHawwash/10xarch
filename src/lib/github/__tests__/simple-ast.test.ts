import { describe, it, expect, vi } from 'vitest';
import { SimpleASTAnalyzer } from '@/lib/github/simple-ast';

describe('SimpleASTAnalyzer (regex fallback)', () => {
  it('extracts endpoints, env vars, frameworks, and db usage via regex when parser unavailable', async () => {
    // Temporarily stub window to satisfy server-only constructor
    vi.stubGlobal('window', undefined);
    const analyzer = new SimpleASTAnalyzer();
    vi.unstubAllGlobals();

    // Force-initialize without parsers so analyzeFile throws before parse and uses fallback
    vi.spyOn(analyzer, 'initialize').mockResolvedValue();

    const filePath = 'src/app/api/user/route.ts';
    const content = `
      import { db } from '@/server/db';
      import express from 'express';
      export const GET = async () => new Response('ok');
      export const POST = async () => new Response('ok');
      const app = express();
      app.get('/health', (_req, res) => res.send('ok'));
      const token = process.env.API_KEY;
      const value = import.meta.env.VITE_FOO;
      db.select();
    `;

    const res = await analyzer.analyzeFile(filePath, content);
    // Next.js route detection should find GET and POST (ignore express routes here)
    const methods = res.apiEndpoints.filter((e) => e.framework === 'nextjs').map((e) => e.method).sort();
    expect(methods).toEqual(['GET', 'POST']);
    expect(res.apiEndpoints[0]?.framework).toBe('nextjs');
    expect(res.apiEndpoints[0]?.path).toBe('/api/user');

    // Express route
    expect(res.apiEndpoints.some((e) => e.framework === 'express' && e.path === '/health')).toBe(true);

    // Env vars
    expect(res.environmentVars).toEqual(expect.arrayContaining(['API_KEY', 'VITE_FOO']));

    // DB usage
    expect(res.hasDatabase).toBe(true);

    // Framework detection heuristics
    expect(res.frameworks).toEqual(expect.arrayContaining(['next.js', 'express', 'drizzle']));
  });
});


