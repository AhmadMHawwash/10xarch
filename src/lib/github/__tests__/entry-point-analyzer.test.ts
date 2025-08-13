import { describe, it, expect } from 'vitest';
import { EntryPointAnalyzer } from '@/lib/github/entry-point-analyzer';
import type { AnalysisFile } from '@/lib/github/github-service';

describe('EntryPointAnalyzer', () => {
  const analyzer = new EntryPointAnalyzer();

  it('identifies entry points from package.json, common patterns, APIs, configs, and monorepo packages', () => {
    const files: AnalysisFile[] = [
      // root package.json with scripts and deps
      {
        path: 'package.json',
        content: JSON.stringify({
          main: 'src/server.ts',
          scripts: {
            start: 'node src/server.ts',
            dev: 'next dev',
            test: 'vitest',
          },
          dependencies: {
            next: '14.0.0',
            react: '18.0.0',
            express: '4.18.0',
            '@trpc/server': '10.0.0',
          },
        }),
        size: 0,
        type: 'other',
        importance: 'medium',
      },
      // monorepo package
      {
        path: 'apps/admin/package.json',
        content: JSON.stringify({
          scripts: { start: 'node server.js' },
        }),
        size: 0,
        type: 'other',
        importance: 'medium',
      },
      // files matching common patterns
      { path: 'src/app/layout.tsx', content: '', size: 0, type: 'other', importance: 'high' },
      { path: 'src/app/page.tsx', content: '', size: 0, type: 'other', importance: 'high' },
      { path: 'src/server/api/root.ts', content: '', size: 0, type: 'other', importance: 'high' },
      { path: 'src/server/db/index.ts', content: '', size: 0, type: 'other', importance: 'high' },
      // api routes
      { path: 'src/app/api/health/route.ts', content: '', size: 0, type: 'other', importance: 'high' },
      { path: 'src/server/api/routers/users.ts', content: '', size: 0, type: 'other', importance: 'high' },
      // test files should be ignored
      { path: 'src/app/page.test.tsx', content: '', size: 0, type: 'other', importance: 'low' },
    ];

    const res = analyzer.analyzeEntryPoints(files);

    // scripts captured from root package.json
    expect(res.scripts.start).toContain('node');
    expect(res.scripts.dev).toContain('next');

    // frameworks inferred from dependencies
    expect(res.detectedFrameworks).toEqual(expect.arrayContaining(['Next.js', 'React', 'Express', 'tRPC']));

    const paths = res.entryPoints.map((e) => e.path);
    expect(paths).toEqual(expect.arrayContaining([
      'src/server.ts', // from package.json main
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'src/server/api/root.ts',
      'src/app/api/health/route.ts',
      'src/server/db/index.ts',
    ]));

    // test file not included
    expect(paths).not.toContain('src/app/page.test.tsx');

    // Importance ordering (critical/high first)
    const importanceOrder = res.entryPoints.map((e) => e.importance);
    const idxCritical = importanceOrder.findIndex((i) => i === 'critical');
    const idxLow = importanceOrder.findIndex((i) => i === 'low');
    if (idxLow !== -1 && idxCritical !== -1) {
      expect(idxCritical).toBeLessThan(idxLow);
    }
  });
});


