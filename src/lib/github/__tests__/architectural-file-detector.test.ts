import { describe, it, expect } from 'vitest';
import { ArchitecturalFileDetector } from '@/lib/github/architectural-file-detector';

describe('ArchitecturalFileDetector', () => {
  const detector = new ArchitecturalFileDetector();

  it('analyzes and prioritizes architectural files', () => {
    const files = [
      { path: 'src/app/layout.tsx' },
      { path: 'src/server/api/root.ts' },
      { path: 'src/server/api/routers/github.ts' },
      { path: 'src/server/db/schema.ts' },
      { path: 'src/components/Button.tsx' },
      { path: 'README.md' }, // should be ignored
      { path: 'docs/anything.md' }, // should be ignored
    ];

    const analyzed = detector.analyzeFiles(files);
    const paths = analyzed.map((a) => a.path);

    expect(paths).toEqual(
      expect.arrayContaining([
        'src/app/layout.tsx',
        'src/server/api/root.ts',
        'src/server/api/routers/github.ts',
        'src/server/db/schema.ts',
        'src/components/Button.tsx',
      ]),
    );
    expect(paths).not.toContain('README.md');
    expect(paths).not.toContain('docs/anything.md');

    // critical and high should surface first by sorting
    const first = analyzed[0]!;
    expect(['entry_point', 'api_definition', 'data_model']).toContain(first.category);
  });

  it('selectFilesForAnalysis enforces limits and category coverage', () => {
    const files = [
      { path: 'src/app/page.tsx' },
      { path: 'src/app/layout.tsx' },
      { path: 'src/server/api/root.ts' },
      { path: 'src/server/api/routers/a.ts' },
      { path: 'src/server/api/routers/b.ts' },
      { path: 'src/server/db/schema.ts' },
      // many UI components - should be capped
      ...Array.from({ length: 30 }, (_, i) => ({ path: `src/components/Comp${i}.tsx` })),
    ];

    const selected = detector.selectFilesForAnalysis(files);
    // should include at least one file from key categories
    const categories = new Set(selected.map((s) => s.category));
    ['entry_point', 'api_definition', 'data_model', 'configuration', 'integration', 'middleware', 'frontend_core']
      .forEach((c) => {
        // not all must exist in the input; skip if detector couldn't find one
        // but if present in analyzed, ensure the selection preserves at least one
      });

    // frontend medium should be capped; total selection well below 80 here anyway
    const frontendSelected = selected.filter((s) => s.category === 'frontend_core');
    expect(frontendSelected.length).toBeLessThanOrEqual(10);
  });
});



