"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Github, 
  Shield, 
  Loader2,
  Code2,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/trpc/react";

// Debounce utility function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AnalysisIndexPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isSignedIn, isLoaded } = useUser();

  const [repositoryUrl, setRepositoryUrl] = useState('');
  // Reserve for future debounce needs
  useDebounce(repositoryUrl, 200);

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

  const createRepoRoute = (owner: string, repo: string) => {
    return `${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  };

  // Handle repository URL input with debouncing
  const handleUrlChange = useCallback((url: string) => {
    setRepositoryUrl(url);
  }, []);

  const handleAnalyzeRepository = () => {
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

    const repoRoute = createRepoRoute(parsed.owner, parsed.repo);
    router.push(`/analysis/${repoRoute}`);
  };

  // Load user's analyzed repositories (latest per repo)
  const { data: myRepos, isLoading: myReposLoading, error: myReposError, refetch } = api.github.listMyAnalyzedRepos.useQuery({ limit: 10 });
  const [showAll, setShowAll] = useState(false);
  const { data: allRepos, isLoading: allReposLoading, error: allReposError } = api.github.listMyAnalyzedRepos.useQuery({ all: true }, { enabled: showAll });

  // No quick search: URL only per product decision

  // Show loading while checking authentication
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

  // Show sign in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to access repository analysis features.
            </p>
            <Button onClick={() => router.push('/sign-in')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Code2 className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Repository Analysis
                </h1>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Powered by AI
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Analyze GitHub Repositories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Get AI-powered insights into repository architecture, components, and system design. 
              Discover patterns, identify components, and create system diagrams automatically.
            </p>
          </div>

          {/* Analyze Repository URL */}

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Analyze Repository URL
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter a complete GitHub repository URL for detailed analysis
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAnalyzeRepository();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleAnalyzeRepository}
                    disabled={!repositoryUrl || !validateGitHubUrl(repositoryUrl)}
                  >
                    Analyze
                  </Button>
                </div>
                
                {repositoryUrl && !validateGitHubUrl(repositoryUrl) && (
                  <p className="text-sm text-red-600">Please enter a valid GitHub repository URL</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Your analyzed repositories */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Your analyzed repositories</CardTitle>
                <p className="text-sm text-muted-foreground">Most recent first</p>
              </CardHeader>
              <CardContent>
                {myReposLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                  </div>
                )}
                {myReposError && (
                  <div className="text-sm text-red-600">Failed to load repositories</div>
                )}
                {myRepos && myRepos.repos.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    You have no analyzed repositories yet. Paste a GitHub URL above to start.
                  </div>
                )}
                {myRepos && myRepos.repos.length > 0 && (
                  <div className="divide-y rounded-md border">
                    {(showAll ? (allRepos?.repos ?? []) : myRepos.repos).map((r) => {
                      const [owner, repo] = r.fullName.split("/");
                      const status = String(r.latestStatus).toLowerCase();
                      const statusClass = (() => {
                        switch (status) {
                          case "completed":
                            return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
                          case "failed":
                            return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
                          case "analyzing":
                          case "pending":
                            return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
                          case "cancelled":
                            return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800";
                          default:
                            return "bg-secondary text-secondary-foreground border-muted";
                        }
                      })();
                      return (
                        <button
                          key={r.fullName}
                          className="w-full text-left px-4 py-3 hover:bg-muted/50 focus:outline-none"
                          onClick={() => router.push(`/analysis/${encodeURIComponent(owner!)}/${encodeURIComponent(repo!)}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Github className="h-4 w-4" />
                              <span className="font-medium">{r.fullName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{new Date(r.lastAnalyzedAt).toLocaleString()}</span>
                              <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs capitalize ${statusClass}`}>
                                {status}
                              </span>
                              {r.isPrivate && (
                                <span className="inline-flex items-center rounded border px-2 py-0.5 text-xs">
                                  <Shield className="h-3 w-3 mr-1" /> private
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {myRepos && myRepos.hasMore && !showAll && (
                  <div className="mt-3">
                    <Button variant="secondary" onClick={() => setShowAll(true)} disabled={allReposLoading}>
                      {allReposLoading ? (
                        <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading all…</span>
                      ) : (
                        'Load all'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Getting Started Guide */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>How it Works</CardTitle>
                <p className="text-muted-foreground">
                  Get started with repository analysis in three simple steps
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                    </div>
                    <h3 className="font-semibold">Enter Repository</h3>
                    <p className="text-sm text-muted-foreground">
                      Search by name or paste any GitHub repository URL to start the analysis process
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                    </div>
                    <h3 className="font-semibold">AI Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI analyzes the codebase to identify architecture patterns and components
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">3</span>
                    </div>
                    <h3 className="font-semibold">Create Playground</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the analysis results to create interactive system design diagrams
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 