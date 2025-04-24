'use client';

import { PanelChat } from "@/components/ai-chat/PanelChat";
import { LevelContent } from "@/components/playground/LevelContent";
import { FeedbackList, ScoreDisplay } from "@/components/SolutionFeedback";
import { FlowManager } from "@/components/SolutionFlowManager";
import SystemBuilder from "@/components/SystemDesigner";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SystemDesignerProvider } from "@/lib/hooks/_useSystemDesigner";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { ChatMessagesProvider } from "@/lib/hooks/useChatMessages_";
import { Award, Bot, Lightbulb, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useMount, usePrevious } from "react-use";
import { ReactFlowProvider } from "reactflow";
import { type ChallengeData } from "./StaticChallengeData";
import { type Challenge } from "@/content/challenges/types";
import { type EvaluationResponse, type PlaygroundResponse } from "@/server/api/routers/checkAnswer";

// Define props for the client component
interface ChallengeClientProps {
  initialData: ChallengeData;
}

export default function ChallengeClient({ initialData }: ChallengeClientProps) {
  return (
    <ReactFlowProvider>
      <SystemDesignerProvider>
        <ChatMessagesProvider>
          <Level initialData={initialData} />
        </ChatMessagesProvider>
      </SystemDesignerProvider>
    </ReactFlowProvider>
  );
}

function Level({ initialData }: ChallengeClientProps) {
  // Here we're using the preset challenge data from SSG
  const {
    checkSolution,
    feedback,
    isLoadingAnswer,
    challenge,
    currentStageIndex,
    toNextStage,
  } = useChallengeManager();
  
  // After getting the hook, we can set the challenge from initialData if needed

  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const [isOpenClosure, setIsOpenClosure] = useState(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);

  const prevFeedback = usePrevious(feedback);

  useEffect(() => {
    if (prevFeedback !== feedback && feedback) {
      setIsFeedbackExpanded(true);
    }
  }, [feedback, prevFeedback]);

  if (!challenge) return notFound();

  const isLastStage = currentStageIndex + 1 === challenge.stages.length;

  // Function to handle moving to the next stage when score is 80% or higher
  const handleNextStage = () => {
    if (
      feedback &&
      "score" in feedback &&
      feedback.score >= 80 &&
      !isLastStage
    ) {
      toNextStage();
      setIsFeedbackExpanded(false);
    }
  };

  return (
    <>
      <ChallengeOverviewDialog challenge={challenge} />
      <ChallengeClosureDialog
        isOpen={isOpenClosure}
        onClose={() => setIsOpenClosure(false)}
        challenge={challenge}
        feedback={feedback!}
      />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={3}>
          <LevelContent />
        </ResizablePanel>
        <ResizableHandle className="w-1 bg-gray-300 transition-colors hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600" />
        <ResizablePanel defaultSize={75} minSize={40}>
          <SystemBuilder
            PassedFlowManager={() => (
              <FlowManager
                checkSolution={checkSolution}
                feedback={feedback}
                isLoadingAnswer={isLoadingAnswer}
                isFeedbackExpanded={isFeedbackExpanded && !isLastStage}
                onOpen={() =>
                  isLastStage
                    ? setIsOpenClosure(true)
                    : setIsFeedbackExpanded(true)
                }
                onClose={() => {
                  setIsOpenClosure(false);
                  setIsFeedbackExpanded(false);
                }}
                onNextStage={!isLastStage ? handleNextStage : undefined}
              />
            )}
          />
        </ResizablePanel>
        {isChatPanelOpen && (
          <>
            <ResizableHandle className="w-1 bg-gray-300 transition-colors hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600" />
            <ResizablePanel defaultSize={25} minSize={5}>
              <div className="flex h-full flex-col">
                <div className="flex h-12 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <span className="font-medium">AI Assistant</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsChatPanelOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <PanelChat
                    isPlayground={false}
                    playgroundId={challenge.slug}
                    playgroundTitle={challenge.title}
                    inSidePanel={true}
                  />
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      {/* Add the chat button (only when side panel is closed) */}
      {!isChatPanelOpen && (
        <div className="ai-chat-container fixed bottom-4 -right-2 z-50">
          <PanelChat
            isPlayground={false}
            playgroundId={challenge.slug}
            playgroundTitle={challenge.title}
            onOpenSidePanel={() => setIsChatPanelOpen(true)}
          />
        </div>
      )}
    </>
  );
}

interface ChallengeOverviewDialogProps {
  challenge: Challenge;
}

const ChallengeOverviewDialog = ({ challenge }: ChallengeOverviewDialogProps) => {
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
                {challenge.generalLearnings.map((learning: string, index: number) => (
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

interface ChallengeClosureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  feedback: EvaluationResponse | PlaygroundResponse;
}

const ChallengeClosureDialog = ({
  isOpen,
  onClose,
  challenge,
  feedback
}: ChallengeClosureDialogProps) => {
  if (!challenge || !feedback) return null;

  // The feedback items are already strings from the API
  const { strengths, improvementAreas, recommendations } = feedback;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85%] overflow-scroll bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 sm:max-w-[1025px]">
        <DialogHeader>
          <DialogTitle className="mb-4 text-center text-2xl font-bold">
            {challenge.title} Challenge
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-max-[60vh] overflow-scroll pr-4">
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
          <Card className="mb-6 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-semibold">General Learnings</h3>
              <ul className="space-y-3">
                {challenge.generalLearnings.map((learning: string, index: number) => (
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
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-semibold">Feedback</h3>
              <div className="mt-6">
                {'score' in feedback && <ScoreDisplay score={feedback.score} />}
                <Accordion type="single" collapsible className="w-full">
                  <FeedbackList
                    items={strengths}
                    title="Strengths"
                    icon={<Award className="text-green-500" size="20" />}
                  />
                  <FeedbackList
                    items={improvementAreas}
                    title="Areas for Improvement"
                    icon={<TrendingUp className="text-yellow-500" size="20" />}
                  />
                  <FeedbackList
                    items={recommendations}
                    title="Recommendations"
                    icon={<Lightbulb className="text-blue-500" size="20" />}
                  />
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
        <Link
          href="/challenges"
          className="group inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          prefetch={false}
        >
          Go to Challenges list
        </Link>
      </DialogContent>
    </Dialog>
  );
}; 