"use client";

import { WithMarkdownDetails } from "@/components/SystemComponents/Wrappers/WithMarkdownDetails";
import { Resources } from "@/components/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { H5, List, Muted, P } from "@/components/ui/typography";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { ArrowLeft, ArrowRight, InfoIcon, MessageSquareHeart } from "lucide-react";
import { type ReactNode } from "react";
import { PanelChat } from "@/components/ai-chat/PanelChat";
import { buttonVariants } from "@/components/ui/button";

export const LevelContent = () => {
  const {
    stage,
    toNextStage,
    toPreviousStage,
    challenge,
    currentStageIndex,
  } = useChallengeManager();

  const oldRequirements = challenge.stages
    .slice(0, currentStageIndex)
    .reduce<string[]>((acc, stage) => acc.concat(stage.requirements), []);

  return (
    <div className="flex h-full max-h-[100vh] flex-col justify-between bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <div className="overflow-y-auto p-4 pb-8 pt-0">
        <div className="min-w-[17vw]">
          <div className="sticky pt-[17px] z-10 w-full bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <H5 className="text-gray-900 dark:text-gray-100">
                {challenge.title}
              </H5>
              <Badge
                variant="outline"
                className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              >
                Stage {currentStageIndex + 1} of {challenge.stages.length}
              </Badge>
            </div>
            <Separator className="mb-5 mt-4 bg-gray-300 dark:bg-gray-700" />
          </div>
          <div className="flex flex-col gap-4">
            <Section title="Emerging Complexity" content={stage?.problem} />
            <Section
              title="CTO/CPO Requirements"
              content={
                <List className="!ml-2">
                  {oldRequirements.map((requirement, index) => (
                    <P
                      key={index}
                      className="!mt-0 ml-4 list-item list-decimal text-gray-600 line-through opacity-50 dark:text-gray-400"
                    >
                      {requirement}
                    </P>
                  ))}
                  {stage?.requirements.map((requirement, index) => (
                    <P
                      key={index}
                      className="!mt-0 ml-4 list-item list-decimal text-gray-700 dark:text-gray-300"
                    >
                      {requirement}
                    </P>
                  ))}
                </List>
              }
            />
            {stage?.resources && (
              <Resources
                documentation={stage.resources.documentation}
                realWorldCases={stage.resources.realWorldCases}
                bestPractices={stage.resources.bestPractices}
              />
            )}
            <WithMarkdownDetails
              Icon={InfoIcon}
              trigger={
                <Muted className="flex cursor-pointer items-center gap-1 text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                  <InfoIcon size="17" />
                  Key System Design Components
                </Muted>
              }
              content={content}
            />
          </div>
        </div>
      </div>
      <div>
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-800/50">
          <StageProgress
            currentStage={currentStageIndex}
            totalStages={challenge.stages.length}
            onPrevious={toPreviousStage}
            onNext={toNextStage}
          />
        </div>
        <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <a
              href="https://archround.userjot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md p-0.5 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Give Feedback"
            >
              <MessageSquareHeart className="h-6 w-6" />
              <span className="sr-only">Give Feedback</span>
            </a>
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        <PanelChat />
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  content: ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, content }) => (
  <div className="rounded-lg bg-gray-100 p-4 shadow-md dark:bg-gray-800">
    <Muted className="mb-2 text-gray-600 dark:text-gray-400">{title}</Muted>
    <div className="mt-0 text-gray-700 dark:text-gray-300">
      {typeof content === "string" ? (
        <P className="!mt-0">{content}</P>
      ) : (
        content
      )}
    </div>
  </div>
);

interface StageProgressProps {
  currentStage: number;
  totalStages: number;
  onPrevious: () => void;
  onNext: () => void;
}

const StageProgress: React.FC<StageProgressProps> = ({
  currentStage,
  totalStages,
  onPrevious,
  onNext,
}) => (
  <div>
    <div className="flex items-center justify-between gap-4">
      <Button
        disabled={currentStage === 0}
        size="sm"
        variant="ghost"
        onClick={onPrevious}
        className="h-9 px-4 text-gray-600 hover:bg-gray-200/70 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
      <div className="relative flex-grow">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-full">
              <Progress
                value={((currentStage + 1) / totalStages) * 100}
                className="h-2.5 w-full bg-gray-200 dark:bg-gray-700"
              />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-white text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            >
              <p>
                Stage {currentStage + 1} of {totalStages}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Button
        disabled={currentStage === totalStages - 1}
        size="sm"
        variant="ghost"
        onClick={onNext}
        className="h-9 px-4 text-gray-600 hover:bg-gray-200/70 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
      >
        Next <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);

const content = `
### Key System Design Components
&nbsp;
#### A well-structured system design should address:
- **Requirements Analysis**:
  - Core functionality
  - System constraints & scalability
- **API Design**:
  - Endpoints & interfaces
  - Data flow patterns
- **System Calculations**:
  - Load & traffic patterns
  - Resource requirements
  - Performance metrics
- **Architecture Overview**:
  - Component interactions
  - System boundaries
- **Data Layer**:
  - Schema design
  - Storage solutions
`;
