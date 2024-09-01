import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { Check, ChevronUp, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { SolutionFeedback } from "./SolutionFeedback";
import { Button } from "./ui/button";

export const FlowManager: React.FC = () => {
  const [resetDone, setResetDone] = useState(false);
  const { checkSolution, isLoadingAnswer, answer } = useChallengeManager();
  const { setNodes, setEdges } = useSystemDesigner();
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);

  const resetFlow = () => {
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
      className={`flex flex-col items-center rounded-md border border-gray-700 bg-gray-800 px-4 py-2 ${isFeedbackExpanded ? "w-[500px]" : "w-fit"} transition-all duration-300`}
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
          className="border-gray-600 text-gray-200 hover:bg-gray-700"
        >
          {resetDone ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          onClick={checkSolution}
          disabled={isLoadingAnswer}
          title="Check solution"
          className="bg-blue-600 text-gray-200 hover:bg-blue-700"
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
            className="h-4 w-4 p-0 text-gray-300 hover:bg-gray-700"
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
