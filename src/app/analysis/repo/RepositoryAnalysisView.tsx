"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Github,
  Shield,
  Loader2,
  Zap,
  Plus,
  Eye,
  History,
  Code2,
  ArrowLeft,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import type { AnalysisResults } from "@/types/analysis";
import AnalysisDiagram from "@/components/analysis/AnalysisDiagram";

interface AnalysisState {
  currentView: "main" | "new-analysis" | "analysis-progress" | "analysis-results";
  repositoryUrl: string;
  isPrivate: boolean;
  privacyMode: boolean;
  githubToken: string;
  // dependencyDepth removed; fixed depth server-side
  // llmInputMode removed; behavior now derived from depth
  currentAnalysisId: string | null;
  selectedAnalysisId: string | null;
  rateLimitError: string | null;
}

interface RepositoryAnalysisViewProps {
  owner?: string;
  repo?: string;
  repoRoute?: string;
  analysisId?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function RepositoryAnalysisView({ owner: ownerProp, repo: repoProp, repoRoute, analysisId }: RepositoryAnalysisViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isSignedIn, isLoaded } = useUser();

  // Determine owner/repo from new props or legacy route param
  const parsedRepo = useMemo(() => {
    if (ownerProp && repoProp) return { owner: ownerProp, repo: repoProp };
    if (!repoRoute) return null;
    if (repoRoute.includes("--")) {
      const [ownerRaw, repoRaw] = repoRoute.split("--");
      if (!ownerRaw || !repoRaw) return null;
      try {
        const owner = decodeURIComponent(ownerRaw);
        const repo = decodeURIComponent(repoRaw);
        return { owner, repo };
      } catch {
        return null;
      }
    }
    const parts = repoRoute.split("-");
    if (parts.length < 2) return null;
    const owner = parts.slice(0, -1).join("-");
    const repo = parts[parts.length - 1]!;
    return { owner, repo };
  }, [ownerProp, repoProp, repoRoute]);

  const githubUrlFromRoute = useMemo(() => {
    if (!parsedRepo) return "";
    return `https://github.com/${parsedRepo.owner}/${parsedRepo.repo}`;
  }, [parsedRepo]);

  const [state, setState] = useState<AnalysisState>({
    currentView: "main",
    repositoryUrl: githubUrlFromRoute,
    isPrivate: false,
    privacyMode: true,
    githubToken: "",
    // dependencyDepth removed
    // llmInputMode removed
    currentAnalysisId: null,
    selectedAnalysisId: null,
    rateLimitError: null,
  });

