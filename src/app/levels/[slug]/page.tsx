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

export default function Level() {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={25} minSize={20}>
        <LevelContent />
      </ResizablePanel>
      <ResizableHandle className="w-1 bg-gray-700 hover:bg-gray-600 transition-colors" />
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
    <div className="flex h-full max-h-[100vh] flex-col justify-between bg-gray-900 p-4 text-gray-200">
      <div className="overflow-x-scroll pb-8">
        <div className="min-w-[17vw]">
          <div className="sticky top-0 w-full bg-gray-900">
            <H5 className="text-gray-100">
              {challenge.title} &nbsp;&nbsp;
              <Muted className="text-gray-400">
                Part {currentStageIndex + 1}/{challenge.stages.length}
              </Muted>
            </H5>

            <Separator className="mb-5 mt-1 bg-gray-700" />
          </div>
          <div className="flex flex-col gap-3 overflow-scroll">
            <div>
              <Muted className="text-gray-400">Emerging complexity</Muted>
              <div className="mt-0 rounded-md border border-gray-700 p-2">
                <P className="!mt-0 text-gray-300">{stage?.problem}</P>
              </div>
            </div>
            <div>
              <Muted className="text-gray-400">Assumptions</Muted>
              <div className="mt-0 rounded-md border border-gray-700">
                <List className="!ml-2">
                  {oldAssumptions.map((assumption, index) => (
                    <P
                      key={index}
                      className="!mt-0 ml-4 list-item list-decimal line-through opacity-50 text-gray-400"
                    >
                      {assumption}
                    </P>
                  ))}
                  {stage?.assumptions.map((assumption, index) => (
                    <P
                      key={index}
                      className="!mt-0 ml-4 list-item list-decimal text-gray-300"
                    >
                      {assumption}
                    </P>
                  ))}
                </List>
              </div>
            </div>
            <div>
              <WithMarkdownDetails
                Icon={InfoIcon}
                trigger={
                  <Muted className="flex items-center gap-1 text-gray-400">
                    <InfoIcon size="17" />
                    Elements of a successful system design
                  </Muted>
                }
                content={content}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mb-2 flex flex-wrap justify-between">
        <Button size="sm" variant="outline" onClick={toPreviousStage} className="border-gray-600 text-gray-200 hover:bg-gray-700">
          <ArrowLeft className="mr-1" />
        </Button>
        <span className="min-w-32 pt-1">
          {challenge.stages.map((_, index) => (
            <span
              key={index}
              className={`mx-1 inline-block h-2 w-2 rounded-full ${
                index === currentStageIndex ? "bg-gray-200" : "bg-gray-600"
              }`}
            />
          ))}
        </span>
        <Button size="sm" variant="outline" onClick={toNextStage} className="border-gray-600 text-gray-200 hover:bg-gray-700">
          <ArrowRight className="ml-1" />
        </Button>
      </div>
    </div>
  );
};

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
