"use client";
import { PanelChat } from "@/components/ai-chat/PanelChat";
import { getSystemComponent } from "@/components/Gallery";
import { ComponentSettings } from "@/components/playground/ComponentSettings";
import { EdgeSettings } from "@/components/playground/EdgeSettings";
import { PlaygroundToolbar } from "@/components/playground/PlaygroundToolbar";
import SystemContext from "@/components/playground/SystemContext";
import DocsFileSystem, { type DocsFileSystemData } from "@/components/playground/DocsFileSystem";
import { FlowManager } from "@/components/SolutionFlowManager";
import SystemBuilder from "@/components/SystemDesigner";
import { CommitMessageDialog } from "@/components/playground/CommitMessageDialog";
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
import { usePlaygroundPermissions } from "@/lib/hooks/usePlaygroundPermissions";
import { type SystemComponentType } from "@/lib/levels/type";
import {
  hasPlaygroundChanges,
  type PlaygroundState,
} from "@/lib/utils/playground-utils";
import { useUser } from "@clerk/nextjs";
import { BookIcon, Bot, Info, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage, usePrevious } from "react-use";
import { ReactFlowProvider } from "reactflow";

const AUTO_SAVE_INTERVAL = 5000; // 20 seconds

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
  const router = useRouter();
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
    checkSolution,
    answer: feedback,
    isLoadingAnswer,
    isLoadingPlayground,
    refetchPlayground,
  } = usePlaygroundManager();

  // Check permissions
  const { canEdit, canView } = usePlaygroundPermissions(playground);

  // Also get user loading state to prevent premature permission checks
  const { isLoaded: isUserLoaded } = useUser();

  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const [hideWelcomeGuide, setHideWelcomeGuide] = useLocalStorage(
    "hideWelcomeGuide",
    false,
  );
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localTitle, setLocalTitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showDocsFileSystem, setShowDocsFileSystem] = useState(false);
  const [docsData, setDocsData] = useState<DocsFileSystemData>({ items: [], currentPath: [] });
  const { toast } = useToast();

  console.log("docsData", docsData);
  const isInitialized = useRef(false);
  const prevFeedback = usePrevious(feedback);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedStateRef = useRef<{
    title: string;
    description: string;
    nodes: typeof nodes;
    edges: typeof edges;
    docsData: DocsFileSystemData;
  } | null>(null);

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

  // Show access error if user doesn't have view permission
  useEffect(() => {
    // Only check permissions if we have complete playground data AND user auth is loaded
    const hasCompletePlaygroundData =
      playground?.ownerType !== undefined &&
      playground.ownerId !== undefined &&
      playground.editorIds !== undefined &&
      playground.viewerIds !== undefined &&
      playground.isPublic !== undefined;

    if (
      isClient &&
      hasCompletePlaygroundData &&
      isUserLoaded &&
      !canView &&
      !isLoadingPlayground
    ) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this playground.",
        variant: "destructive",
      });
      router.push("/");
    }
  }, [
    isClient,
    playground,
    canView,
    isUserLoaded,
    toast,
    router,
    isLoadingPlayground,
  ]);

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
    if (
      prevFeedback?.improvementAreas !== feedback?.improvementAreas &&
      prevFeedback?.recommendations !== feedback?.recommendations &&
      prevFeedback?.strengths !== feedback?.strengths &&
      feedback
    ) {
      setIsFeedbackExpanded(true);
    }
  }, [feedback, prevFeedback]);

  const loadPlaygroundData = useCallback(() => {
    if (!playground?.nodes || !playground?.edges) return;

    const processedNodes = playground.nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        icon: getSystemComponent(node.data.name as SystemComponentType)?.icon,
      },
    }));

    setNodes(processedNodes);
    setEdges(playground.edges);

    // Initialize local title and description from playground data
    const title = playground.title ?? "";
    const description = playground.description ?? "";
    setLocalTitle(title);
    setLocalDescription(description);

    // Initialize docs data from playground jsonBlob
    const playgroundJsonBlob = playground.jsonBlob as {
      nodes?: typeof nodes;
      edges?: typeof edges;
      docsData?: DocsFileSystemData;
    };
    if (playgroundJsonBlob?.docsData) {
      setDocsData(playgroundJsonBlob.docsData);
    } else {
      setDocsData({ items: [], currentPath: [] });
    }

    // Set initial saved state
    lastSavedStateRef.current = {
      title,
      description,
      nodes: processedNodes,
      edges: playground.edges,
      docsData,
    };
  }, [playground, setNodes, setEdges]);

  // Initial load
  useEffect(() => {
    if (!playground?.nodes || !playground?.edges || isSaving) return;

    loadPlaygroundData();
    if (!isInitialized.current) {
      isInitialized.current = true;
    }
  }, [playground, isSaving, loadPlaygroundData]);

  // Helper function to detect changes
  const hasChanges = useCallback(() => {
    const currentState: PlaygroundState = {
      title: localTitle || "Untitled Playground",
      description: localDescription,
      nodes,
      edges,
      docsData,
    };

    return hasPlaygroundChanges(currentState, lastSavedStateRef.current);
  }, [localTitle, localDescription, nodes, edges, docsData]);

  // Auto-save functionality - only for editors
  useEffect(() => {
    if (!isInitialized.current || isSaving || !canEdit || showCommitDialog) {
      return;
    }

    // Only set up auto-save if there are changes
    if (!hasChanges()) {
      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      // Double-check for changes and commit dialog state before saving
      if (!hasChanges() || showCommitDialog) {
        return;
      }

      setIsSaving(true);
      const currentState = {
        title: localTitle || "Untitled Playground",
        description: localDescription,
        nodes,
        edges,
        docsData,
      };

      updatePlayground({
        id: playgroundId,
        title: currentState.title,
        description: currentState.description,
        jsonBlob: { 
          nodes: currentState.nodes, 
          edges: currentState.edges,
          docsData
        },
      })
        .then(() => {
          // Update last saved state after successful save
          lastSavedStateRef.current = currentState;
        })
        .catch((error) => {
          console.error("Auto-save failed:", error);
          toast({
            title: "Save Failed",
            description: "You don't have permission to edit this playground.",
            variant: "destructive",
          });
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
    localTitle,
    localDescription,
    docsData,
    hasChanges,
    canEdit,
    toast,
    showCommitDialog,
  ]);

  // Warn user before leaving page if there are unsaved changes - only for editors
  useEffect(() => {
    if (!canEdit) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isInitialized.current) return;

      if (hasChanges()) {
        event.preventDefault();
        // Chrome requires returnValue to be set
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges, canEdit]);

  const handleManualSave = useCallback(
    async (commitMessage?: string) => {
      if (!canEdit) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to edit this playground.",
          variant: "destructive",
        });
        return;
      }

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current); // Prevent auto-save race condition
      }
      setIsSaving(true);

      const currentState = {
        title: localTitle || "Untitled Playground",
        description: localDescription,
        nodes,
        edges,
        docsData,
      };

      try {
        await updatePlayground({
          id: playgroundId,
          title: currentState.title,
          description: currentState.description,
          jsonBlob: { 
            nodes: currentState.nodes, 
            edges: currentState.edges,
            docsData 
          },
          triggerBackup: true,
          commitMessage,
        });

        // Update last saved state after successful save
        lastSavedStateRef.current = currentState;

        toast({
          title: "Saved",
          description: commitMessage
            ? "Your changes have been saved with commit message"
            : "Your changes have been saved",
        });
      } catch (error) {
        console.error("Manual save failed:", error);
        toast({
          title: "Save Failed",
          description: "You don't have permission to edit this playground.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [
      playgroundId,
      nodes,
      edges,
      updatePlayground,
      localTitle,
      localDescription,
      docsData,
      toast,
      canEdit,
    ],
  );

  const handleCheckSolution = useCallback(() => {
    if (!canEdit) {
      toast({
        title: "Access Denied",
        description:
          "You don't have permission to run evaluations on this playground.",
        variant: "destructive",
      });
      return;
    }
    void checkSolution(localTitle, localDescription);
  }, [checkSolution, localTitle, localDescription, canEdit, toast]);

  const handleSaveWithCommitDialog = useCallback(() => {
    setShowCommitDialog(true);
  }, []);

  const handleCommit = useCallback(
    (commitMessage: string) => {
      setShowCommitDialog(false);
      void handleManualSave(commitMessage);
    },
    [handleManualSave],
  );

  const handleCloseCommitDialog = useCallback(() => {
    setShowCommitDialog(false);
  }, []);

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

  // Don't render anything if user doesn't have view permission
  if (!canView && isClient) {
    return null;
  }

  return (
    <>
      {isClient && showWelcomeGuide && (
        <WelcomeGuide onClose={handleCloseWelcomeGuide} />
      )}

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={3}>
          <div className="h-full bg-gray-50/50 p-4 dark:bg-gray-900/50">
            {playground && (
              <PlaygroundToolbar
                className="-mt-2 mb-2"
                playground={playground as any}
              />
            )}
            <Card className="h-full border-gray-200 dark:border-gray-800">
              <div className="flex items-center border-b border-gray-200 p-4 dark:border-gray-800">
                <div className="flex flex-1 items-center justify-between gap-2">
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
                  {isSystemNodeSelected ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setShowDocsFileSystem(!showDocsFileSystem)}
                    >
                      Docs <BookIcon className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4 p-4">
                {showNodeSettings && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Title{" "}
                        {!canEdit && (
                          <span className="text-xs text-gray-500">
                            (Read Only)
                          </span>
                        )}
                      </Label>
                      <Input
                        id="title"
                        className="w-full"
                        placeholder="Component title"
                        value={title}
                        onChange={(e) => {
                          if (!selectedNode?.id || !canEdit) return;
                          setTitle(e.target.value);
                        }}
                        readOnly={!canEdit}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitle" className="text-sm font-medium">
                        Subtitle{" "}
                        {!canEdit && (
                          <span className="text-xs text-gray-500">
                            (Read Only)
                          </span>
                        )}
                      </Label>
                      <Input
                        id="subtitle"
                        className="w-full"
                        placeholder="Component subtitle"
                        value={subtitle}
                        onChange={(e) => {
                          if (!selectedNode?.id || !canEdit) return;
                          setSubtitle(e.target.value);
                        }}
                        readOnly={!canEdit}
                      />
                    </div>
                  </>
                )}

                {showEdgeSettings ? (
                  <EdgeSettings edge={selectedEdge} canEdit={canEdit} />
                ) : (
                  <>
                    <div className="h-[calc(100vh-280px)]">
                      {showNodeSettings ? (
                        <>
                          <Label className="text-sm font-medium">
                            Configuration
                          </Label>
                          <ComponentSettings
                            node={selectedNode}
                            canEdit={canEdit}
                          />
                        </>
                      ) : showDocsFileSystem ? (
                        <DocsFileSystem
                          data={docsData}
                          onDataChange={setDocsData}
                          canEdit={canEdit}
                        />
                      ) : (
                        <SystemContext
                          title={localTitle}
                          onTitleChange={(e) =>
                            canEdit && setLocalTitle(e.target.value)
                          }
                          description={localDescription}
                          onDescriptionChange={(e) =>
                            canEdit && setLocalDescription(e.target.value)
                          }
                          canEdit={canEdit}
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
                checkSolution={handleCheckSolution}
                feedback={feedback}
                isLoadingAnswer={isLoadingAnswer}
                isFeedbackExpanded={isFeedbackExpanded}
                onOpen={() => setIsFeedbackExpanded(true)}
                onClose={() => setIsFeedbackExpanded(false)}
                isSaving={isSaving}
                onSave={canEdit ? handleSaveWithCommitDialog : undefined}
                canEdit={canEdit}
              />
            )}
            canEdit={canEdit}
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
                    playgroundId={playgroundId}
                    playgroundTitle={localTitle || "Untitled Playground"}
                    playgroundDescription={localDescription}
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
            playgroundId={playgroundId}
            playgroundTitle={localTitle || "Untitled Playground"}
            playgroundDescription={localDescription}
            onOpenSidePanel={() => setIsChatPanelOpen(true)}
          />
        </div>
      )}

      {/* Commit Message Dialog */}
      <CommitMessageDialog
        isOpen={showCommitDialog}
        onClose={handleCloseCommitDialog}
        onCommit={handleCommit}
        isCommitting={isSaving}
        playgroundTitle={localTitle || "Untitled Playground"}
      />
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
