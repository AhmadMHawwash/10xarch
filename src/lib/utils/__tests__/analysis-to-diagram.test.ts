import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AnalysisResults, AnalysisNode, AnalysisEdge } from '@/types/analysis';
import {
  convertNodesToReactFlow,
  convertEdgesToReactFlow,
  convertAnalysisToReactFlow,
  VALID_COMPONENT_NAMES,
} from '@/lib/utils/analysis-to-diagram';

describe('analysis-to-diagram', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      // intentionally muted in tests
    });
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      // intentionally muted in tests
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('exposes valid component names', () => {
    // Sanity check for exported names used by UI
    expect(VALID_COMPONENT_NAMES).toEqual(
      expect.arrayContaining([
        'Client',
        'Server',
        'Load Balancer',
        'Cache',
        'CDN',
        'Database',
        'Message Queue',
        'Custom Component',
      ]),
    );
  });

  it('converts analysis nodes to ReactFlow nodes with deterministic IDs and mapped types', () => {
    const nodes: AnalysisNode[] = [
      { id: ' client-1 ', name: 'frontend', confidence: 80 },
      { id: 'api-1', name: 'api', confidence: 75 },
      { id: 'db-1', name: 'postgres-db', confidence: 70 },
      { id: 'unknown-1', name: 'something-unseen', confidence: 65 },
      { id: 'lb-1', name: 'nginx', confidence: 85 },
      { id: 'cache-1', name: 'redis', confidence: 90 },
    ];

    const rfNodes = convertNodesToReactFlow(nodes);
    expect(rfNodes).toHaveLength(nodes.length);

    // IDs should be trimmed and preserved
    expect(rfNodes.find((n) => n.id === 'client-1')).toBeTruthy();

    // Types should be mapped from names
    const typeById = Object.fromEntries(rfNodes.map((n) => [n.id, n.data.name]));
    expect(typeById['client-1']).toBe('Client');
    expect(typeById['api-1']).toBe('Server');
    expect(typeById['db-1']).toBe('Database');
    expect(typeById['lb-1']).toBe('Load Balancer');
    expect(typeById['cache-1']).toBe('Cache');
    expect(typeById['unknown-1']).toBe('Custom Component');

    // Positions should be finite numbers and non-negative X
    for (const n of rfNodes) {
      expect(Number.isFinite(n.position.x)).toBe(true);
      expect(Number.isFinite(n.position.y)).toBe(true);
      expect(n.position.x).toBeGreaterThanOrEqual(0);
    }
  });

  it('filters edges referencing unknown nodes and logs an error', async () => {
    const nodes: AnalysisNode[] = [
      { id: 'A', name: 'frontend', confidence: 80 },
      { id: 'B', name: 'api', confidence: 70 },
    ];
    const rfNodes = convertNodesToReactFlow(nodes);
    const validIds = new Set(rfNodes.map((n) => n.id));

    const edges: AnalysisEdge[] = [
      { id: 'e1', source: 'A', target: 'B', confidence: 80, data: { label: 'calls' } },
      { id: 'e2', source: 'A', target: 'C', confidence: 60 }, // invalid target
    ];

    const rfEdges = await convertEdgesToReactFlow(edges, validIds, rfNodes);
    expect(rfEdges).toHaveLength(1);
    expect(rfEdges[0]?.source).toBe('A');
    expect(rfEdges[0]?.target).toBe('B');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('converts full analysis to ReactFlow graph', async () => {
    const results: AnalysisResults = {
      nodes: [
        { id: 'C1', name: 'client', displayName: 'Web', confidence: 90 },
        { id: 'S1', name: 'api', displayName: 'API', confidence: 85 },
      ],
      edges: [
        { id: 'E1', source: 'C1', target: 'S1', confidence: 80, data: { label: 'HTTP' } },
      ],
    };

    const { nodes, edges, componentMapping } = await convertAnalysisToReactFlow(results);
    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);
    expect(componentMapping.client).toBe('Client');
    expect(componentMapping.api).toBe('Server');
  });
});



