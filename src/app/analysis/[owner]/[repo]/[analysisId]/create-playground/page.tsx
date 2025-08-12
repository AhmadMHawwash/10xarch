"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  Server, 
  Database, 
  Globe,
  MessageSquare,
  Zap,
  Settings,
  Plus
} from "lucide-react";
import { api } from "@/trpc/react";
import type { AnalysisResults, AnalysisNode, AnalysisEdge } from "@/types/analysis";

export default function CreatePlaygroundPage() {
  const router = useRouter();
  const params = useParams();
  const owner = decodeURIComponent(params.owner as string);
  const repo = decodeURIComponent(params.repo as string);
  const analysisId = params.analysisId as string;
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch analysis data
  const { data: analysisData, isLoading: isLoadingAnalysis, error: analysisError } = api.github.getAnalysisStatus.useQuery(
    { analysisId },
    { enabled: !!analysisId }
  );

  // Create playground mutation
  const createPlaygroundMutation = api.playgrounds.createFromAnalysis.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Playground Created",
        description: `Successfully created playground with ${data.componentsAdded} components and ${data.connectionsAdded} connections.`,
      });
      router.push(`/playgrounds/${data.playground.id}`);
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  // Auto-generate title and description based on analysis
  useEffect(() => {
    if (analysisData?.analysis) {
      const repoName = analysisData.analysis.repositoryName ?? `${owner}/${repo}`;
      setTitle(`${repoName} System Design`);
      setDescription(`System design playground created from ${repoName} repository analysis`);
    }
  }, [analysisData, owner, repo]);

  if (isLoadingAnalysis) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (analysisError ?? !analysisData?.analysis) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Analysis not found or failed to load. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const analysis = analysisData.analysis;
  const results = analysis.results as AnalysisResults;

  const handleComponentToggle = (componentId: string) => {
    setSelectedComponents(prev => 
      prev.includes(componentId) 
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  const handleConnectionToggle = (connectionId: string) => {
    setSelectedConnections(prev => 
      prev.includes(connectionId) 
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    );
  };

  const handleSelectAllComponents = () => {
    const allIds = results?.nodes?.map((_, index) => `component-${index}`) ?? [];
    setSelectedComponents(allIds);
  };

  const handleDeselectAllComponents = () => {
    setSelectedComponents([]);
  };

  const handleSelectAllConnections = () => {
    const allIds = results?.edges?.map((_, index) => `connection-${index}`) ?? [];
    setSelectedConnections(allIds);
  };

  const handleDeselectAllConnections = () => {
    setSelectedConnections([]);
  };

  const handleCreatePlayground = async () => {
    setIsLoading(true);
    try {
      await createPlaygroundMutation.mutateAsync({
        analysisId,
        title,
        description,
        selectedComponents,
        selectedConnections,
      });
    } catch (error) {
      console.error("Failed to create playground:", error);
    }
  };

  const getComponentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "server":
      case "backend":
        return <Server className="h-4 w-4" />;
      case "database":
      case "db":
        return <Database className="h-4 w-4" />;
      case "api":
      case "rest":
        return <Globe className="h-4 w-4" />;
      case "queue":
      case "messaging":
        return <MessageSquare className="h-4 w-4" />;
      case "cache":
        return <Zap className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const nodes = results?.nodes ?? [];
  const edges = results?.edges ?? [];

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/analysis/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Analysis
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Playground</h1>
            <p className="text-muted-foreground">
              Select components and connections to include in your playground
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Playground Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter playground title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter playground description"
                  rows={3}
                />
              </div>
              
              {/* Selection Summary */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Components</p>
                    <p className="text-lg font-bold">{selectedComponents.length}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Connections</p>
                    <p className="text-lg font-bold">{selectedConnections.length}</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCreatePlayground}
                disabled={isLoading || selectedComponents.length === 0}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Playground
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Components and Connections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Components Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Components ({nodes.length})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllComponents}
                    disabled={nodes.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAllComponents}
                    disabled={selectedComponents.length === 0}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {nodes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nodes.map((node: AnalysisNode, index: number) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedComponents.includes(` + "`component-${index}`" + `)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleComponentToggle(` + "`component-${index}`" + `)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <Checkbox
                            checked={selectedComponents.includes(` + "`component-${index}`" + `)}
                            onChange={() => handleComponentToggle(` + "`component-${index}`" + `)}
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getComponentIcon(node.name)}
                              <span className="font-medium text-sm truncate">
                                {node.displayName ?? node.title ?? node.name}
                              </span>
                            </div>
                            {node.subtitle && (
                              <p className="text-xs text-muted-foreground truncate">
                                {node.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {node.confidence}%
                        </Badge>
                      </div>
                      
                      {node.evidence && node.evidence.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Evidence:</p>
                          <ul className="space-y-1">
                            {node.evidence.slice(0, 2).map((evidence, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                <span className="truncate">{evidence}</span>
                              </li>
                            ))}
                            {node.evidence.length > 2 && (
                              <li className="text-xs text-muted-foreground">
                                +{node.evidence.length - 2} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No system components identified in this analysis</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connections Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Connections ({edges.length})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllConnections}
                    disabled={edges.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAllConnections}
                    disabled={selectedConnections.length === 0}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {edges.length > 0 ? (
                <div className="space-y-3">
                  {edges.map((edge: AnalysisEdge, index: number) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedConnections.includes(` + "`connection-${index}`" + `)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-200 hover-border-gray-300"
                      }`}
                      onClick={() => handleConnectionToggle(` + "`connection-${index}`" + `)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <Checkbox
                            checked={selectedConnections.includes(` + "`connection-${index}`" + `)}
                            onChange={() => handleConnectionToggle(` + "`connection-${index}`" + `)}
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-sm font-mono">
                              <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">
                                {edge.source}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs">
                                {edge.target}
                              </span>
                            </div>
                            {edge.data?.label && (
                              <p className="text-xs text-muted-foreground mt-1">{edge.data.label}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {edge.confidence}%
                        </Badge>
                      </div>
                      
                      {edge.data?.apiDefinition && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-1">API Definition:</p>
                          <p className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded font-mono">
                            {edge.data.apiDefinition}
                          </p>
                        </div>
                      )}
                      
                      {edge.evidence && edge.evidence.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Evidence:</p>
                          <ul className="space-y-1">
                            {edge.evidence.slice(0, 2).map((evidence, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                <span className="truncate">{evidence}</span>
                              </li>
                            ))}
                            {edge.evidence.length > 2 && (
                              <li className="text-xs text-muted-foreground">
                                +{edge.evidence.length - 2} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No system connections identified in this analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


