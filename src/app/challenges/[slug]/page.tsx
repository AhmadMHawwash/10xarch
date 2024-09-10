"use client";
import { LevelContent } from "@/components/playground/LevelContent";
import { FlowManager } from "@/components/SolutionFlowManager";
import SystemBuilder from "@/components/SystemDesigner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { SystemDesignerProvider } from "@/lib/hooks/useSystemDesigner";
import { notFound } from "next/navigation";
import { ReactFlowProvider } from "reactflow";

export default function LevelPage() {
  return (
    <ReactFlowProvider>
      <SystemDesignerProvider>
        <Level />
      </SystemDesignerProvider>
    </ReactFlowProvider>
  );
}

function Level() {
  const { checkSolution, feedback, isLoadingAnswer, challenge } =
    useChallengeManager();

  if (!challenge) return notFound()

  return (
    <>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={3}>
          <LevelContent />
        </ResizablePanel>
        <ResizableHandle className="w-1 bg-gray-300 transition-colors hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600" />
        <ResizablePanel defaultSize={75} minSize={60}>
          <SystemBuilder
            PassedFlowManager={() => (
              <FlowManager
                checkSolution={checkSolution}
                feedback={feedback}
                isLoadingAnswer={isLoadingAnswer}
              />
            )}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* <AIChatWidget /> */}
    </>
  );
}
