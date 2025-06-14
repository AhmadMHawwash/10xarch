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
  canEdit = true,
}: {
  edge: Edge | null;
  className?: string;
  canEdit?: boolean;
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
    newRequestFlow: string = requestFlow,
  ) => {
    if (!canEdit) return; // Don't update if in view-only mode
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
  const sourceNode = nodes.find((node) => node.id === edge.source);
  const targetNode = nodes.find((node) => node.id === edge.target);

  // Extract node names with proper type checking
  const getNodeName = (node: Node | undefined, fallback: string): string => {
    if (!node) return fallback;
    const nodeData = node.data as NodeData;

    return nodeData.configs?.title ?? nodeData.id ?? nodeData.name ?? "";
  };

  const sourceName = getNodeName(sourceNode, edge.source);
  const targetName = getNodeName(targetNode, edge.target);

  return (
    <div className={className}>
      <div className="connection-settings-container overflow-auto">
        <div className="connection-inner-content w-full space-y-4">
          <div className="connection-info rounded-md bg-gray-100 p-3 dark:bg-gray-800">
            <div className="flex items-center justify-center space-x-4">
              <span className="max-w-[45%] truncate rounded bg-gray-200 px-2 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {sourceName}
              </span>
              <span className="flex items-center text-blue-500 dark:text-blue-400">
                <ArrowRight className="h-4 w-5" />
              </span>
              <span className="max-w-[45%] truncate rounded bg-gray-200 px-2 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {targetName}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="connection-title">
              Connection Title {!canEdit && <span className="text-xs text-gray-500">(Read Only)</span>}
            </Label>
            <Input
              id="connection-title"
              value={label}
              onChange={handleLabelChange}
              placeholder="e.g., API Request, Database Query"
              className="bg-gray-50 dark:bg-gray-800"
              onKeyDown={(e) => e.stopPropagation()}
              readOnly={!canEdit}
            />
          </div>

          <Tabs defaultValue="api" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="api">API Definition</TabsTrigger>
              <TabsTrigger value="request">Request Flow</TabsTrigger>
            </TabsList>
            <TabsContent value="api">
              <div className="space-y-2">
                <Label htmlFor="api-definition">
                  API Definition {!canEdit && <span className="text-xs text-gray-500">(Read Only)</span>}
                </Label>
                <Textarea
                  id="api-definition"
                  value={apiDefinition}
                  onChange={handleApiDefinitionChange}
                  placeholder="Define the API endpoint, method, payload..."
                  className="min-h-[200px] bg-gray-50 dark:bg-gray-800"
                  readOnly={!canEdit}
                />
              </div>
            </TabsContent>
            <TabsContent value="request">
              <div className="space-y-2">
                <Label htmlFor="request-flow">
                  Request Flow {!canEdit && <span className="text-xs text-gray-500">(Read Only)</span>}
                </Label>
                <Textarea
                  id="request-flow"
                  value={requestFlow}
                  onChange={handleRequestFlowChange}
                  placeholder="Describe the request/response flow between components..."
                  className="min-h-[200px] bg-gray-50 dark:bg-gray-800"
                  readOnly={!canEdit}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
