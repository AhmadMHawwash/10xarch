"use client";
import Notes, { type Note } from "@/components/playground/Notes";
import SystemContext from "@/components/playground/SystemContext";
import TodoList, { type TodoItem } from "@/components/playground/TodoList";
import SystemBuilder from "@/components/SystemDesigner";
import { Input } from "@/components/ui/input";
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
import { useEffect, useRef, useState } from "react";
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
  const { selectedNode } = useSystemDesigner();
  const { useSystemComponentConfigSlice, updateNodeDisplayName } =
    usePlaygroundManager();

  const [displayName, setDisplayName] = useState<string>(
    selectedNode?.data.displayName ?? selectedNode?.data.id ?? "",
  );
  const previousSelectedNodeId = useRef<string | null>(
    selectedNode?.id ?? null,
  );

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

  useEffect(() => {
    // @important: keep the order of the following operations as they are
    // if selected node has changed
    // 1. update the node display name on application state
    updateNodeDisplayName(previousSelectedNodeId.current ?? "", displayName);

    // 2. update the display name on local state
    setDisplayName(
      selectedNode?.data.displayName ?? selectedNode?.data.id ?? "",
    );

    // 3. update the previous selected node id on local state
    previousSelectedNodeId.current = selectedNode?.id ?? null;
  }, [selectedNode]);

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={25} minSize={3}>
        <div className="flex w-[95%] min-w-[300px] flex-col">
          <H3 className="p-2 pl-3">
            {selectedNode?.data.id
              ? `'${selectedNode?.data.displayName}' ${selectedNode?.data.name}`
              : "System"}
          </H3>
          <Input
            className={cn("m-2 w-[95%]", selectedNode ? "" : "hidden")}
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
        <SystemBuilder />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
