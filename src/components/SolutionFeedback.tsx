import {
  type EvaluationResponse,
  type PlaygroundResponse,
} from "@/server/api/routers/checkAnswer";
import {
  Award,
  ChevronDown,
  Lightbulb,
  Loader2,
  TrendingUp,
} from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { components1 } from "./SystemComponents/Wrappers/WithMarkdownDetails";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

interface SolutionFeedbackProps {
  isLoadingAnswer: boolean;
  answer: EvaluationResponse | PlaygroundResponse | undefined;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const FeedbackList: React.FC<{
  items: string;
  title: string;
  icon: React.ReactNode;
}> = ({ items, title, icon }) => (
  <AccordionItem value={title}>
    <AccordionTrigger className="text-lg font-semibold">
      <div className="flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      {!items ? (
        <p className="text-gray-600 dark:text-gray-400">
          No feedback available
        </p>
      ) : (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]} // Enable raw HTML parsing
          components={components1}
        >
          {items}
        </ReactMarkdown>
        // <ul className="mt-2 space-y-2">
        //   {items.map((item, index) => (
        //     <li
        //       key={index}
        //       className="rounded-md bg-gray-100 p-3 text-sm text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-200"
        //     >
        //       {item}
        //     </li>
        //   ))}
        // </ul>
      )}
    </AccordionContent>
  </AccordionItem>
);

export const ScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score < 50) return "text-red-500";
    if (score < 80) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="mb-6 text-center">
      <div className="mb-2 text-2xl font-bold">Your Score</div>
      <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
        {score}%
      </div>
      <Progress value={score} className="mt-2" />
    </div>
  );
};

export const SolutionFeedback: React.FC<SolutionFeedbackProps> = ({
  isLoadingAnswer,
  answer,
  isOpen,
  onClose,
  onOpen,
}) => {
  if (!answer && !isLoadingAnswer) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(v) => (v ? onOpen() : onClose())}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <ChevronDown className="mr-2" size="20" />
          Feedback
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="overflow-y-auto bg-white dark:bg-gray-800"
      >
        <SheetHeader>
          <SheetTitle className="text-xl">Solution Feedback</SheetTitle>
          {/* <SheetDescription className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Solution Feedback
          </SheetDescription> */}
        </SheetHeader>
        {isLoadingAnswer ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-500" />
            <p className="text-gray-600 dark:text-gray-300">
              Analyzing your solution...
            </p>
          </div>
        ) : answer ? (
          <div className="mt-6">
            {"score" in answer && <ScoreDisplay score={answer.score} />}
            <Accordion type="single" collapsible className="w-full">
              <FeedbackList
                items={answer.strengths}
                title="Strengths"
                icon={<Award className="text-green-500" size="20" />}
              />
              <FeedbackList
                items={answer.improvementAreas}
                title="Areas for Improvement"
                icon={<TrendingUp className="text-yellow-500" size="20" />}
              />
              <FeedbackList
                items={answer.recommendations}
                title="Recommendations"
                icon={<Lightbulb className="text-blue-500" size="20" />}
              />
            </Accordion>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};