  // Keep repositoryUrl in sync with route changes
  useEffect(() => {
    if (githubUrlFromRoute && githubUrlFromRoute !== state.repositoryUrl) {
      setState((prev) => ({ ...prev, repositoryUrl: githubUrlFromRoute }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubUrlFromRoute]);

  // Initialize from path-based analysisId if provided
  useEffect(() => {
    if (analysisId) {
      setState((prev) => ({
        ...prev,
        selectedAnalysisId: analysisId,
        currentAnalysisId: analysisId,
        currentView: "analysis-progress",
      }));
    }
  }, [analysisId]);

  const updateState = (updates: Partial<AnalysisState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const validateGitHubUrl = (url: string) => {
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubPattern.test(url);
  };

  const parseGitHubUrl = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    return { owner: match[1]!, repo: match[2]!.replace(/\.git$/, "") };
  };

  const handleUrlChange = useCallback(
    (url: string) => {
      updateState({ repositoryUrl: url, rateLimitError: null });
      if (validateGitHubUrl(url)) {
        const parsed = parseGitHubUrl(url);
        if (parsed) {
          const basePath = `/analysis/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
          router.push(basePath);
        }
      }
    },
    [router]
  );

  const debouncedRepositoryUrl = useDebounce(state.repositoryUrl, 500);
  const debouncedParsedRepo = useMemo(() => {
    return debouncedRepositoryUrl && validateGitHubUrl(debouncedRepositoryUrl)
      ? parseGitHubUrl(debouncedRepositoryUrl)
      : null;
  }, [debouncedRepositoryUrl]);

  const { data: urlBasedAnalysisData, isLoading: isLoadingUrlAnalysis } = api.github.checkExistingAnalysis.useQuery(
    {
      owner: debouncedParsedRepo?.owner ?? "",
      repo: debouncedParsedRepo?.repo ?? "",
      token: state.githubToken || undefined,
    },
    {
      enabled: !!debouncedParsedRepo,
      refetchOnWindowFocus: false,
    }
  );

  const { data: analysisDetails, isLoading: isLoadingAnalysisDetails } = api.github.getAnalysisStatus.useQuery(
    { analysisId: state.selectedAnalysisId! },
    {
      enabled: !!state.selectedAnalysisId,
    }
  );

  const startAnalysisMutation = api.github.analyzeRepositoryStandalone.useMutation({
    onSuccess: async (data) => {
      if (data.reused) {
        updateState({
          selectedAnalysisId: data.analysisId,
          currentView: "analysis-results",
          rateLimitError: null,
        });
        if (parsedRepo) {
          const basePath = `/analysis/${encodeURIComponent(parsedRepo.owner)}/${encodeURIComponent(parsedRepo.repo)}`;
          router.push(`${basePath}/${data.analysisId}`);
        }
        toast({
          title: "Analysis Found",
          description: "Using existing analysis results for this repository.",
        });
      } else {
        updateState({
          currentAnalysisId: data.analysisId,
          currentView: "analysis-progress",
          rateLimitError: null,
        });
        if (parsedRepo) {
          const basePath = `/analysis/${encodeURIComponent(parsedRepo.owner)}/${encodeURIComponent(parsedRepo.repo)}`;
          router.push(`${basePath}/${data.analysisId}`);
        }
        toast({
          title: "Analysis Started",
          description: "Repository analysis is now in progress...",
        });
      }
    },
    onError: (error) => {
      if (error.message.includes("rate limit")) {
        updateState({ rateLimitError: error.message });
        toast({
          title: "Rate Limit Exceeded",
          description: "Consider providing a GitHub token for higher limits",
          variant: "destructive",
        });
      } else {
        toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
      }
    },
  });

  const { data: currentAnalysisStatus } = api.github.getAnalysisStatus.useQuery(
    { analysisId: (state.currentAnalysisId ?? analysisId)! },
    {
      enabled: (!!state.currentAnalysisId || !!analysisId) && state.currentView === "analysis-progress",
      refetchInterval: 10000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  useEffect(() => {
    if (currentAnalysisStatus?.analysis?.status === "completed" && state.currentView === "analysis-progress") {
      const finalId = state.currentAnalysisId ?? analysisId ?? null;
      updateState({
        selectedAnalysisId: finalId,
        currentView: "analysis-results",
        currentAnalysisId: null,
      });
    }
  }, [currentAnalysisStatus?.analysis?.status, state.currentView, state.currentAnalysisId, analysisId]);

  const hasUrlBasedAnalysis = urlBasedAnalysisData?.analyses && urlBasedAnalysisData.analyses.length > 0;

  const selectedAnalysisDetails = useMemo(() => {
    if (!state.selectedAnalysisId || !urlBasedAnalysisData?.analyses) return null;
    return urlBasedAnalysisData.analyses.find((analysis) => analysis.id === state.selectedAnalysisId);
  }, [state.selectedAnalysisId, urlBasedAnalysisData?.analyses]);

  useEffect(() => {
    if (isLoaded && !isSignedIn && parsedRepo) {
      const basePath = `/analysis/${encodeURIComponent(parsedRepo.owner)}/${encodeURIComponent(parsedRepo.repo)}`;
      router.push("/sign-in?redirect_url=" + encodeURIComponent(basePath));
    }
  }, [isLoaded, isSignedIn, router, parsedRepo]);

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to access repository analysis features.</p>
            <Button onClick={() => router.push("/sign-in")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartNewAnalysis = () => {
    updateState({ currentView: "new-analysis" });
  };

  const handleStartAnalysis = async () => {
    if (!state.repositoryUrl || !validateGitHubUrl(state.repositoryUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub repository URL",
        variant: "destructive",
      });
      return;
    }
    const parsed = parseGitHubUrl(state.repositoryUrl);
    if (!parsed) return;
    try {
        await startAnalysisMutation.mutateAsync({
        owner: parsed.owner,
        repo: parsed.repo,
        isPrivate: state.isPrivate,
        privacyMode: state.privacyMode,
        token: state.isPrivate ? state.githubToken : undefined,
          // dependencyDepth removed
        // llmInputMode removed
      });
    } catch (error) {
      // Handled in onError
      // eslint-disable-next-line no-console
      console.error("Analysis failed:", error);
    }
  };

  const handleShowAnalysis = (targetAnalysisId: string) => {
    updateState({ selectedAnalysisId: targetAnalysisId, currentView: "analysis-results" });
    if (parsedRepo) {
      const basePath = `/analysis/${encodeURIComponent(parsedRepo.owner)}/${encodeURIComponent(parsedRepo.repo)}`;
      router.push(`${basePath}/${targetAnalysisId}`);
    }
  };

  const handleBackToMain = () => {
    updateState({ currentView: "main", selectedAnalysisId: null, currentAnalysisId: null });
    if (parsedRepo) {
      const basePath = `/analysis/${encodeURIComponent(parsedRepo.owner)}/${encodeURIComponent(parsedRepo.repo)}`;
      router.push(basePath);
    }
  };

  const handleCreatePlayground = (targetAnalysisId: string) => {
    if (parsedRepo) {
      const basePath = `/analysis/${encodeURIComponent(parsedRepo.owner)}/${encodeURIComponent(parsedRepo.repo)}`;
      router.push(`${basePath}/${targetAnalysisId}/create-playground`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Code2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {parsedRepo ? `${parsedRepo.owner}/${parsedRepo.repo}` : "Repository Analysis"}
                  </h1>
                  {selectedAnalysisDetails && (
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant={selectedAnalysisDetails.status === "completed" ? "default" : "secondary"}>
                        {selectedAnalysisDetails.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedAnalysisDetails.completedAt
                          ? `Completed ${new Date(selectedAnalysisDetails.completedAt).toLocaleDateString()}`
                          : `Created ${new Date(selectedAnalysisDetails.createdAt).toLocaleDateString()}`}
                      </span>
                      {!selectedAnalysisDetails.isOwnedByUser && (
                        <Badge variant="outline" className="text-xs">
                          Community Analysis
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground font-mono">{state.selectedAnalysisId}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Powered by AI
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              {state.privacyMode && (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">Privacy Mode</span>
                </div>
              )}
              <Button variant="outline" onClick={() => router.push("/analysis")}> 
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Repositories
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {state.currentView === "main" && (
          <div className="space-y-8">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Repository Analysis
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Analyzing {parsedRepo ? `${parsedRepo.owner}/${parsedRepo.repo}` : "repository"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="https://github.com/username/repository"
                      value={state.repositoryUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleStartNewAnalysis} disabled={!state.repositoryUrl || !validateGitHubUrl(state.repositoryUrl)}>
                      Analyze
                    </Button>
                  </div>
                  {state.repositoryUrl && !validateGitHubUrl(state.repositoryUrl) && (
                    <p className="text-sm text-red-600">Please enter a valid GitHub repository URL</p>
                  )}
                  {isLoadingUrlAnalysis && debouncedParsedRepo && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Checking for existing analysis...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {urlBasedAnalysisData?.analyses && urlBasedAnalysisData.analyses.length > 0 && (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {parsedRepo ? `${parsedRepo.owner}/${parsedRepo.repo}` : "Repository Analysis"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {urlBasedAnalysisData.analyses.length} analysis{urlBasedAnalysisData.analyses.length > 1 ? "es" : ""} found
                  </p>
                  {(() => {
                    const currentRepoName = parsedRepo ? `${parsedRepo.owner}/${parsedRepo.repo}` : "";
                    const hasOldNames = urlBasedAnalysisData.analyses.some((a) => {
                      const analysisRepoName = a.repositoryUrl?.replace("https://github.com/", "") || "";
                      return analysisRepoName !== currentRepoName && analysisRepoName !== "";
                    });
                    if (hasOldNames) {
                      return (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                          <div className="flex items-center justify-center gap-2 text-blue-800 dark:text-blue-200">
                            <History className="h-4 w-4" />
                            <span className="text-sm">Including analyses from previous repository names</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {urlBasedAnalysisData.analyses.map((analysis) => (
                    <Card key={analysis.id} className={`hover:shadow-md transition-shadow ${state.selectedAnalysisId === analysis.id ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex gap-2">
                            <Badge variant={analysis.status === "completed" ? "default" : "secondary"}>{analysis.status}</Badge>
                            {!analysis.isOwnedByUser && (
                              <Badge variant="outline" className="text-xs">
                                Community Analysis
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {analysis.completedAt ? new Date(analysis.completedAt).toLocaleDateString() : new Date(analysis.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          Analysis
                          {state.selectedAnalysisId === analysis.id && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              Currently Viewing
                            </Badge>
                          )}
                        </h3>
                        {(() => {
                          const currentRepoName = parsedRepo ? `${parsedRepo.owner}/${parsedRepo.repo}` : "";
                          const analysisRepoName = analysis.repositoryUrl?.replace("https://github.com/", "") || "";
                          if (analysisRepoName && analysisRepoName !== currentRepoName) {
                            return (
                              <div className="mb-2">
                                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
                                  Originally: {analysisRepoName}
                                </Badge>
                              </div>
                            );
                          }
                          return null;
                        })()}
                        {analysis.status === "completed" && (
                          <div className="text-sm text-muted-foreground mb-3">
                            {(() => {
                              const res = (analysis as unknown as { results?: AnalysisResults }).results;
                              const nodesCount = res?.nodes?.length ?? 0;
                              const edgesCount = res?.edges?.length ?? 0;
                              return `${nodesCount} components, ${edgesCount} connections`;
                            })()}
                          </div>
                        )}
                        {analysis.errorMessage && (
                          <div className="p-2 mb-3 rounded bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
                            <div className="text-xs text-red-800 dark:text-red-200">{analysis.errorMessage}</div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleShowAnalysis(analysis.id)} className="flex-1">
                            View Details
                          </Button>
                          {analysis.status === "completed" && (
                            <Button size="sm" onClick={() => handleCreatePlayground(analysis.id)} className="flex-1">
                              Create Playground
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <Button variant="outline" onClick={handleStartNewAnalysis}>
                    Run New Analysis
                  </Button>
                </div>
              </div>
            )}

            {state.repositoryUrl && validateGitHubUrl(state.repositoryUrl) && !isLoadingUrlAnalysis && !hasUrlBasedAnalysis && (
              <Card className="max-w-2xl mx-auto border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-blue-100">No Analysis Found</CardTitle>
                  <p className="text-blue-700 dark:text-blue-300">This repository hasn&apos;t been analyzed yet. Be the first to explore its architecture!</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">💡 Your analysis will be shared with the community (unless privacy mode is enabled) to help others save time and resources.</p>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleStartNewAnalysis} size="lg" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Start Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {state.currentView === "new-analysis" && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Configure New Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">Configure your analysis settings and start the repository analysis process</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="repo-url">Repository URL</Label>
                  <Input id="repo-url" placeholder="https://github.com/username/repository" value={state.repositoryUrl} onChange={(e) => handleUrlChange(e.target.value)} />
                  {state.repositoryUrl && !validateGitHubUrl(state.repositoryUrl) && <p className="text-sm text-red-600">Please enter a valid GitHub repository URL</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="private-repo" checked={state.isPrivate} onCheckedChange={(c) => updateState({ isPrivate: c === true })} />
                  <Label htmlFor="private-repo">Private repository</Label>
                </div>

                {state.isPrivate && (
                  <div className="space-y-2">
                    <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                    <Input id="github-token" type="password" placeholder="ghp_..." value={state.githubToken} onChange={(e) => updateState({ githubToken: e.target.value })} />
                    <p className="text-sm text-muted-foreground">Required for private repositories. Token will be stored securely.</p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox id="privacy-mode" checked={state.privacyMode} onCheckedChange={(c) => updateState({ privacyMode: c === true })} />
                  <Label htmlFor="privacy-mode">Privacy mode (don&apos;t use for LLM training)</Label>
                </div>

                <div className="space-y-3">
                    {/* Dependency depth slider removed; using fixed depth on server */}
                </div>

                {/* LLM Input Mode removed; depth now controls behavior */}

                {state.rateLimitError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Rate Limit Exceeded</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{state.rateLimitError}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button onClick={handleBackToMain} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleStartAnalysis} disabled={!state.repositoryUrl || !validateGitHubUrl(state.repositoryUrl) || startAnalysisMutation.isPending} className="flex-1">
                    {startAnalysisMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Starting...
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

        {state.currentView === "analysis-progress" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analysis in Progress
                </CardTitle>
                <p className="text-sm text-muted-foreground">Analyzing repository structure and identifying system components...</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">This may take a few minutes depending on repository size...</p>
                  </div>
                  {currentAnalysisStatus?.analysis.status === "completed" && (
                    <div className="text-center">
                      <Button onClick={() => handleShowAnalysis((state.currentAnalysisId ?? analysisId)!)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {state.currentView === "analysis-results" && state.selectedAnalysisId && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Analysis Results</h2>
                {selectedAnalysisDetails && (
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <Badge variant={selectedAnalysisDetails.status === "completed" ? "default" : "secondary"}>{selectedAnalysisDetails.status}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedAnalysisDetails.completedAt ? `Completed ${new Date(selectedAnalysisDetails.completedAt).toLocaleDateString()}` : `Created ${new Date(selectedAnalysisDetails.createdAt).toLocaleDateString()}`}
                    </span>
                    {!selectedAnalysisDetails.isOwnedByUser && <Badge variant="outline" className="text-xs">Community Analysis</Badge>}
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleBackToMain}>
                  Back
                </Button>
                <Button onClick={() => handleCreatePlayground(state.selectedAnalysisId!)}>Create Playground</Button>
              </div>
            </div>

            {isLoadingAnalysisDetails ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading analysis details...</span>
              </div>
            ) : analysisDetails?.analysis ? (
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold mb-1">{((analysisDetails.analysis.results as AnalysisResults)?.nodes?.length ?? 0)}</div>
                      <p className="text-sm text-muted-foreground">Components</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold mb-1">{((analysisDetails.analysis.results as AnalysisResults)?.edges?.length ?? 0)}</div>
                      <p className="text-sm text-muted-foreground">Connections</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold mb-1">{((analysisDetails.analysis.results as AnalysisResults)?.architecture?.confidence ?? 0)}%</div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mt-2">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold mb-1">{
                        (() => {
                          const val = (analysisDetails.analysis as unknown as { actualTokensUsed?: number }).actualTokensUsed ?? 0;
                          return Number(val).toLocaleString();
                        })()
                      }</div>
                      <p className="text-sm text-muted-foreground">Tokens Used</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold mb-1">{
                        (() => {
                          const val = (analysisDetails.analysis as unknown as { estimatedTokens?: number }).estimatedTokens ?? 0;
                          return Number(val).toLocaleString();
                        })()
                      }</div>
                      <p className="text-sm text-muted-foreground">Estimated Tokens</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {(analysisDetails.analysis.results as AnalysisResults)?.architecture && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Architecture Pattern</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{(analysisDetails.analysis.results as AnalysisResults).architecture!.type}</h4>
                          <Badge variant="secondary">{(analysisDetails.analysis.results as AnalysisResults).architecture!.confidence}% confident</Badge>
                        </div>
                        <p className="text-muted-foreground">{(analysisDetails.analysis.results as AnalysisResults).architecture!.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  {(analysisDetails.analysis.results as AnalysisResults)?.summary && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">{(analysisDetails.analysis.results as AnalysisResults).summary}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Tabs defaultValue="diagram" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="diagram">Diagram</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="costs">Summary</TabsTrigger>
                  </TabsList>
                  <TabsContent value="diagram" className="mt-6">
                    <AnalysisDiagram results={analysisDetails.analysis.results as AnalysisResults} />
                  </TabsContent>
                  <TabsContent value="insights" className="mt-6">
                    {(() => {
                      const results = analysisDetails.analysis.results as AnalysisResults;
                      return results?.experts && results.experts.length > 0 ? (
                        <div className="space-y-3">
                          {results.experts.map((expert, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">{expert.name}</h4>
                                  <Badge variant={expert.status === "completed" ? "default" : "secondary"}>{expert.status}</Badge>
                                </div>
                                {expert.description && <p className="text-sm text-muted-foreground">{expert.description}</p>}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No expert analysis available</p>
                        </div>
                      );
                    })()}
                  </TabsContent>
                  <TabsContent value="costs" className="mt-6">
                    {(() => {
                      const results = analysisDetails.analysis.results as AnalysisResults;
                      return (
                        <div className="space-y-6">
                          {results?.estimatedCosts && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Analysis Cost</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Tokens Used</p>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{results.estimatedCosts.tokensUsed?.toLocaleString() ?? "N/A"}</p>
                                  </div>
                                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Estimated Cost</p>
                                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">${results.estimatedCosts.actualCost?.toFixed(4) ?? "0.0000"}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          <Card>
                            <CardHeader>
                              <CardTitle>Analysis Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Repository</p>
                                  <p className="text-sm break-all">{analysisDetails.analysis.repositoryUrl}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Language</p>
                                  <p className="text-sm">{analysisDetails.analysis.detectedLanguage ?? "Unknown"}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                                  <p className="text-sm">{new Date(analysisDetails.analysis.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })()}
                  </TabsContent>
                </Tabs>

                <div className="text-center pt-8 border-t">
                  <Button onClick={() => handleCreatePlayground(state.selectedAnalysisId!)} size="lg">
                    Create Playground
                  </Button>
                </div>
              </div>
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


