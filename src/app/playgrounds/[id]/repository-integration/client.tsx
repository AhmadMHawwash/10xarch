"use client";

// Analysis components no longer needed after removing fake progress view
import { ExistingAnalysisCard } from "@/components/playground/ExistingAnalysisCard";
import { RateLimitWarning } from "@/components/playground/RateLimitWarning";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import type { Playground } from "@/server/db/schema";
import { api } from "@/trpc/react";
import type { AnalysisResults } from "@/types/analysis";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Eye,
  GitBranch,
  Github,
  Loader2,
  Plus,
  Shield,
  X,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface RepositoryIntegrationClientProps {
  playgroundId: string;
  playground: Playground;
}

export default function RepositoryIntegrationClient({ playgroundId, playground }: RepositoryIntegrationClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // State for UI navigation
  const [currentView, setCurrentView] = useState<'main' | 'new-analysis'>('main');
  const [repositoryUrl, setRepositoryUrl] = useState(playground.associatedRepositoryUrl ?? '');
  const [githubToken, setGithubToken] = useState('');

  const [isPrivate, setIsPrivate] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  // Helper functions
  const validateGitHubUrl = (url: string) => {
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubPattern.test(url);
  };

  const parseGitHubUrl = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    return { owner: match[1]!, repo: match[2]!.replace(/\.git$/, '') };
  };

  // Query for existing analysis when playground has associated repository
  const { data: associatedAnalysisData, isLoading: isLoadingAssociatedAnalysis } = api.github.getAnalysisStatus.useQuery(
    { analysisId: playground.associatedAnalysisId! },
    { 
      enabled: !!playground.associatedAnalysisId,
    }
  );

  // Query for URL-based analysis discovery
  const parsedRepo = repositoryUrl && validateGitHubUrl(repositoryUrl) ? parseGitHubUrl(repositoryUrl) : null;
  const { data: urlBasedAnalysisData, isLoading: isLoadingUrlAnalysis } = api.github.checkExistingAnalysis.useQuery(
    {
      owner: parsedRepo?.owner ?? '',
      repo: parsedRepo?.repo ?? '',
      token: githubToken || undefined,
    },
    {
      enabled: !!parsedRepo && !playground.associatedAnalysisId,
      refetchOnWindowFocus: false,
    }
  );

  // Start new repository integration
  const startIntegrationMutation = api.github.analyzeRepository.useMutation({
    onSuccess: async (data) => {
      setCurrentAnalysisId(data.analysisId);
      setRateLimitError(null);
      
      // Associate the repository with the playground if not already associated
      if (!playground.associatedRepositoryUrl) {
        await associateRepositoryMutation.mutateAsync({
          playgroundId,
          repositoryUrl: repositoryUrl,
          analysisId: data.analysisId,
        });
      }
      
      toast({
        title: "Analysis Started",
        description: "Repository analysis is now in progress...",
      });
    },
    onError: (error) => {
      if (error.message.includes('rate limit')) {
        setRateLimitError(error.message);
        toast({
          title: "Rate Limit Exceeded",
          description: "Consider providing a GitHub token for higher limits",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Associate repository with playground
  const associateRepositoryMutation = api.playgrounds.associateRepository.useMutation({
    onError: (error) => {
      toast({
        title: "Association Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Query for current analysis progress
  const { data: currentAnalysisStatus } = api.github.getAnalysisStatus.useQuery(
    { analysisId: currentAnalysisId! },
    { 
      enabled: !!currentAnalysisId,
      refetchInterval: 2000,
    }
  );

  // Query for analysis details modal
  const { data: analysisDetails, isLoading: isLoadingAnalysisDetails } = api.github.getAnalysisStatus.useQuery(
    { analysisId: showAnalysisDetails! },
    { 
      enabled: !!showAnalysisDetails,
    }
  );

  // Event handlers
  const handleUrlChange = (url: string) => {
    setRepositoryUrl(url);
    setRateLimitError(null);
  };

  const handleStartNewAnalysis = () => {
    setCurrentView('new-analysis');
  };

  const handleStartAnalysis = async () => {
    if (!repositoryUrl || !validateGitHubUrl(repositoryUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub repository URL",
        variant: "destructive",
      });
      return;
    }

    const parsed = parseGitHubUrl(repositoryUrl);
    if (!parsed) return;

    try {
      await startIntegrationMutation.mutateAsync({
        playgroundId,
        owner: parsed.owner,
        repo: parsed.repo,
        token: githubToken || undefined,

        isPrivate,
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleUseExistingAnalysis = async (analysisId: string) => {
    try {
      await associateRepositoryMutation.mutateAsync({
        playgroundId,
        repositoryUrl: repositoryUrl,
        analysisId,
      });

      toast({
        title: "Analysis Associated",
        description: "The existing analysis has been associated with your playground",
      });

      // Refresh the page to show the associated analysis
      window.location.reload();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleShowAnalysis = (analysisId: string) => {
    setShowAnalysisDetails(analysisId);
  };

  const handleBackToPlayground = () => {
    router.push(`/playgrounds/${playgroundId}`);
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  // Effect to handle analysis progress updates
  useEffect(() => {
    if (currentAnalysisStatus?.analysis) {
      const analysis = currentAnalysisStatus.analysis;
      
      if (analysis.status === 'completed') {
        window.location.reload(); // Refresh to show completed analysis
      }
    }
  }, [currentAnalysisStatus]);

  // Determine what data we have
  const hasAssociatedAnalysis = !!playground.associatedAnalysisId;
  const hasUrlBasedAnalysis = urlBasedAnalysisData?.hasExistingAnalysis;

  // Show loading state during analysis
  if (currentAnalysisId && currentAnalysisStatus?.analysis?.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToPlayground}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Playground</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <Github className="h-5 w-5" />
                  <span className="font-medium">Repository Integration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Analyzing Repository
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {currentAnalysisStatus?.analysis?.status === 'analyzing' 
                  ? 'Analysis is in progress...' 
                  : 'Preparing analysis...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={currentView === 'main' ? handleBackToPlayground : handleBackToMain}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{currentView === 'main' ? 'Back to Playground' : 'Back'}</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Github className="h-5 w-5" />
                <span className="font-medium">Repository Integration</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {privacyMode && (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Privacy Mode</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Main View */}
        {currentView === 'main' && (
          <div className="space-y-6">
            {/* Page Title */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Repository Integration</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Analyze GitHub repositories to generate system architecture diagrams
              </p>
            </div>

            {/* Associated Repository Analysis (if exists) */}
            {hasAssociatedAnalysis && (
              <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                    <GitBranch className="h-5 w-5" />
                    Current Repository Analysis
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <ExternalLink className="h-4 w-4" />
                    <a 
                      href={playground.associatedRepositoryUrl ?? undefined} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {playground.associatedRepositoryUrl}
                    </a>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingAssociatedAnalysis ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading analysis...</span>
                    </div>
                  ) : associatedAnalysisData ? (
                    <div className="space-y-4">
                      {/* Status */}
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={associatedAnalysisData.analysis.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {associatedAnalysisData.analysis.status}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {associatedAnalysisData.analysis.completedAt 
                              ? `Completed ${new Date(associatedAnalysisData.analysis.completedAt).toLocaleDateString()}`
                              : `Started ${new Date(associatedAnalysisData.analysis.createdAt).toLocaleDateString()}`
                            }
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleShowAnalysis(playground.associatedAnalysisId!)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Full Analysis
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleStartNewAnalysis}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Analyze Different Repository
                        </Button>
                      </div>

                      {/* Quick Results Preview */}
                      {associatedAnalysisData.analysis.status === 'completed' && associatedAnalysisData.analysis.results && (() => {
                        const results = associatedAnalysisData.analysis.results as AnalysisResults;
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            {results.nodes && results.nodes.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Identified Components ({results.nodes.length})</h4>
                                <div className="flex flex-wrap gap-2">
                                  {results.nodes.slice(0, 6).map((node, index: number) => (
                                    <Badge key={index} variant="outline">{node.displayName ?? node.title ?? node.name}</Badge>
                                  ))}
                                  {results.nodes.length > 6 && (
                                    <Badge variant="secondary">+{results.nodes.length - 6} more</Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            {results.edges && results.edges.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Connections ({results.edges.length})</h4>
                                <div className="text-sm text-muted-foreground">
                                  {results.edges.length} connections identified between components
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Error Display */}
                      {associatedAnalysisData.analysis.status === 'failed' && associatedAnalysisData.analysis.errorMessage && (
                        <div className="p-3 rounded-md bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
                          <div className="text-sm text-red-800 dark:text-red-200">
                            <strong>Error:</strong> {associatedAnalysisData.analysis.errorMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Analysis data not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* No Associated Repository - Repository Discovery */}
            {!hasAssociatedAnalysis && (
              <div className="space-y-6">
                {/* Repository URL Input for Discovery */}
                <Card>
                  <CardHeader>
                    <CardTitle>Repository Analysis</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Enter a GitHub repository URL to check for existing analysis or start a new one
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Input
                          placeholder="https://github.com/username/repository"
                          value={repositoryUrl}
                          onChange={(e) => handleUrlChange(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      
                      {repositoryUrl && !validateGitHubUrl(repositoryUrl) && (
                        <p className="text-sm text-red-600">Please enter a valid GitHub repository URL</p>
                      )}
                      
                      {isLoadingUrlAnalysis && parsedRepo && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">Checking for existing analysis...</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Existing Analysis Found - Show Immediately */}
                {hasUrlBasedAnalysis && urlBasedAnalysisData?.analyses && (
                  <ExistingAnalysisCard
                    repositoryName={parsedRepo ? `${parsedRepo.owner}/${parsedRepo.repo}` : repositoryUrl}
                    currentCommitSha={urlBasedAnalysisData.currentCommitSha ?? undefined}
                    analyses={urlBasedAnalysisData.analyses.map(analysis => ({
                      id: analysis.id,
                      status: analysis.status,
                      createdAt: new Date(analysis.createdAt),
                      completedAt: analysis.completedAt ? new Date(analysis.completedAt) : null,
                      analyzedCommitSha: analysis.analyzedCommitSha,
                      repositoryUrl: analysis.repositoryUrl,
                      errorMessage: analysis.errorMessage,
                      isFresh: analysis.isFresh,
                      commitsBehind: analysis.commitsBehind,
                      recentCommits: 'recentCommits' in analysis ? analysis.recentCommits : [],
                      isOwnedByUser: analysis.isOwnedByUser,
                    }))}
                    onUseExisting={handleUseExistingAnalysis}
                    onShowAnalysis={handleShowAnalysis}
                    onCreateNew={handleStartNewAnalysis}
                    isLoading={startIntegrationMutation.isPending || associateRepositoryMutation.isPending}
                  />
                )}

                {/* No Analysis Found - Start New Analysis */}
                {repositoryUrl && validateGitHubUrl(repositoryUrl) && !isLoadingUrlAnalysis && !hasUrlBasedAnalysis && (
                  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <CardHeader>
                      <CardTitle className="text-blue-900 dark:text-blue-100">No Analysis Found</CardTitle>
                      <p className="text-blue-700 dark:text-blue-300">
                        This repository hasn&apos;t been analyzed yet. You can start the first analysis.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <Button
                            onClick={handleStartNewAnalysis}
                            size="lg"
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Start Analysis
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Getting Started Guide */}
                {!repositoryUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Getting Started</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                          <div>
                            <h4 className="font-medium">Enter Repository URL</h4>
                            <p className="text-sm text-muted-foreground">Paste the GitHub repository URL you want to analyze</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                          <div>
                            <h4 className="font-medium">Check for Existing Analysis</h4>
                            <p className="text-sm text-muted-foreground">We&apos;ll automatically check if the repository has been analyzed before by any user</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                          <div>
                            <h4 className="font-medium">Use or Create Analysis</h4>
                            <p className="text-sm text-muted-foreground">Use existing analysis or start a new one to generate your architecture diagram</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* New Analysis Form View */}
        {currentView === 'new-analysis' && (
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Start New Repository Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure your analysis settings and start the repository analysis process
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="repo-url">Repository URL</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/username/repository"
                    value={repositoryUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                  />
                  {repositoryUrl && !validateGitHubUrl(repositoryUrl) && (
                    <p className="text-sm text-red-600">Please enter a valid GitHub repository URL</p>
                  )}
                </div>



                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="private-repo"
                    checked={isPrivate}
                    onCheckedChange={(checked) => setIsPrivate(checked === true)}
                  />
                  <Label htmlFor="private-repo">Private repository</Label>
                </div>

                {isPrivate && (
                  <div className="space-y-2">
                    <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                    <Input
                      id="github-token"
                      type="password"
                      placeholder="ghp_..."
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Required for private repositories. Token will be stored securely.
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy-mode"
                    checked={privacyMode}
                    onCheckedChange={(checked) => setPrivacyMode(checked === true)}
                  />
                  <Label htmlFor="privacy-mode">Privacy mode (don&apos;t use for LLM training)</Label>
                </div>

                {/* Rate Limit Warning */}
                {rateLimitError && (
                  <RateLimitWarning
                    error={rateLimitError}
                    onDismiss={() => setRateLimitError(null)}
                    showTokenHelp={!githubToken}
                  />
                )}

                <div className="flex space-x-3">
                  <Button 
                    onClick={handleBackToMain} 
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStartAnalysis}
                    disabled={!repositoryUrl || !validateGitHubUrl(repositoryUrl) || startIntegrationMutation.isPending}
                    className="flex-1"
                  >
                    {startIntegrationMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Starting Analysis...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analysis Details - Inline */}
        {showAnalysisDetails && (
          <div className="mt-6 border rounded-lg bg-card container mx-auto max-w-7xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Analysis Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalysisDetails(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {isLoadingAnalysisDetails ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm">Loading analysis details...</span>
              </div>
            ) : analysisDetails?.analysis ? (
              <Tabs defaultValue="overview" className="p-4">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="architecture" className="text-xs">Architecture</TabsTrigger>
                  <TabsTrigger value="experts" className="text-xs">Expert Analysis</TabsTrigger>
                  <TabsTrigger value="components" className="text-xs">Components</TabsTrigger>
                  <TabsTrigger value="connections" className="text-xs">Connections</TabsTrigger>
                  <TabsTrigger value="costs" className="text-xs">Costs & Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={analysisDetails.analysis.status === 'completed' ? 'default' : 'secondary'}>
                      {analysisDetails.analysis.status}
                    </Badge>
                    {analysisDetails.analysis.completedAt && (
                      <span className="text-sm text-muted-foreground">
                        Completed {new Date(analysisDetails.analysis.completedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Repository</Label>
                      <p className="text-sm truncate">{analysisDetails.analysis.repositoryUrl}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Language</Label>
                      <p className="text-sm">{analysisDetails.analysis.detectedLanguage ?? 'Unknown'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Created</Label>
                      <p className="text-sm">{new Date(analysisDetails.analysis.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Analysis Type</Label>
  
                    </div>
                  </div>

                  {(() => {
                    const results = analysisDetails.analysis.results as AnalysisResults;
                    return results?.summary && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <h4 className="font-medium mb-2">Analysis Summary</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{results.summary}</p>
                      </div>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="architecture" className="mt-4">
                  {(() => {
                    const results = analysisDetails.analysis.results as AnalysisResults;
                    return results?.architecture ? (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">{results.architecture.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {results.architecture.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-sm">{results.architecture.description}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No architecture assessment available</p>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="experts" className="mt-4 space-y-3">
                  {(() => {
                    const results = analysisDetails.analysis.results as AnalysisResults;
                    return results?.experts && results.experts.length > 0 ? (
                      results.experts.map((expert, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={expert.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                              {expert.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{expert.status}</span>
                          </div>
                          {expert.description && (
                            <p className="text-xs text-muted-foreground mb-2">{expert.description}</p>
                          )}
                          {expert.findings && expert.findings.length > 0 && (
                            <div>
                              <h5 className="text-xs font-medium mb-1">Key Findings:</h5>
                              <ul className="space-y-1">
                                {expert.findings.slice(0, 3).map((finding: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs">
                                    <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                                    <span>{finding}</span>
                                  </li>
                                ))}
                              </ul>
                              {expert.findings.length > 3 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  +{expert.findings.length - 3} more findings
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No expert analysis available</p>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="components" className="mt-4">
                  {(() => {
                    const results = analysisDetails.analysis.results as AnalysisResults;
                    return results?.nodes && results.nodes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.nodes.map((node, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{node.name}</Badge>
                                <span className="text-xs font-medium truncate">{node.displayName ?? node.title}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {node.confidence}%
                              </Badge>
                            </div>
                            {node.subtitle && (
                              <p className="text-xs text-muted-foreground mb-2">{node.subtitle}</p>
                            )}
                            {node.evidence && node.evidence.length > 0 && (
                              <div>
                                <h6 className="text-xs font-medium text-muted-foreground mb-1">Evidence:</h6>
                                <ul className="space-y-1">
                                  {node.evidence.slice(0, 2).map((evidence: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1 text-xs">
                                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                      <span className="truncate">{evidence}</span>
                                    </li>
                                  ))}
                                </ul>
                                {node.evidence.length > 2 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    +{node.evidence.length - 2} more
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No system components identified</p>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="connections" className="mt-4 space-y-3">
                  {(() => {
                    const results = analysisDetails.analysis.results as AnalysisResults;
                    return results?.edges && results.edges.length > 0 ? (
                      results.edges.map((edge, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 text-xs font-mono">
                              <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">
                                {edge.source}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs">
                                {edge.target}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {edge.confidence}%
                            </Badge>
                          </div>
                          {edge.data?.label && (
                            <p className="text-xs mb-2">{edge.data.label}</p>
                          )}
                          {edge.data?.apiDefinition && (
                            <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded mb-2">
                              <strong>API:</strong> {edge.data.apiDefinition}
                            </div>
                          )}
                          {edge.evidence && edge.evidence.length > 0 && (
                            <ul className="text-xs space-y-1">
                              {edge.evidence.slice(0, 2).map((evidence: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                  <span>{evidence}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No system connections identified</p>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="costs" className="mt-4 space-y-4">
                  {(() => {
                    const results = analysisDetails.analysis.results as AnalysisResults;
                    return (
                      <>
                        {/* Cost Information */}
                        {results?.estimatedCosts && (
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Tokens Used</Label>
                              <p className="text-sm font-mono">
                                {results.estimatedCosts.tokensUsed?.toLocaleString() ?? 'N/A'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Estimated Cost</Label>
                              <p className="text-sm font-mono">
                                ${results.estimatedCosts.actualCost?.toFixed(4) ?? '0.0000'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {results?.recommendations && results.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3">Recommendations</h4>
                            <div className="space-y-2">
                              {results.recommendations.map((recommendation: string, index: number) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                  <div className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                  </div>
                                  <p className="text-xs">{recommendation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </TabsContent>

                {/* Error Message */}
                {analysisDetails.analysis.errorMessage && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Analysis Error</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {analysisDetails.analysis.errorMessage}
                    </p>
                  </div>
                )}
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No analysis details available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 