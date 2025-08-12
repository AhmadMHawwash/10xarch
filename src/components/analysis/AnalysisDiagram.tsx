"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  type NodeChange,
  type EdgeChange,
} from "reactflow";
import "reactflow/dist/base.css";
import "reactflow/dist/style.css";

import type { AnalysisResults } from "@/types/analysis";
import { convertAnalysisToReactFlow } from "@/lib/utils/analysis-to-diagram";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SystemComponentNode from "@/components/ReactflowCustomNodes/SystemComponentNode";
import { CustomEdgeComponent as CustomEdge } from "@/components/CustomEdge";
import type { SystemComponentNodeDataProps } from "@/components/ReactflowCustomNodes/SystemComponentNode";

interface AnalysisDiagramProps {
  results: AnalysisResults;
}

// Define node and edge types outside component to prevent recreation on each render
const nodeTypes = {
  SystemComponentNode,
} as const;

const edgeTypes = {
  CustomEdge,
} as const;

export default function AnalysisDiagram({ results }: AnalysisDiagramProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [componentMapping, setComponentMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [lastResultsHash, setLastResultsHash] = useState<string>("");

  // Custom change handlers that skip deletion
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Filter out remove changes to prevent deletion
    const filteredChanges = changes.filter(change => change.type !== 'remove');
    onNodesChange(filteredChanges);
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Filter out remove changes to prevent deletion
    const filteredChanges = changes.filter(change => change.type !== 'remove');
    onEdgesChange(filteredChanges);
  }, [onEdgesChange]);

  // Create a hash of the results to detect when they actually change
  const resultsHash = useMemo(() => {
    return JSON.stringify(results);
  }, [results]);

  useEffect(() => {
    // Only reload if the results actually changed
    if (resultsHash === lastResultsHash) {
      return;
    }

    let isMounted = true;
    
    const loadDiagramData = async () => {
      try {
        setLoading(true);
        const converted = await convertAnalysisToReactFlow(results);
        
        if (isMounted) {
          setNodes(converted.nodes);
          setEdges(converted.edges);
          setComponentMapping(converted.componentMapping);
          setLastResultsHash(resultsHash);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to convert analysis data:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDiagramData();

    return () => {
      isMounted = false;
    };
  }, [resultsHash, lastResultsHash, setNodes, setEdges]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span>Processing analysis with AI mapping...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results.nodes || results.nodes.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No system components identified in this analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Component mapping info */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Component Mapping</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(componentMapping).map(([original, mapped]) => (
              <Badge key={original} variant="outline" className="text-xs">
                {original} → {mapped}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diagram container */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={{
                markerEnd: { type: MarkerType.ArrowClosed },
                animated: false,
                style: { stroke: '#374151', strokeWidth: 2 },
              }}
              fitView
              fitViewOptions={{ padding: 50, includeHiddenNodes: false }}
              minZoom={0.1}
              maxZoom={2}
              nodesDraggable={true}
              nodesConnectable={false}
              elementsSelectable={true}
              panOnDrag={true}
              panOnScroll={true}
              className="light-theme dark:dark-theme"
              proOptions={{
                hideAttribution: true,
              }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                color="#4a5568"
                gap={12}
                size={1}
              />
              <Controls />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* Diagram stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{nodes.length}</div>
            <p className="text-sm text-muted-foreground">Components</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{edges.length}</div>
            <p className="text-sm text-muted-foreground">Connections</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 