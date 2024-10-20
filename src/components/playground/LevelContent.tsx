"use client";

import { WithMarkdownDetails } from "@/components/SystemComponents/Wrappers/WithMarkdownDetails";
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
import { ArrowLeft, ArrowRight, InfoIcon } from "lucide-react";
import { type ReactNode } from "react";

export const LevelContent = () => {
  const { stage, toNextStage, toPreviousStage, challenge, currentStageIndex } =
    useChallengeManager();

  const oldRequirements = challenge.stages
    .slice(0, currentStageIndex)
    .reduce<string[]>((acc, stage) => acc.concat(stage.requirements), []);

  return (
    <div className="flex h-full max-h-[100vh] flex-col justify-between bg-white p-4 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <div className="overflow-y-auto pb-8">
        <div className="min-w-[17vw]">
          <div className="sticky top-0 z-10 w-full bg-white dark:bg-gray-900">
            <H5 className="flex items-center justify-between text-gray-900 dark:text-gray-100">
              <span>{challenge.title}</span>
              <Badge
                variant="outline"
                className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              >
                Stage {currentStageIndex + 1} of {challenge.stages.length}
              </Badge>
            </H5>
            <Separator className="mb-5 mt-1 bg-gray-300 dark:bg-gray-700" />
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
            <WithMarkdownDetails
              Icon={InfoIcon}
              trigger={
                <Muted className="flex cursor-pointer items-center gap-1 text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                  <InfoIcon size="17" />
                  Elements of a successful system design
                </Muted>
              }
              content={content}
            />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <StageProgress
          currentStage={currentStageIndex}
          totalStages={challenge.stages.length}
          onPrevious={toPreviousStage}
          onNext={toNextStage}
        />
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
  <div className="flex flex-col justify-center">
    <div className="flex items-center justify-between">
      <Button
        disabled={currentStage === 0}
        size="sm"
        variant="outline"
        onClick={onPrevious}
        className="border-gray-400 text-gray-800 hover:bg-gray-200 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <ArrowLeft className="mr-1" /> Previous
      </Button>
      <div className="relative mx-4 flex-grow">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-full">
              <Progress
                value={((currentStage + 1) / totalStages) * 100}
                className="h-2 w-full"
              />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
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
        variant="outline"
        onClick={onNext}
        className="border-gray-400 text-gray-800 hover:bg-gray-200 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Next <ArrowRight className="ml-1" />
      </Button>
    </div>
    {currentStage === totalStages - 1 ? (
      <Button
        size="sm"
        variant="default"
        onClick={onNext}
        className="border-gray-400 bg-yellow-500 text-gray-800 hover:bg-gray-200 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 mt-2"
      >
        Finish
      </Button>
    ) : null}
  </div>
);

const content = `
### Elements of a successful system design
&nbsp;
#### A successful system design should include the following elements:
- **Requirements**: 
  - Functional 
  - Non-functional requirements
- **System API**: 
  - API definitions
  - API flows
- **Capacity Estimations**: 
  - Traffic estimates
  - Storage estimates
  - Bandwidth estimates
  - Memory estimates
- **High level design**: System components and their connections
- **Database**: Models and purpose
- And other system components purposes
`;
