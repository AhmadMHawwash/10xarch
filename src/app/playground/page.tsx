"use client";
import Notes, { type Note } from "@/components/playground/Notes";
import SystemContext from "@/components/playground/SystemContext";
import TodoList, { type TodoItem } from "@/components/playground/TodoList";
import { FlowManager } from "@/components/SolutionFlowManager";
import SystemBuilder from "@/components/SystemDesigner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { H3 } from "@/components/ui/typography";
import { usePlaygroundManager } from "@/lib/hooks/usePlaygroundManager";
import {
  SystemDesignerProvider,
  useSystemDesigner,
} from "@/lib/hooks/useSystemDesigner";
import { cn } from "@/lib/utils";
import { usePrevious } from "react-use";
import { useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import { getSystemComponent } from "@/components/Gallery";
import { type SystemComponentType } from "@/lib/levels/type";

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
        <div className="flex w-[95%] min-w-[300px] flex-col items-center ml-2">
          <div className="flex items-center justify-start w-full">
            <Icon />
            <H3 className="self-start p-2 pl-3">
              {selectedNode?.data.id && selectedNode.type !== "Whiteboard"
                ? selectedNode?.data.name
                : "System"}
            </H3>
          </div>
          <Label htmlFor="name" className="mt-2 ml-3 self-start">
            Name
          </Label>
          <Input
            id="name"
            className={cn("m-2 ml-0 w-[95%]", selectedNode ? "" : "hidden")}
            placeholder="Name"
            value={displayName}
            onChange={(e) => {
              if (!selectedNode?.id) return;

              setDisplayName(e.target.value);
            }}
          />
          <Tabs defaultValue="context" className="mx-auto mt-1 w-[95%]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="context">Context</TabsTrigger>
              <TabsTrigger value="todo">Todo</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="todo" className="h-[calc(100%-40px)]">
              <TodoList todos={todos} setTodos={setTodos} />
            </TabsContent>
            <TabsContent value="notes" className="h-[calc(100%-40px)]">
              <Notes notes={notes} setNotes={setNotes} />
            </TabsContent>
            <TabsContent value="context" className="h-[calc(100%-40px)]">
              <SystemContext context={context} setContext={setContext} />
            </TabsContent>
          </Tabs>
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
