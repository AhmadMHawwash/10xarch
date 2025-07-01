// Analysis components for GitHub repository analysis
export { AnalysisExpertCard, type ExpertStatus } from './AnalysisExpertCard';
export { IdentifiedComponentsCard, type IdentifiedComponent } from './IdentifiedComponentsCard';
export { RepositoryInfoCard, type RepositoryInfo } from './RepositoryInfoCard';
export { AnalysisLogCard, type AnalysisLogEntry } from './AnalysisLogCard';
export { CurrentAnalysisCard } from './CurrentAnalysisCard';

// Helper function to create analysis log entries
export const createLogEntry = (
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  expert?: string
) => ({
  id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date(),
  message,
  type,
  expert,
}); 