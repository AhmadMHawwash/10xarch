import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Loader2,
  XCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { createElement } from "react";

interface SolutionFeedbackProps {
  isLoadingAnswer: boolean;
  answer?: { score: number; fixes: string[] };
  isExpanded: boolean;
  onToggleExpand: (isExpanded: boolean) => void;
}

export const SolutionFeedback: React.FC<SolutionFeedbackProps> = ({
  isLoadingAnswer,
  answer,
  isExpanded,
  onToggleExpand,
}) => {
  const getScoreInfo = (score: number) => {
    if (score <= 50) return { color: "text-red-500" };
    if (score >= 80) return { color: "text-green-500" };
    return { color: "text-yellow-500" };
  };

  if (!answer && !isLoadingAnswer) return null;

  return (
    <div className={cn("w-full", isExpanded ? "mb-4" : "mb-0")}>
      {isLoadingAnswer ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : answer ? (
        <div
          className={cn(
            "transition-all duration-300",
            isExpanded ? "opacity-100" : "h-0 overflow-hidden opacity-0",
          )}
        >
          <div className="rounded-lg bg-gray-200 dark:bg-gray-700 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2 text-sm font-semibold">Score:</span>
                <span
                  className={`text-lg font-bold ${getScoreInfo(answer.score).color}`}
                >
                  {answer.score}%
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpand(false)}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <ChevronDown className="mr-1 h-4 w-4" />
                Hide
              </Button>
            </div>
            {answer.fixes.length > 0 && (
              <div>
                <span className="mb-2 block text-sm font-semibold">
                  Suggested improvements:
                </span>
                <ScrollArea className="h-40 w-full">
                  <ul className="space-y-2">
                    {answer.fixes.map((fix, index) => (
                      <li
                        key={index}
                        className="rounded bg-gray-300 dark:bg-gray-600 p-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {fix}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
