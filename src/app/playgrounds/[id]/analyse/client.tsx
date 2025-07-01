"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Github, 
  Shield, 
  Settings, 
  Search, 
  Database, 
  Server, 
  Globe, 
  Loader2
} from "lucide-react";
import type { Playground } from "@/server/db/schema";
import type { SystemComponentType } from "@/lib/levels/type";
import { 
  AnalysisExpertCard,
  IdentifiedComponentsCard,
  RepositoryInfoCard,
  AnalysisLogCard,
  CurrentAnalysisCard,
  createLogEntry,
  type ExpertStatus,
  type IdentifiedComponent,
  type RepositoryInfo,
  type AnalysisLogEntry
} from "@/components/playground/analysis";

interface AnalysisClientProps {
  playgroundId: string;
  playground: Playground;
}

export default function AnalysisClient({ playgroundId, playground }: AnalysisClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [githubToken, setGithubToken] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [estimatedTokens, setEstimatedTokens] = useState<number | null>(null);
  const [analysisStarted, setAnalysisStarted] = useState(false);

  // Analysis state using the new component types
  const [experts, setExperts] = useState<ExpertStatus[]>([
    { id: 'scout', name: 'Repository Scout', icon: Search, status: 'pending', progress: 0 },
    { id: 'infrastructure', name: 'Infrastructure Expert', icon: Server, status: 'pending', progress: 0 },
    { id: 'api', name: 'API Analyst', icon: Globe, status: 'pending', progress: 0 },
    { id: 'data', name: 'Data Expert', icon: Database, status: 'pending', progress: 0 },
    { id: 'frontend', name: 'Frontend Analyst', icon: Globe, status: 'pending', progress: 0 },
    { id: 'devops', name: 'DevOps Specialist', icon: Settings, status: 'pending', progress: 0 },
  ]);

  const [identifiedComponents, setIdentifiedComponents] = useState<IdentifiedComponent[]>([]);
  const [analysisLog, setAnalysisLog] = useState<AnalysisLogEntry[]>([]);
  const [repositoryInfo, setRepositoryInfo] = useState<RepositoryInfo>({
    language: '',
    architecture: '',
    framework: '',
    dependencies: 0,
  });

  const validateGitHubUrl = (url: string) => {
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubPattern.test(url);
  };

  const handleUrlChange = (url: string) => {
    setRepositoryUrl(url);
    
    if (validateGitHubUrl(url)) {
      // Extract repo info and estimate tokens
      setEstimatedTokens(Math.floor(Math.random() * 3000) + 1500); // Mock estimation
    } else {
      setEstimatedTokens(null);
    }
  };

  const startAnalysis = async () => {
    if (!validateGitHubUrl(repositoryUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub repository URL",
        variant: "destructive",
      });
      return;
    }

    if (isPrivate && !githubToken) {
      toast({
        title: "GitHub Token Required",
        description: "Please provide a GitHub token for private repositories",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStarted(true);
    
    // Mock analysis progression
    simulateAnalysis();
  };

  const simulateAnalysis = () => {
    // Set repository info based on detected patterns
    const detectedInfo: RepositoryInfo = {
      language: 'Node.js',
      architecture: 'Monolith',
      framework: 'Express',
      dependencies: 47,
      packageManager: 'npm',
      estimatedTokens: estimatedTokens ?? 2400,
    };
    setRepositoryInfo(detectedInfo);

    // Add initial log entry
    setAnalysisLog([createLogEntry("Starting repository analysis...", "info", "System")]);

    let currentExpertIndex = 0;
    const progressInterval = setInterval(() => {
      setExperts(prev => prev.map((expert, index) => {
        if (index === currentExpertIndex) {
          const newProgress = Math.min(expert.progress + 20, 100);
          const isCompleted = newProgress === 100;
          
          if (isCompleted && index < prev.length - 1) {
            currentExpertIndex++;
            // Add completion log
            setAnalysisLog(prev => [...prev, 
              createLogEntry(`${expert.name} completed analysis`, "success", expert.name)
            ]);
          }
          
          return {
            ...expert,
            status: isCompleted ? 'completed' : 'analyzing' as const,
            progress: newProgress,
            currentTask: isCompleted ? undefined : `Analyzing ${expert.name.toLowerCase()}...`,
            findings: isCompleted ? Math.floor(Math.random() * 8) + 3 : expert.findings,
          };
        } else if (index < currentExpertIndex) {
          return { ...expert, status: 'completed' as const, progress: 100 };
        }
        return expert;
      }));

      // Add analysis log entries based on current expert
      if (Math.random() > 0.6 && currentExpertIndex < experts.length) {
        const currentExpert = experts[currentExpertIndex];
        if (currentExpert) {
          const messages = getExpertMessages(currentExpert.name);
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          if (randomMessage) {
            setAnalysisLog(prev => [...prev.slice(-10), // Keep last 10 entries
              createLogEntry(randomMessage, Math.random() > 0.8 ? "warning" : "info", currentExpert.name)
            ]);
          }
        }
      }

      // Add identified components progressively using correct Gallery types
      if (currentExpertIndex >= 2 && identifiedComponents.length < 4) {
        const componentConfigs = [
          { name: 'React Client', type: 'Client' as SystemComponentType, confidence: 95, details: 'React frontend application' },
          { name: 'Express API Server', type: 'Server' as SystemComponentType, confidence: 98, details: 'Node.js Express API server' },
          { name: 'MongoDB Database', type: 'Database' as SystemComponentType, confidence: 92, details: 'NoSQL database for data persistence' },
          { name: 'Redis Cache', type: 'Cache' as SystemComponentType, confidence: 75, details: 'In-memory caching layer' },
        ];
        
        setIdentifiedComponents(prev => {
          const index = prev.length;
          if (index < componentConfigs.length) {
            const config = componentConfigs[index];
            if (config) {
              return [
                ...prev,
                {
                  id: `component-${index}`,
                  name: config.name,
                  type: config.confidence > 90 ? 'confirmed' : 'suspected' as const,
                  componentType: config.type,
                  confidence: config.confidence,
                  details: config.details,
                  customDescription: config.confidence < 80 ? 'Needs manual verification' : undefined,
                }
              ];
            }
          }
          return prev;
        });
      }

      // Complete analysis
      if (currentExpertIndex >= experts.length) {
        clearInterval(progressInterval);
        setIsAnalyzing(false);
        setAnalysisLog(prev => [...prev, 
          createLogEntry("Repository analysis completed successfully!", "success", "System")
        ]);
        toast({
          title: "Analysis Complete",
          description: "Repository analysis finished successfully",
        });
      }
    }, 2500);
  };

  const getExpertMessages = (expertName: string): string[] => {
    const messageMap: Record<string, string[]> = {
      'Repository Scout': [
        'Scanning package.json for dependencies...',
        'Found Express.js framework',
        'Detected Node.js project structure',
        'Analyzing project configuration files...'
      ],
      'Infrastructure Expert': [
        'Checking for Docker configuration...',
        'Found load balancer configuration hints',
        'Analyzing scaling patterns...',
        'Reviewing infrastructure setup...'
      ],
      'API Analyst': [
        'Scanning route definitions...',
        'Found 12 API endpoints',
        'Analyzing middleware configuration...',
        'Checking API authentication patterns...'
      ],
      'Data Expert': [
        'MongoDB connection detected',
        'Analyzing database schema patterns...',
        'Found data migration scripts',
        'Checking for database indexes...'
      ],
      'Frontend Analyst': [
        'React components detected',
        'Analyzing API call patterns...',
        'Found state management setup',
        'Checking frontend routing...'
      ],
      'DevOps Specialist': [
        'Analyzing CI/CD configuration...',
        'Found deployment scripts',
        'Checking monitoring setup...',
        'Reviewing security configurations...'
      ]
    };
    return messageMap[expertName] ?? ['Analyzing codebase...'];
  };

  const handleGeneratePlayground = () => {
    router.push(`/playgrounds/${playgroundId}`);
  };

  const handleDiscardAnalysis = () => {
    router.push('/playgrounds');
  };

  const overallProgress = experts.reduce((sum, expert) => sum + expert.progress, 0) / experts.length;

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
                onClick={() => router.push('/playgrounds')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Github className="h-5 w-5" />
                <span className="font-medium">Repository Analysis</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {privacyMode && (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Privacy Mode</span>
                </div>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {!analysisStarted ? (
          /* Repository Input Form */
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Analyze GitHub Repository</CardTitle>
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
                  {estimatedTokens && (
                    <p className="text-sm text-muted-foreground">
                      Estimated tokens: ~{estimatedTokens.toLocaleString()}
                    </p>
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

                <div className="flex space-x-3">
                  <Button onClick={handleDiscardAnalysis} variant="outline">
                    Cancel
                  </Button>
                  <Button 
                    onClick={startAnalysis} 
                    disabled={!validateGitHubUrl(repositoryUrl) || isAnalyzing}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting Analysis...
                      </>
                    ) : (
                      'Start Analysis'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Analysis Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Progress & Info */}
            <div className="lg:col-span-1 space-y-6">
              <AnalysisExpertCard experts={experts} overallProgress={overallProgress} />
              <RepositoryInfoCard 
                repositoryInfo={repositoryInfo} 
                repositoryUrl={repositoryUrl}
              />
            </div>

            {/* Right Columns - Current Analysis, Components & Log */}
            <div className="lg:col-span-2 space-y-6">
              <CurrentAnalysisCard experts={experts} overallProgress={overallProgress} />
              <IdentifiedComponentsCard components={identifiedComponents} />
              <AnalysisLogCard entries={analysisLog} maxHeight={240} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {analysisStarted && (
          <div className="flex justify-center space-x-4 mt-8">
            <Button variant="outline" onClick={handleDiscardAnalysis}>
              🚫 Discard Analysis
            </Button>
            <Button variant="outline" disabled>
              💾 Save Draft
            </Button>
            <Button 
              onClick={handleGeneratePlayground}
              disabled={overallProgress < 100}
              className="bg-green-600 hover:bg-green-700"
            >
              🎨 Generate Playground
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 