"use client";
import { PanelChat } from "@/components/ai-chat/PanelChat";
import { getSystemComponent } from "@/components/Gallery";
import { ComponentSettings } from "@/components/playground/ComponentSettings";
import { EdgeSettings } from "@/components/playground/EdgeSettings";
import Notes, { type Note } from "@/components/playground/Notes";
import SystemContext from "@/components/playground/SystemContext";
import TodoList, { type TodoItem } from "@/components/playground/TodoList";
import { FlowManager } from "@/components/SolutionFlowManager";
import SystemBuilder from "@/components/SystemDesigner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SystemDesignerProvider,
  useSystemDesigner,
} from "@/lib/hooks/_useSystemDesigner";
import { ChatMessagesProvider } from "@/lib/hooks/useChatMessages_";
import { usePlaygroundManager } from "@/lib/hooks/usePlaygroundManager";
import { type SystemComponentType } from "@/lib/levels/type";
import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocalStorage, usePrevious } from "react-use";
import { ReactFlowProvider } from "reactflow";

export default function Page() {
  return (
    <ReactFlowProvider>
      <SystemDesignerProvider>
        <ChatMessagesProvider>
          <PageContent />
        </ChatMessagesProvider>
      </SystemDesignerProvider>
    </ReactFlowProvider>
  );
}

function PageContent() {
  const { selectedNode, selectedEdge, useSystemComponentConfigSlice } =
    useSystemDesigner();
  const {
    checkSolution,
    answer: feedback,
    isLoadingAnswer,
  } = usePlaygroundManager();
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const [hideWelcomeGuide, setHideWelcomeGuide] = useLocalStorage(
    "hideWelcomeGuide",
    false,
  );
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const prevFeedback = usePrevious(feedback);

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show/hide welcome guide based on localStorage preference
  useEffect(() => {
    if (isClient && !hideWelcomeGuide) {
      setShowWelcomeGuide(true);
    }
  }, [hideWelcomeGuide, isClient]);

  useEffect(() => {
    if (prevFeedback !== feedback && prevFeedback) {
      setIsFeedbackExpanded(true);
    }
  }, [feedback, prevFeedback]);

  const handleCloseWelcomeGuide = (dontShowAgain: boolean) => {
    // Always hide the dialog immediately
    setShowWelcomeGuide(false);

    // Only persist the "don't show again" preference if checked
    if (dontShowAgain) {
      setHideWelcomeGuide(true);
    }
  };

  const [context, setContext] = useSystemComponentConfigSlice<string>(
    selectedNode?.id ?? "",
    "context",
    "",
  );
  const [title, setTitle] = useSystemComponentConfigSlice<string>(
    selectedNode?.id ?? "",
    "title",
    "",
  );
  const [subtitle, setSubtitle] = useSystemComponentConfigSlice<string>(
    selectedNode?.id ?? "",
    "subtitle",
    "",
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const comp = getSystemComponent(
    selectedNode?.data.name as SystemComponentType,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const Icon = comp?.icon ?? (() => null);
  const isSystem = !selectedNode?.data.id || selectedNode.type === "Whiteboard";

  const showEdgeSettings = selectedEdge !== null;
  const showNodeSettings = selectedNode !== null && !isSystem;

  return (
    <>
      {isClient && showWelcomeGuide && (
        <WelcomeGuide onClose={handleCloseWelcomeGuide} />
      )}

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={3}>
          <div className="h-full bg-gray-50/50 p-4 dark:bg-gray-900/50">
            <Card className="h-full border-gray-200 dark:border-gray-800">
              <div className="flex items-center border-b border-gray-200 p-4 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  {showEdgeSettings ? (
                    <span className="text-base font-medium">Connection</span>
                  ) : (
                    <>
                      <Icon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      <span className="text-base font-medium">
                        {isSystem ? "System" : selectedNode?.data.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4 p-4">
                {showNodeSettings && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Title
                      </Label>
                      <Input
                        id="title"
                        className="w-full"
                        placeholder="Component title"
                        value={title}
                        onChange={(e) => {
                          if (!selectedNode?.id) return;
                          setTitle(e.target.value);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitle" className="text-sm font-medium">
                        Subtitle
                      </Label>
                      <Input
                        id="subtitle"
                        className="w-full"
                        placeholder="Component subtitle"
                        value={subtitle}
                        onChange={(e) => {
                          if (!selectedNode?.id) return;
                          setSubtitle(e.target.value);
                        }}
                      />
                    </div>
                  </>
                )}

                {showEdgeSettings ? (
                  <EdgeSettings edge={selectedEdge} />
                ) : (
                  <>
                    <div>
                      {!selectedNode || selectedNode?.data.name === "Whiteboard"
                        ? "Context"
                        : "Configuration"}
                    </div>
                    <div className="mt-4 h-[calc(100vh-280px)]">
                      {showNodeSettings ? (
                        <ComponentSettings node={selectedNode} />
                      ) : (
                        <SystemContext
                          context={context}
                          setContext={setContext}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </ResizablePanel>
        <ResizableHandle className="w-1 bg-gray-300 transition-colors hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600" />
        <ResizablePanel defaultSize={75} minSize={40}>
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

      {/* Add the chat component */}
      <div className="ai-chat-container fixed bottom-4 right-4 z-50">
        <PanelChat
          isPlayground={true}
          playgroundId="default"
          playgroundTitle="10×arch"
        />
      </div>
    </>
  );
}

type WelcomeGuideProps = {
  onClose: (dontShowAgain: boolean) => void;
};

function WelcomeGuide({ onClose }: WelcomeGuideProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <button
          onClick={() => onClose(dontShowAgain)}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center">
          <Info className="mr-2 h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Welcome to 10×arch Playground</h2>
        </div>

        <p className="mb-4 text-gray-600 dark:text-gray-400">
          This is your space to design, visualize, and document system
          architectures. Use our intuitive drag-and-drop interface to create
          beautiful and functional system designs.
        </p>

        <h3 className="mb-2 text-lg font-semibold">How to get started:</h3>
        <ol className="mb-6 list-decimal pl-5 text-gray-600 dark:text-gray-400">
          <li className="mb-2">
            Add components by dragging from the right gallery to the canvas
          </li>
          <li className="mb-2">
            Connect components by dragging from one component&apos;s handles to
            another
          </li>
          <li className="mb-2">
            Add documentation, context notes, and todos for each component using
            the left panel
          </li>
          <li className="mb-2">
            Get AI feedback on your design using the Evaluate Solution button or
            the AI chat assistant in the bottom right (3 prompts/hour for free
            users)
          </li>
        </ol>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          <span className="font-medium text-amber-600 dark:text-amber-400">
            Coming Soon:
          </span>{" "}
          Save your designs, export them in different formats, and share them
          with your team.
        </p>

        <div className="mb-6 flex items-center space-x-2">
          <Checkbox
            id="dontShowAgain"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked === true)}
          />
          <label
            htmlFor="dontShowAgain"
            className="text-sm font-medium leading-none text-gray-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-400"
          >
            Don&apos;t show this again
          </label>
        </div>

        <Button
          onClick={() => onClose(dontShowAgain)}
          variant="default"
          size="lg"
          className="w-full"
        >
          Start Designing
        </Button>
      </div>
    </div>
  );
}
