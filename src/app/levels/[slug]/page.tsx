"use client";
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
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Level() {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={25} minSize={20}>
        <LevelContent />
      </ResizablePanel>
      <ResizableHandle className="w-1" />
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
    <div className="flex h-full max-h-[100vh] flex-col justify-between bg-slate-50 p-4">
      <div className="overflow-x-scroll pb-8">
        <div className="min-w-[17vw]">
          <div className="sticky top-0 w-full bg-slate-50">
            <H5>
              {challenge.title} &nbsp;&nbsp;
              <Muted>
                Part {currentStageIndex + 1}/{challenge.stages.length}
              </Muted>
            </H5>

            <Separator className="mb-5 mt-1" />
          </div>
          <div className="flex flex-col gap-3 overflow-scroll">
            <div>
              <Muted>Emerging complexity</Muted>
              <div className="mt-0 rounded-md border p-2">
                <P className="!mt-0">{stage?.problem}</P>
              </div>
            </div>
            <div>
              <Muted>Assumptions</Muted>
              <div className="mt-0 rounded-md border">
                <List className="!ml-2">
                  {oldAssumptions.map((assumption, index) => (
                    <P key={index} className="!mt-0 line-through opacity-50">
                      {index + 1}. {assumption}
                    </P>
                  ))}
                  {stage?.assumptions.map((assumption, index) => (
                    <P key={index} className="!mt-0">
                      {oldAssumptions.length + index + 1}. {assumption}
                    </P>
                  ))}
                </List>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-2 flex flex-wrap justify-between">
        <Button size="sm" variant="outline" onClick={toPreviousStage}>
          <ArrowLeft className="mr-1" />
        </Button>
        <span className="min-w-32 pt-1">
          {challenge.stages.map((_, index) => (
            <span
              key={index}
              className={`mx-1 inline-block h-2 w-2 rounded-full ${
                index === currentStageIndex ? "bg-slate-900" : "bg-slate-300"
              }`}
            />
          ))}
        </span>
        <Button size="sm" variant="outline" onClick={toNextStage}>
          <ArrowRight className="ml-1" />
        </Button>
      </div>
    </div>
  );
};
