import {
  type EvaluationResponse,
  type PlaygroundResponse,
} from "@/server/api/routers/checkAnswer";
import {
  Award,
  Bot,
  ChevronRight,
  Lightbulb,
  Loader2,
  Sparkles,
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
  onNextStage?: () => void;
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

export const ScoreDisplay: React.FC<{
  score: number;
  onNextStage?: () => void;
}> = ({ score, onNextStage }) => {
  const getScoreColor = (score: number) => {
    if (score < 50) return "text-red-500";
    if (score < 80) return "text-yellow-500";
    return "text-green-500";
  };

  // Get a message based on the score
  const getScoreMessage = (score: number) => {
    if (score >= 95) return "Outstanding!";
    if (score >= 90) return "Excellent!";
    if (score >= 85) return "Great job!";
    if (score >= 80) return "Well done!";
    return "";
  };

  const scoreMessage = getScoreMessage(score);

  return (
    <div className="score-display mb-6 text-center">
      <div className="mb-2 text-2xl font-bold">Your Score</div>
      <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
        {score}%
      </div>
      {score >= 80 && (
        <div className="mt-1 text-lg font-medium text-green-600 dark:text-green-400">
          {scoreMessage}
        </div>
      )}
      <Progress value={score} className="mt-2" />

      {score >= 80 && onNextStage && (
        <div className="relative mt-6 flex justify-center">
          {/* Celebration sparkles for high scores */}
          {score >= 90 && (
            <>
              <Sparkles className="absolute -left-2 -top-6 h-5 w-5 animate-pulse text-yellow-400" />
              <Sparkles className="absolute -right-4 -top-4 h-6 w-6 animate-pulse text-yellow-400" />
            </>
          )}
          <Button
            onClick={onNextStage}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl"
          >
            <span className="relative z-10 flex items-center">
              <Sparkles className="mr-2 h-4 w-4" />
              Continue to Next Challenge
              <ChevronRight
                className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                size={18}
              />
            </span>
            <span className="absolute inset-0 z-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
          </Button>
        </div>
      )}
    </div>
  );
};

export const SolutionFeedback: React.FC<SolutionFeedbackProps> = ({
  isLoadingAnswer,
  answer,
  isOpen,
  onClose,
  onOpen,
  onNextStage,
}) => {
  if (!answer && !isLoadingAnswer) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(v) => (v ? onOpen() : onClose())}>
      <SheetTrigger asChild>
        <Button className="feedback-section" variant="outline">
          <Bot className="mr-2 text-amber-500" size="20" />
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
          <>
            {"score" in answer && (
              <ScoreDisplay score={answer.score} onNextStage={onNextStage} />
            )}
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
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};
