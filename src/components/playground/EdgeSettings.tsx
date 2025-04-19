import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type Edge, type Node } from "reactflow";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ArrowRight } from "lucide-react";

interface EdgeData {
  apiDefinition?: string;
  requestFlow?: string;
  label?: string; // Label might be stored in data too
  [key: string]: unknown;
}

interface NodeData {
  id: string;
  name?: string;
  configs?: {
    title?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const EdgeSettings = ({
  edge,
  className,
}: {
  edge: Edge | null;
  className?: string;
}) => {
  const { updateEdgeLabel, nodes } = useSystemDesigner();
  const [label, setLabel] = useState("");
  const [apiDefinition, setApiDefinition] = useState("");
  const [requestFlow, setRequestFlow] = useState("");

  // Initialize state from edge data when edge changes
  useEffect(() => {
    if (edge) {      
      // Check label in all possible locations
      const edgeLabel = 
        (typeof edge.label === "string" ? edge.label : "") || 
        ((edge.data as EdgeData)?.label ?? "");
      
      setLabel(edgeLabel);
      
      const data = edge.data as EdgeData | undefined;
      setApiDefinition(data?.apiDefinition ?? "");
      setRequestFlow(data?.requestFlow ?? "");
    }
  }, [edge]);

  if (!edge) return null;

  // Centralized function to update edge data
  const updateEdgeData = (
    newLabel: string = label,
    newApiDefinition: string = apiDefinition,
    newRequestFlow: string = requestFlow
  ) => {
    updateEdgeLabel(edge.id, newLabel, {
      label: newLabel, // Store in data as well for consistency
      apiDefinition: newApiDefinition,
      requestFlow: newRequestFlow,
    });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    updateEdgeData(newLabel);
  };

  const handleApiDefinitionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newApiDefinition = e.target.value;
    setApiDefinition(newApiDefinition);
    updateEdgeData(label, newApiDefinition);
  };

  const handleRequestFlowChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newRequestFlow = e.target.value;
    setRequestFlow(newRequestFlow);
    updateEdgeData(label, apiDefinition, newRequestFlow);
  };
  
  // Get source and target node names
  const sourceNode = nodes.find(node => node.id === edge.source);
  const targetNode = nodes.find(node => node.id === edge.target);
  
  // Extract node names with proper type checking
  const getNodeName = (node: Node | undefined, fallback: string): string => {
    if (!node) return fallback;
    const nodeData = node.data as NodeData;
    return nodeData.configs?.title ?? 
           nodeData.name ?? 
           nodeData.id ?? 
           fallback;
  };
  
  const sourceName = getNodeName(sourceNode, edge.source);
  const targetName = getNodeName(targetNode, edge.target);

  return (
    <div className={className}>
      <div className="connection-settings-container overflow-auto">
        <div className="connection-inner-content w-full space-y-4">
          <div className="connection-info rounded-md bg-gray-100 p-3 dark:bg-gray-800">
            <div className="flex items-center justify-center space-x-3 font-medium">
              <span className="rounded bg-gray-200 px-2 py-1 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {sourceName}
              </span>
              <span className="flex items-center text-blue-500 dark:text-blue-400">
                <ArrowRight className="h-4 w-5" />
              </span>
              <span className="rounded bg-gray-200 px-2 py-1 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {targetName}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="connection-title">Connection Title</Label>
            <Input
              id="connection-title"
              value={label}
              onChange={handleLabelChange}
              placeholder="e.g., API Request, Database Query"
            />
          </div>

          <Tabs defaultValue="api-definition" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger className="w-full" value="api-definition">
                API Definition
              </TabsTrigger>
              <TabsTrigger className="w-full" value="request-flow">
                Request Flow
              </TabsTrigger>
            </TabsList>
            <TabsContent value="api-definition">
              <div className="space-y-2">
                <Textarea
                  id="api-definition"
                  value={apiDefinition}
                  onChange={handleApiDefinitionChange}
                  placeholder="Define API endpoints, request/response formats..."
                  rows={4}
                  data-testid="api-definition-textarea"
                />
              </div>
            </TabsContent>
            <TabsContent value="request-flow">
              <div className="space-y-2">
                <Textarea
                  id="request-flow"
                  value={requestFlow}
                  onChange={handleRequestFlowChange}
                  placeholder="Describe how requests flow through this connection..."
                  aria-label="Request Flow"
                  rows={4}
                  data-testid="request-flow-textarea"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
