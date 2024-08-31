import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Loader2, RotateCcw } from "lucide-react";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { type Node, type Edge } from "reactflow";
import {
  type SystemComponentNodeDataProps,
  type OtherNodeDataProps,
} from "./ReactflowCustomNodes/SystemComponentNode";

type FlowData = {
  nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[];
  edges: Edge[];
};

export const FlowManager: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { checkSolution, isLoadingAnswer } = useChallengeManager();
  const { nodes, edges, setNodes, setEdges } = useSystemDesigner();

  useEffect(() => {
    const savedData = localStorage.getItem("reactFlowData");

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as FlowData;
        if (
          Array.isArray(parsedData.nodes) &&
          Array.isArray(parsedData.edges)
        ) {
          setNodes(
            parsedData.nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                name: node.data.name as "Whiteboard" | "Group" | "APIs List",
              },
            })),
          );
          setEdges(parsedData.edges);
        }
      } catch (error) {
        console.error("Error parsing saved flow data:", error);
        resetFlow();
      }
    } else {
      resetFlow();
    }
    setIsLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setNodes, setEdges]);

  useEffect(() => {
    const saveToLocalStorage = () => {
      const flowData: FlowData = { nodes, edges };
      localStorage.setItem("reactFlowData", JSON.stringify(flowData));
    };

    if (isLoaded) {
      saveToLocalStorage();
    }
  }, [nodes, edges, isLoaded]);

  const resetFlow = () => {
    localStorage.removeItem("reactFlowData");
    setNodes([
      {
        id: "Whiteboard-1",
        type: "Whiteboard",
        data: {
          name: "Whiteboard" as const,
          id: "Whiteboard-1",
          configs: {},
        },
        position: {
          x: 100,
          y: 100,
        },
      },
    ]);
    setEdges([]);
  };

  return (
    <div className="flex rounded-sm bg-slate-100 p-2">
      <Button
        size="xs"
        className="mr-2"
        onClick={resetFlow}
        variant="outline"
        title="Reset solution to initial state"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        size="xs"
        onClick={checkSolution}
        disabled={isLoadingAnswer}
        title="Check solution"
      >
        {isLoadingAnswer ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Run solution"
        )}
      </Button>
    </div>
  );
};
