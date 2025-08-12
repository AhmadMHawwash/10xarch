export interface AnalysisSummaryFields {
  nodesCount: number;
  edgesCount: number;
  confidence: number | null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Safely extract summary fields from an analysis payload that could be stored as:
 * - a JSON object with top-level nodes/edges/architecture
 * - a JSON object with experts[0].nodes/edges
 * - a stringified JSON of either of the above
 */
export function extractSummaryFieldsFromExpertAnalyses(expertAnalyses: unknown): AnalysisSummaryFields {
  let nodesCount = 0;
  let edgesCount = 0;
  let confidence: number | null = null;

  try {
    let payload: unknown = expertAnalyses;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        return { nodesCount, edgesCount, confidence };
      }
    }

    if (!isObject(payload)) {
      return { nodesCount, edgesCount, confidence };
    }

    const obj: Record<string, unknown> = payload;
    const nodesCandidate = obj.nodes;
    const edgesCandidate = obj.edges;

    let nodes: unknown = Array.isArray(nodesCandidate) ? nodesCandidate : undefined;
    let edges: unknown = Array.isArray(edgesCandidate) ? edgesCandidate : undefined;

    if (!nodes || !edges) {
      const expertsRaw = obj.experts;
      let first: Record<string, unknown> | undefined;
      if (Array.isArray(expertsRaw) && isObject(expertsRaw[0])) {
        first = expertsRaw[0];
      }
      const getArrayProp = (o: Record<string, unknown>, key: 'nodes' | 'edges'): unknown[] | undefined => {
        const v = o[key];
        return Array.isArray(v) ? v : undefined;
      };
      if (!nodes && first) nodes = getArrayProp(first, 'nodes');
      if (!edges && first) edges = getArrayProp(first, 'edges');
    }

    const nodesArray = Array.isArray(nodes) ? nodes : [];
    const edgesArray = Array.isArray(edges) ? edges : [];

    nodesCount = nodesArray.length;
    edgesCount = edgesArray.length;

    const architecture = obj.architecture;
    if (isObject(architecture) && typeof architecture.confidence === 'number') {
      confidence = Math.round(architecture.confidence);
    } else if (nodesArray.length > 0) {
      const sum = nodesArray.reduce((acc: number, n: unknown) => {
        if (isObject(n) && typeof (n as { confidence?: unknown }).confidence === 'number') {
          return acc + (n as { confidence: number }).confidence;
        }
        return acc;
      }, 0);
      const avg = sum / nodesArray.length;
      confidence = Number.isFinite(avg) ? Math.round(avg) : null;
    }
  } catch {
    // ignore parse errors
  }

  return { nodesCount, edgesCount, confidence };
}


