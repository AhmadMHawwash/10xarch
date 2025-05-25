"use client";
import { PanelChat } from "@/components/ai-chat/PanelChat";
import { getSystemComponent } from "@/components/Gallery";
import { ComponentSettings } from "@/components/playground/ComponentSettings";
import { EdgeSettings } from "@/components/playground/EdgeSettings";
import SystemContext from "@/components/playground/SystemContext";
import { type OtherNodeDataProps, type SystemComponentNodeDataProps } from "@/components/ReactflowCustomNodes/SystemComponentNode";
import { FlowManager } from "@/components/SolutionFlowManager";
import SystemBuilder from "@/components/SystemDesigner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useToast } from "@/components/ui/use-toast";
import {
  SystemDesignerProvider,
  useSystemDesigner,
} from "@/lib/hooks/_useSystemDesigner";
import { ChatMessagesProvider } from "@/lib/hooks/useChatMessages_";
import { usePlaygroundManager } from "@/lib/hooks/usePlaygroundManager";
import { type SystemComponentType } from "@/lib/levels/type";
import { Bot, Info, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage, usePrevious } from "react-use";
import { type Edge, type Node, ReactFlowProvider } from "reactflow";

const AUTO_SAVE_INTERVAL = 5000; // 20 seconds

// Helper function to extract relevant details for comparison
const getImportantDetails = (
  nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[],
  edges: Edge[],
) => {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        name: node.data.name,
        title: node.data.title,
        subtitle: node.data.subtitle,
        // Add other relevant data properties here for comparison
      },
      // Include other node properties if they are critical for divergence detection
      width: node.width,
      height: node.height,
      selected: false, // Always false to ignore selection state for divergence
      dragging: false, // Always false to ignore dragging state for divergence
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      // Add other relevant edge properties here for comparison
    })),
  };
};

// Deep compare objects - handles nested objects and arrays
const deepCompare = (obj1: unknown, obj2: unknown): boolean => {
  if (obj1 === obj2) return true;
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepCompare(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => {
    const obj1Value = obj1 as Record<string, unknown>;
    const obj2Value = obj2 as Record<string, unknown>;
    return (
      Object.prototype.hasOwnProperty.call(obj2Value, key) &&
      deepCompare(obj1Value[key], obj2Value[key])
    );
  });
};

