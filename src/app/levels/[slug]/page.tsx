"use client";
import { WithMarkdownDetails } from "@/components/SystemComponents/Wrappers/WithMarkdownDetails";
import SystemBuilder from "@/components/SystemDesigner";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { H5, List, Muted, P } from "@/components/ui/typography";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { ArrowLeft, ArrowRight, InfoIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { type ReactNode } from 'react';

export default function Level() {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={25} minSize={20}>
        <LevelContent />
      </ResizablePanel>
      <ResizableHandle className="w-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors" />
      <ResizablePanel defaultSize={75} minSize={60}>
        <SystemBuilder />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

const LevelContent = () => {
  const { stage, toNextStage, toPreviousStage, challenge, currentStageIndex } =
    useChallengeManager();

  const oldAssumptions = challenge.stages
    .slice(0, currentStageIndex)
    .reduce<string[]>((acc, stage) => acc.concat(stage.assumptions), []);

  return (
    <div className="flex h-full max-h-[100vh] flex-col justify-between bg-white dark:bg-gray-900 p-4 text-gray-800 dark:text-gray-200">
      <div className="overflow-y-auto pb-8">
        <div className="min-w-[17vw]">
          <div className="sticky top-0 w-full bg-white dark:bg-gray-900 z-10">
            <H5 className="text-gray-900 dark:text-gray-100 flex items-center justify-between">
              <span>{challenge.title}</span>
              <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400">
                Stage {currentStageIndex + 1} of {challenge.stages.length}
              </Badge>
            </H5>
            <Separator className="mb-5 mt-1 bg-gray-300 dark:bg-gray-700" />
          </div>
          <div className="flex flex-col gap-4">
            <Section title="Emerging Complexity" content={stage?.problem} />
            <Section title="Assumptions" content={
              <List className="!ml-2">
                {oldAssumptions.map((assumption, index) => (
                  <P key={index} className="!mt-0 ml-4 list-item list-decimal line-through opacity-50 text-gray-600 dark:text-gray-400">
                    {assumption}
                  </P>
                ))}
                {stage?.assumptions.map((assumption, index) => (
                  <P key={index} className="!mt-0 ml-4 list-item list-decimal text-gray-700 dark:text-gray-300">
                    {assumption}
                  </P>
                ))}
              </List>
            } />
            <WithMarkdownDetails
              Icon={InfoIcon}
              trigger={
                <Muted className="flex items-center gap-1 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-300 transition-colors">
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
  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-md">
    <Muted className="text-gray-600 dark:text-gray-400 mb-2">{title}</Muted>
    <div className="mt-0 text-gray-700 dark:text-gray-300">
      {typeof content === 'string' ? <P className="!mt-0">{content}</P> : content}
    </div>
  </div>
);

interface StageProgressProps {
  currentStage: number;
  totalStages: number;
  onPrevious: () => void;
  onNext: () => void;
}

const StageProgress: React.FC<StageProgressProps> = ({ currentStage, totalStages, onPrevious, onNext }) => (
  <div className="flex items-center justify-between">
    <Button size="sm" variant="outline" onClick={onPrevious} className="border-gray-400 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
      <ArrowLeft className="mr-1" /> Previous
    </Button>
    <div className="flex-grow mx-4 relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="w-full">
            <Progress 
              value={(currentStage + 1) / totalStages * 100} 
              className="w-full h-2"
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <p>Stage {currentStage + 1} of {totalStages}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <Button size="sm" variant="outline" onClick={onNext} className="border-gray-400 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
      Next <ArrowRight className="ml-1" />
    </Button>
  </div>
);

type DesignElement = {
  title: string;
  elements?: DesignElement[];
};
const designElements: DesignElement[] = [
  {
    title: "Requirements",
    elements: [
      { title: "Functional requirements" },
      { title: "Non-functional requirements" },
    ],
  },
  {
    title: "System API",
    elements: [{ title: "API definitions" }, { title: "API flows" }],
  },
  {
    title: "Capacity Estimations",
    elements: [
      { title: "Traffic estimations" },
      { title: "Storage estimations" },
      { title: "Bandwidth estimations" },
      { title: "Memory estimations" },
    ],
  },
  {
    title: "High level design",
    elements: [{ title: "System components" }, { title: "System connections" }],
  },
  {
    title: "Server",
    elements: [{ title: "Purpose" }],
  },
  {
    title: "Database",
    elements: [{ title: "Models" }, { title: "Purpose" }],
  },
  {
    title: "Cache",
    elements: [{ title: "Purpose" }],
  },
];

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
