import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { defaultStartingNodes, useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { Check, ChevronUp, Loader2, RotateCcw, Play } from "lucide-react";
import { useState } from "react";
import { SolutionFeedback } from "./SolutionFeedback";
import { Button } from "./ui/button";

export const FlowManager: React.FC = () => {
  const [resetDone, setResetDone] = useState(false);
  const {
    checkSolution,
    isLoadingAnswer,
    answer,
  } = useChallengeManager();
  const { setNodes, setEdges } = useSystemDesigner();
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);

  const resetFlow = () => {
    setNodes(defaultStartingNodes);
    setEdges([]);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 1500); // Reset after 1.5 seconds
  };

  return (
    <div
      className={`flex flex-col items-center rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4 shadow-lg ${
        isFeedbackExpanded ? "w-[1000px]" : "w-fit"
      } transition-all duration-300`}
    >
      <SolutionFeedback
        isExpanded={isFeedbackExpanded}
        isLoadingAnswer={isLoadingAnswer}
        answer={answer}
        onToggleExpand={setIsFeedbackExpanded}
      />
      <div className="flex items-center space-x-3">
        <Button
          size="sm"
          onClick={resetFlow}
          variant="outline"
          title="Reset solution to initial state"
          disabled={resetDone}
          className="border-gray-400 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {resetDone ? (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          <span className="ml-2">Reset</span>
        </Button>
        <Button
          size="sm"
          onClick={checkSolution}
          disabled={isLoadingAnswer}
          title="Check solution"
          className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {isLoadingAnswer ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run solution
        </Button>
        {answer && !isFeedbackExpanded && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFeedbackExpanded(true)}
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronUp className="h-4 w-4 mr-2" />
            Show feedback
          </Button>
        )}
      </div>
    </div>
  );
};
