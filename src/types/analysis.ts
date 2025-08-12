// Analysis result types for proper TypeScript support

export interface AnalysisNode {
  id: string;
  name: string;
  displayName?: string;
  title?: string;
  subtitle?: string;
  confidence: number;
  evidence?: string[];
  [key: string]: any; // Allow additional properties
}

export interface AnalysisEdge {
  id: string;
  source: string;
  target: string;
  confidence: number;
  data?: {
    label?: string;
    apiDefinition?: string;
  };
  evidence?: string[];
  [key: string]: any; // Allow additional properties
}

export interface AnalysisArchitecture {
  type: string;
  confidence: number;
  description: string;
}

export interface AnalysisExpert {
  name: string;
  status: string;
  description?: string;
  findings?: string[];
}

export interface AnalysisCosts {
  tokensUsed: number;
  actualCost: number;
}

export interface AnalysisResults {
  summary?: string;
  architecture?: AnalysisArchitecture;
  experts?: AnalysisExpert[];
  nodes?: AnalysisNode[];
  edges?: AnalysisEdge[];
  estimatedCosts?: AnalysisCosts;
  recommendations?: string[];
  [key: string]: any; // Allow additional properties
}

export interface AnalysisResponse {
  id: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  repositoryName?: string;
  repositoryUrl: string;
  detectedLanguage?: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  analysisDepth?: string;
  results?: AnalysisResults;
}

export interface AnalysisStatusResponse {
  success: boolean;
  analysis: AnalysisResponse;
} 