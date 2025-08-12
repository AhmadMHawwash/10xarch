import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GitBranch, GitCommit, AlertTriangle, CheckCircle, User, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ExistingAnalysis {
  id: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  completedAt: Date | null;
  analyzedCommitSha: string | null;
  repositoryUrl: string;
  errorMessage: string | null;
  isFresh: boolean | null;
  commitsBehind: number | null;
  recentCommits: Array<{ sha: string; message: string; date: string }>;
  isOwnedByUser: boolean;
}

interface ExistingAnalysisCardProps {
  repositoryName: string;
  currentCommitSha?: string;
  analyses: ExistingAnalysis[];
  onUseExisting: (analysisId: string) => void;
  onShowAnalysis: (analysisId: string) => void;
  onCreateNew: () => void;
  isLoading?: boolean;
}

export function ExistingAnalysisCard({
  repositoryName,
  currentCommitSha,
  analyses,
  onUseExisting,
  onShowAnalysis,
  onCreateNew,
  isLoading = false,
}: ExistingAnalysisCardProps) {
  if (analyses.length === 0) {
    return null;
  }

  const getStatusColor = (status: ExistingAnalysis['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'analyzing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getFreshnessStatus = (analysis: ExistingAnalysis) => {
    if (analysis.status !== 'completed' || analysis.isFresh === null) {
      return null;
    }

    const commitsBehind = analysis.commitsBehind ?? 0;
    
    if (analysis.isFresh) {
      return {
        icon: CheckCircle,
        text: commitsBehind === 0 ? 'Up to date' : `${commitsBehind} commit${commitsBehind !== 1 ? 's' : ''} behind`,
        color: 'text-green-600 dark:text-green-400',
      };
    } else {
      return {
        icon: AlertTriangle,
        text: `${commitsBehind} commit${commitsBehind !== 1 ? 's' : ''} behind`,
        color: 'text-orange-600 dark:text-orange-400',
      };
    }
  };

  const latestAnalysis = analyses.find(a => a.status === 'completed') ?? analyses[0];

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <GitBranch className="h-5 w-5" />
          Existing Analysis Found
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          {repositoryName} has been analyzed before. You can use an existing analysis or create a new one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Latest/Featured Analysis */}
        {latestAnalysis && (
          <div className="rounded-lg border border-blue-200 bg-white p-4 dark:border-blue-700 dark:bg-blue-900">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(latestAnalysis.status)}>
                  {latestAnalysis.status}
                </Badge>
                {latestAnalysis.isOwnedByUser && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Your analysis
                  </Badge>
                )}
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {latestAnalysis.completedAt ? (
                  <>Completed {formatDistanceToNow(latestAnalysis.completedAt)} ago</>
                ) : (
                  <>Started {formatDistanceToNow(latestAnalysis.createdAt)} ago</>
                )}
              </div>
            </div>

            {/* Freshness Status */}
            {(() => {
              const freshness = getFreshnessStatus(latestAnalysis);
              return freshness ? (
                <div className={`flex items-center gap-2 mb-3 ${freshness.color}`}>
                  <freshness.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{freshness.text}</span>
                </div>
              ) : null;
            })()}

            {/* Commit Info */}
            {latestAnalysis.analyzedCommitSha && (
              <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                <GitCommit className="h-4 w-4" />
                <span>Analyzed commit: {latestAnalysis.analyzedCommitSha.slice(0, 8)}</span>
                {currentCommitSha && currentCommitSha !== latestAnalysis.analyzedCommitSha && (
                  <>
                    <span>•</span>
                    <span>Current: {currentCommitSha.slice(0, 8)}</span>
                  </>
                )}
              </div>
            )}

            {/* Recent Commits (if analysis is behind) */}
            {latestAnalysis.recentCommits.length > 0 && latestAnalysis.commitsBehind && latestAnalysis.commitsBehind > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Recent commits since analysis:
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {latestAnalysis.recentCommits.slice(0, 3).map((commit) => (
                    <div key={commit.sha} className="text-xs text-muted-foreground pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      <div className="font-mono">{commit.sha.slice(0, 8)}</div>
                      <div className="truncate">{commit.message}</div>
                      <div>{new Date(commit.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                  {latestAnalysis.recentCommits.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      ... and {latestAnalysis.recentCommits.length - 3} more commits
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {latestAnalysis.status === 'failed' && latestAnalysis.errorMessage && (
              <div className="mb-3 p-3 rounded-md bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
                <div className="text-sm text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {latestAnalysis.errorMessage}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {latestAnalysis.status === 'completed' && (
                <Button
                  onClick={() => onUseExisting(latestAnalysis.id)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Use This Analysis
                </Button>
              )}
              {latestAnalysis.status === 'completed' && (
                <Button
                  variant="secondary"
                  onClick={() => onShowAnalysis(latestAnalysis.id)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Show Analysis
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onCreateNew}
                disabled={isLoading}
                className="flex-1"
              >
                Create New Analysis
              </Button>
            </div>
          </div>
        )}

        {/* Other Analyses */}
        {analyses.length > 1 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Other analyses ({analyses.length - 1})
              </div>
              {analyses.slice(1, 4).map((analysis) => {
                const freshness = getFreshnessStatus(analysis);
                return (
                  <div key={analysis.id} className="flex items-center justify-between p-2 rounded border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(analysis.status)}>
                        {analysis.status}
                      </Badge>
                      {analysis.isOwnedByUser && (
                        <User className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(analysis.createdAt)} ago
                      </span>
                      {freshness && (
                        <span className={`text-xs ${freshness.color}`}>
                          {freshness.text}
                        </span>
                      )}
                    </div>
                    {analysis.status === 'completed' && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onShowAnalysis(analysis.id)}
                          disabled={isLoading}
                        >
                          Show
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUseExisting(analysis.id)}
                          disabled={isLoading}
                        >
                          Use
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
              {analyses.length > 4 && (
                <div className="text-xs text-muted-foreground text-center">
                  ... and {analyses.length - 4} more analyses
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 