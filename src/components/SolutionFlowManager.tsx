import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { type SystemComponentType } from "@/lib/levels/type";
import { Check, ChevronUp, Loader2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { type Edge, type Node } from "reactflow";
import { getSystemComponent } from "./Gallery";
import {
  type OtherNodeDataProps,
  type SystemComponentNodeDataProps,
} from "./ReactflowCustomNodes/SystemComponentNode";
import { SolutionFeedback } from "./SolutionFeedback";
import { Button } from "./ui/button";

type FlowData = {
  nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[];
  edges: Edge[];
};

export const FlowManager: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const { checkSolution, isLoadingAnswer, answer } = useChallengeManager();
  const { nodes, edges, setNodes, setEdges } = useSystemDesigner();
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);

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
                // We have to assign the icon because it's not serializable (when saved in localStorage)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                icon: getSystemComponent(node.data.name as SystemComponentType)
                  .icon,
                name: node.data.name as SystemComponentType,
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
    setResetDone(true);
    setTimeout(() => setResetDone(false), 1500); // Reset after 2 seconds
  };

  return (
    <div
      className={`flex flex-col items-center rounded-sm border border-slate-200 bg-slate-100 px-4 py-2 ${isFeedbackExpanded ? "w-[500px]" : "w-fit"} transition-all duration-300`}
    >
      <SolutionFeedback
        isExpanded={isFeedbackExpanded}
        isLoadingAnswer={isLoadingAnswer}
        answer={answer}
        onToggleExpand={setIsFeedbackExpanded}
      />
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          onClick={resetFlow}
          variant="outline"
          title="Reset solution to initial state"
          disabled={resetDone}
        >
          {resetDone ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
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
        {answer && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFeedbackExpanded(!isFeedbackExpanded)}
            className="h-4 w-4 p-0"
          >
            <ChevronUp
              className={`h-4 w-4 ${isFeedbackExpanded ? "hidden" : ""}`}
            />
          </Button>
        )}
      </div>
    </div>
  );
};
