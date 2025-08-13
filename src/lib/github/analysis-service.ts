import type { AnalysisFile, GitHubRepoInfo } from './github-service';

type AnalysisResult = {
  nodes?: unknown[];
  edges?: unknown[];
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
    // Minimal no-op analysis to satisfy current integration points
    return {
      nodes: [],
      edges: [],
      estimatedCosts: { tokensUsed: 0 },
      fileCount: files.length,
    };
  }
}

export type { AnalysisFile, GitHubRepoInfo };

 
