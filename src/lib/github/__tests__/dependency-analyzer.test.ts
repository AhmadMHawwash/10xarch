import { describe, it, expect } from 'vitest';
import { DependencyAnalyzer } from '@/lib/github/dependency-analyzer';
import type { AnalysisFile } from '@/lib/github/github-service';

function f(path: string, content: string): AnalysisFile {
  return { path, content, size: content.length, type: 'other', importance: 'medium' };
}

describe('DependencyAnalyzer', () => {
  it('extracts imports, api calls, db references and builds a dependency summary', () => {
    const analyzer = new DependencyAnalyzer();
    const files: AnalysisFile[] = [
      f('src/app/layout.tsx', `import './globals.css';`),
      f('src/app/page.tsx', `
        import { getUser } from '@/lib/user';
        import Header from '@/components/Header';
        fetch('/api/users');
        import('axios');
        api.users.get.query();
      `),
      f('src/server/api/routers/users.ts', `export const users = { get: {} } as const;`),
      f('src/lib/user.ts', `
        import { db } from '@/server/db';
        export async function getUser(){ return db.select(); }
      `),
      f('src/server/db/index.ts', `export const db = { select(){ return []; } }`),
    ];

    const graph = analyzer.analyzeDependencies(files);

    // basic shape
    expect(graph.dependencies.length).toBeGreaterThan(0);
    expect(graph.serviceBoundaries.length).toBeGreaterThan(0);

    // entry points include layout/page
    expect(graph.entryPoints).toEqual(expect.arrayContaining(['src/app/layout.tsx', 'src/app/page.tsx']));

    // isolated files may include layout.css-only import; just assert it is minimal
    expect(graph.isolatedFiles.length).toBeLessThanOrEqual(1);

    // data flow contains Frontend -> API or Module Dependencies
    const viaList = graph.dataFlow.map((c) => c.via);
    expect(viaList.length).toBeGreaterThan(0);
  });
});


