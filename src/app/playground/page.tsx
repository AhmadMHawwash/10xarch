"use client";
import { getSystemComponent } from "@/components/Gallery";
import Notes, { type Note } from "@/components/playground/Notes";
import SystemContext from "@/components/playground/SystemContext";
import TodoList, { type TodoItem } from "@/components/playground/TodoList";
import { FlowManager } from "@/components/SolutionFlowManager";
import SystemBuilder from "@/components/SystemDesigner";
import { Card } from "@/components/ui/card";
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
import { usePlaygroundManager } from "@/lib/hooks/usePlaygroundManager";
import { type SystemComponentType } from "@/lib/levels/type";
import { useEffect, useState } from "react";
import { usePrevious } from "react-use";
import { ReactFlowProvider } from "reactflow";

export default function Page() {
  return (
    <ReactFlowProvider>
      <SystemDesignerProvider>
        <PageContent />
      </SystemDesignerProvider>
    </ReactFlowProvider>
  );
}

function PageContent() {
  const { selectedNode, useSystemComponentConfigSlice } = useSystemDesigner();
  const {
    checkSolution,
    answer: feedback,
    isLoadingAnswer,
  } = usePlaygroundManager();
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const prevFeedback = usePrevious(feedback);

  useEffect(() => {
    if (prevFeedback !== feedback && prevFeedback) {
      setIsFeedbackExpanded(true);
    }
  }, [feedback, prevFeedback]);

  const [todos, setTodos] = useSystemComponentConfigSlice<TodoItem[]>(
    selectedNode?.id ?? "",
    "todos",
    [],
  );
  const [notes, setNotes] = useSystemComponentConfigSlice<Note[]>(
    selectedNode?.id ?? "",
    "notes",
    [],
  );
  const [context, setContext] = useSystemComponentConfigSlice<string>(
    selectedNode?.id ?? "",
    "context",
    "",
  );
  const [displayName, setDisplayName] = useSystemComponentConfigSlice<string>(
    selectedNode?.id ?? "",
    "display name",
    "",
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const comp = getSystemComponent(
    selectedNode?.data.name as SystemComponentType,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const Icon = comp?.icon ?? (() => null);

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={25} minSize={3}>
        <div className="h-full bg-gray-50/50 dark:bg-gray-900/50 p-4">
          <Card className="h-full border-gray-200 dark:border-gray-800">
            <div className="flex items-center border-b border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <span className="text-base font-medium">
                  {selectedNode?.data.id && selectedNode.type !== "Whiteboard"
                    ? selectedNode?.data.name
                    : "System"}
                </span>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {selectedNode && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    className="w-full"
                    placeholder="Component name"
                    value={displayName}
                    onChange={(e) => {
                      if (!selectedNode?.id) return;
                      setDisplayName(e.target.value);
                    }}
                  />
                </div>
              )}
              
              <Tabs defaultValue="context" className="w-full">
                <TabsList className="w-full grid grid-cols-3 gap-1">
                  <TabsTrigger value="context" className="text-sm">Context</TabsTrigger>
                  <TabsTrigger value="todo" className="text-sm">Todo</TabsTrigger>
                  <TabsTrigger value="notes" className="text-sm">Notes</TabsTrigger>
                </TabsList>
                <div className="mt-4 h-[calc(100vh-280px)]">
                  <TabsContent value="todo" className="h-full m-0">
                    <TodoList todos={todos} setTodos={setTodos} />
                  </TabsContent>
                  <TabsContent value="notes" className="h-full m-0">
                    <Notes notes={notes} setNotes={setNotes} />
                  </TabsContent>
                  <TabsContent value="context" className="h-full m-0">
                    <SystemContext context={context} setContext={setContext} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </Card>
        </div>
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
  );
}
