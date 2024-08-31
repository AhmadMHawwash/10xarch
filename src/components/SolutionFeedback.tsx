import { Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

interface SolutionFeedbackProps {
  isLoadingAnswer: boolean;
  answer?: { score: number; fixes: string[] };
}

export const SolutionFeedback: React.FC<SolutionFeedbackProps> = ({
  isLoadingAnswer,
  answer,
}) => {
  if (!answer && !isLoadingAnswer) return null;

  return (
    <div className={`mb-4 w-full ${answer ? "block" : "hidden"}`}>
      {isLoadingAnswer ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : answer ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Score:</span>
            <Badge
              variant={answer.score >= 7 ? "outline" : "secondary"}
              className="px-2 py-1 text-lg"
            >
              {answer.score}/10
            </Badge>
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
      ) : null}
    </div>
  );
};