export default function PlaygroundClient() {
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
  const {
    selectedNode,
    selectedEdge,
    useSystemComponentConfigSlice,
    setNodes,
    setEdges,
    nodes,
    edges,
  } = useSystemDesigner();

  const {
    playground,
    playgroundId,
    updatePlayground,
    refetchPlayground,
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
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [showDivergenceDialog, setShowDivergenceDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [localPlaygroundTitle, setLocalPlaygroundTitle] = useLocalStorage(
    `${playgroundId}-localPlaygroundTitle`,
    "",
  );
  const [localPlaygroundDescription, setLocalPlaygroundDescription] =
    useLocalStorage(`${playgroundId}-localPlaygroundDescription`, "");
  const { toast } = useToast();

  const isInitialized = useRef(false);
  const prevFeedback = usePrevious(feedback);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show/hide welcome guide
  useEffect(() => {
    if (isClient && !hideWelcomeGuide) {
      setShowWelcomeGuide(true);
    }
  }, [isClient, hideWelcomeGuide]);

  // Expand feedback panel when new feedback arrives
  useEffect(() => {
    if (prevFeedback !== feedback && prevFeedback) {
      setIsFeedbackExpanded(true);
    }
  }, [feedback, prevFeedback]);

  const loadPlaygroundData = useCallback(() => {
    if (!playground?.nodes || !playground?.edges) return;

    setNodes(
      playground.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          icon: getSystemComponent(node.data.name as SystemComponentType)?.icon,
        },
      })),
    );
    setEdges(playground.edges);
    if (playground.title) {
      setLocalPlaygroundTitle(playground.title);
    }
    if (playground.description) {
      setLocalPlaygroundDescription(playground.description);
    }
  }, [playground, setNodes, setEdges]);

  // Initial load and divergence check
  useEffect(() => {
    if (!playground?.nodes || !playground?.edges || isSaving) return;

    if (!isInitialized.current) {
      const localNodesExist = nodes && nodes.length > 0;
      if (localNodesExist) {
        const remoteDetails = getImportantDetails(
          playground.nodes,
          playground.edges,
        );
        const localDetails = getImportantDetails(nodes, edges);
        const isDivergent =
          playground.title !== localPlaygroundTitle ||
          playground.description !== localPlaygroundDescription ||
          !deepCompare(remoteDetails, localDetails);
          
        if (isDivergent) {
          setShowDivergenceDialog(true);
          return; // Wait for user decision before initializing
        }
      }
      // No divergence or no local nodes, initialize with remote data
      loadPlaygroundData();
      isInitialized.current = true;
    }
  }, [playground, nodes, edges, isSaving, loadPlaygroundData]);

  // Auto-save functionality
  useEffect(() => {
    if (
      !isInitialized.current ||
      isSaving ||
      showDivergenceDialog ||
      !isDirty
    ) {
      if (!playground?.nodes || !playground?.edges) return;

      const localDetails = getImportantDetails(nodes, edges);
      const remoteDetails = getImportantDetails(
        playground.nodes,
        playground.edges,
      );
      const isDirty =
        playground.title !== localPlaygroundTitle ||
        playground.description !== localPlaygroundDescription ||
        !deepCompare(remoteDetails, localDetails);

      setIsDirty(isDirty);

      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      updatePlayground({
        id: playgroundId,
        title: localPlaygroundTitle,
        description: localPlaygroundDescription,
        jsonBlob: { nodes, edges },
      })
        .catch((error) => {
          console.error("Auto-save failed:", error);
        })
        .finally(() => {
          setIsSaving(false);
        });
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [
    nodes,
    edges,
    playgroundId,
    updatePlayground,
    isSaving,
    showDivergenceDialog,
    localPlaygroundTitle,
    localPlaygroundDescription,
  ]);

  const handleKeepDbVersion = useCallback(() => {
    loadPlaygroundData();
    setShowDivergenceDialog(false);
    isInitialized.current = true; // Mark as initialized with DB data
  }, [loadPlaygroundData]);

  const handleKeepLocalVersion = useCallback(async () => {
    setShowDivergenceDialog(false);
    setIsSaving(true);
    try {
      await updatePlayground({
        id: playgroundId,
        title: localPlaygroundTitle,
        description: localPlaygroundDescription,
        jsonBlob: { nodes, edges },
      });
      await refetchPlayground(); // Ensure local state matches the newly saved state
      isInitialized.current = true; // Mark as initialized with local data now saved
    } catch (error) {
      console.error("Failed to save local playground version:", error);
      // Optionally, re-open dialog or notify user of save failure
    } finally {
      setIsSaving(false);
    }
  }, [playgroundId, nodes, edges, updatePlayground, refetchPlayground]);

  const handleManualSave = useCallback(async () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current); // Prevent auto-save race condition
    }
    setIsSaving(true);
    try {
      await updatePlayground({
        id: playgroundId,
        title: localPlaygroundTitle,
        description: localPlaygroundDescription,
        jsonBlob: { nodes, edges },
      });
      toast({
        title: "Saved",
        description: "Your changes have been saved",
      });
    } catch (error) {
      console.error("Manual save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [playgroundId, nodes, edges, updatePlayground]);

  const handleCloseWelcomeGuide = (dontShowAgain: boolean) => {
    setShowWelcomeGuide(false);
    if (dontShowAgain) {
      setHideWelcomeGuide(true);
    }
  };

  const selectedNodeName: SystemComponentType | undefined = selectedNode?.data
    ?.name as SystemComponentType | undefined;
  const comp = selectedNodeName
    ? getSystemComponent(selectedNodeName)
    : undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const Icon = comp?.icon ?? (() => null);
  const isSystemNodeSelected =
    !selectedNode?.data?.id || selectedNode?.type === "Whiteboard";
  const showEdgeSettings = selectedEdge !== null;
  const showNodeSettings = selectedNode !== null && !isSystemNodeSelected;

  return (
    <>
      {isClient && showWelcomeGuide && (
        <WelcomeGuide onClose={handleCloseWelcomeGuide} />
      )}

      <AlertDialog
        open={showDivergenceDialog && !isSaving}
        onOpenChange={(open: boolean) => {
          if (!isSaving) {
            setShowDivergenceDialog(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Divergence Detected</AlertDialogTitle>
            <AlertDialogDescription>
              There is a difference between your current design and the saved
              version. Which version would you like to use?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleKeepDbVersion}>
              Use Remote Changes
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleKeepLocalVersion();
              }}
            >
              {isSaving ? "Saving..." : "Keep Local Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                        {isSystemNodeSelected
                          ? "System"
                          : selectedNodeName ?? "Component"}
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
                    <div className="h-[calc(100vh-280px)]">
                      {showNodeSettings ? (
                        <>
                          <Label className="text-sm font-medium">
                            Configuration
                          </Label>
                          <ComponentSettings node={selectedNode} />
                        </>
                      ) : (
                        <SystemContext
                          title={localPlaygroundTitle}
                          onTitleChange={(e) =>
                            setLocalPlaygroundTitle(e.target.value)
                          }
                          description={localPlaygroundDescription}
                          onDescriptionChange={(e) =>
                            setLocalPlaygroundDescription(e.target.value)
                          }
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
                isSaving={isSaving}
                onSave={handleManualSave}
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
                    isPlayground={true}
                    playgroundId="default"
                    playgroundTitle="10×arch"
                    inSidePanel={true}
                  />
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {!isChatPanelOpen && (
        <div className="ai-chat-container fixed -right-2 bottom-4 z-50">
          <PanelChat
            isPlayground={true}
            playgroundId="default"
            playgroundTitle="10×arch"
            onOpenSidePanel={() => setIsChatPanelOpen(true)}
          />
        </div>
      )}
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
