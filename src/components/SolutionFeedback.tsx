import { useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";

interface SolutionFeedbackProps {
  isLoadingAnswer: boolean;
  answer?: { score: number; fixes: string[] };
}

export const SolutionFeedback: React.FC<SolutionFeedbackProps> = ({
  isLoadingAnswer,
  answer = {
    score: 1,
    fixes: [
      "Add at least 1 client component.",
      "Add at least 1 server component.",
      "Add at least 1 database component.",
      "Define API endpoints for creating and retrieving URLs.",
      "Include functional and non-functional requirements.",
      "Provide traffic and storage capacity estimations.",
      "Outline a high-level design with components and their connections.",
    ],
  },
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const scorePercentage = (answer.score / 10) * 100;

  const getScoreColor = (score: number) => {
    if (score <= 50) return "text-red-500";
    if (score >= 80) return "text-green-500";
    return "text-yellow-500";
  };

  if (!answer && !isLoadingAnswer) return null;

  return (
    <div className="mb-4 w-full">
      {isLoadingAnswer ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : answer ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            {isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronUp className="mr-1 h-4 w-4" />
              </Button>
            )}
            {!isExpanded && (
              <div className="flex items-center">
                <span className="text-sm font-semibold">
                  Your system design scored
                </span>
                <span
                  className={`text-md px-1 py-1 font-medium ${getScoreColor(scorePercentage)}`}
                >
                  {scorePercentage}%
                </span>
              </div>
            )}
            {!isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
              >
                <ChevronDown className="mr-1 h-4 w-4" />
              </Button>
            )}
          </div>
          {isExpanded && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Your system design scored
                </span>
                <span
                  className={`text-md px-1 py-1 font-medium ${getScoreColor(scorePercentage)}`}
                >
                  {scorePercentage}%
                </span>
              </div>
              {answer.fixes.length > 0 && (
                <div>
                  <span className="text-sm font-semibold">Fixes needed:</span>
                  <ScrollArea className="mt-1 h-32 w-full">
                    <ul className="list-disc space-y-1 pl-5">
                      {answer.fixes.map((fix, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
