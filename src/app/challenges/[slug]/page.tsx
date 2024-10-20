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
import { useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import { useMount, usePrevious } from "react-use";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

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

  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const prevFeedback = usePrevious(feedback);

  useEffect(() => {
    if (prevFeedback !== feedback && prevFeedback) {
      setIsFeedbackExpanded(true);
    }
  }, [feedback, prevFeedback]);

  if (!challenge) return notFound();

  return (
    <>
      <ChallengeOverviewDialog />
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
                isFeedbackExpanded={isFeedbackExpanded}
                onOpen={() => setIsFeedbackExpanded(true)}
                onClose={() => setIsFeedbackExpanded(false)}
              />
            )}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* <AIChatWidget /> */}
    </>
  );
}

const ChallengeOverviewDialog = () => {
  const { challenge } = useChallengeManager();
  const [isOpen, setIsOpen] = useState(false);

  useMount(() => {
    setIsOpen(true);
  });

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="mb-4 text-center text-2xl font-bold">
            {challenge.title} Challenge
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-max-[60vh] pr-4">
          <Card className="mb-6 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <CardContent className="pt-6">
              <h3 className="mb-2 text-lg font-semibold">
                Challenge Description
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {challenge.description}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-semibold">General Learnings</h3>
              <ul className="space-y-3">
                {challenge.generalLearnings.map((learning, index) => (
                  <li key={index} className="flex items-start">
                    <Badge variant="secondary" className="mr-2 mt-1">
                      {index + 1}
                    </Badge>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {learning}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </ScrollArea>
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleClose}
            className="transform rounded-full bg-blue-600 px-4 py-2 font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-blue-700"
          >
            Lets Go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
