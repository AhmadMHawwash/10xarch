import { describe, it, expect } from 'vitest';
import { extractSummaryFieldsFromExpertAnalyses } from '@/lib/github/analysis-utils';

describe('analysis-utils.extractSummaryFieldsFromExpertAnalyses', () => {
  it('handles stringified JSON with top-level nodes/edges', () => {
    const payload = JSON.stringify({ nodes: [{ confidence: 80 }, { confidence: 60 }], edges: [1, 2, 3] });
    const res = extractSummaryFieldsFromExpertAnalyses(payload);
    expect(res.nodesCount).toBe(2);
    expect(res.edgesCount).toBe(3);
    // average confidence rounded
    expect(res.confidence).toBe(70);
  });

  it('handles object with experts[0] shape', () => {
    const payload = { experts: [{ nodes: [{ confidence: 90 }], edges: [{}, {}] }] };
    const res = extractSummaryFieldsFromExpertAnalyses(payload);
    expect(res.nodesCount).toBe(1);
    expect(res.edgesCount).toBe(2);
    expect(res.confidence).toBe(90);
  });

  it('uses architecture.confidence if present', () => {
    const payload = { nodes: [{ confidence: 20 }], edges: [], architecture: { confidence: 88 } };
    const res = extractSummaryFieldsFromExpertAnalyses(payload);
    expect(res.confidence).toBe(88);
  });

  it('is resilient to invalid input', () => {
    expect(extractSummaryFieldsFromExpertAnalyses('not json')).toEqual({ nodesCount: 0, edgesCount: 0, confidence: null });
    expect(extractSummaryFieldsFromExpertAnalyses(123 as unknown as object)).toEqual({ nodesCount: 0, edgesCount: 0, confidence: null });
  });
});



