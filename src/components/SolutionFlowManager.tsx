import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import {
  defaultStartingNodes,
  useSystemDesigner,
} from "@/lib/hooks/useSystemDesigner";
import { Check, ChevronUp, Loader2, RotateCcw, Play } from "lucide-react";
import { useState } from "react";
import { SolutionFeedback } from "./SolutionFeedback";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export const FlowManager: React.FC = () => {
  const [resetDone, setResetDone] = useState(false);
  const { checkSolution, isLoadingAnswer, answer } = useChallengeManager();
  const { setNodes, setEdges } = useSystemDesigner();
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);

  const resetFlow = () => {
    setNodes(defaultStartingNodes);
    setEdges([]);
  };

  return (
    <div
      className={`flex flex-col items-center rounded-lg border border-gray-300 bg-gray-100 p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
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
        {/* <Button
          size="sm"
          onClick={resetFlow}
          variant="outline"
          title="Reset solution to initial state"
          disabled={resetDone}
        >
          {resetDone ? (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          <span className="ml-2">Reset</span>
        </Button> */}
        <ShouldResetFlowModal
          trigger={
            <span className="flex items-center gap-2">
              {resetDone ? (
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Reset
            </span>
          }
          className="rounded-md border-gray-300 bg-gray-200 p-2 text-gray-800 transition-all hover:bg-gray-300 dark:border-gray-700 border dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
          onReset={() => {
            setResetDone(true);
            resetFlow();
            setTimeout(() => setResetDone(false), 1500); // Reset after 1.5 seconds
          }}
        />
        <Button
          size="sm"
          onClick={checkSolution}
          disabled={isLoadingAnswer}
          title="Check solution"
          className="bg-blue-600 text-white transition-colors hover:bg-blue-700"
        >
          {isLoadingAnswer ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Run solution
        </Button>
        {answer && !isFeedbackExpanded && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFeedbackExpanded(true)}
            className="text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronUp className="mr-2 h-4 w-4" />
            Show feedback
          </Button>
        )}
      </div>
    </div>
  );
};

export const ShouldResetFlowModal = ({
  trigger,
  onReset,
  onCancel,
  className,
}: {
  trigger: React.ReactNode;
  onReset: () => void;
  onCancel?: () => void;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={className}>{trigger}</DialogTrigger>
      <DialogContent className="border-gray-300 bg-gray-200 dark:border-gray-700 dark:bg-gray-900">
        <DialogHeader className="relative">
          <DialogTitle>Are you sure you want to reset the flow?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This will reset the flow to the initial state.
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false);
                onCancel?.();
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              variant="destructive"
            >
              Reset
            </Button>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
