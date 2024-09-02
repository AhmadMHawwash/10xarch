"use client";
import { LevelContent } from "@/components/playground/LevelContent";
import SystemBuilder from "@/components/SystemDesigner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SystemDesignerProvider } from "@/lib/hooks/useSystemDesigner";
import { ReactFlowProvider } from "reactflow";

export default function Level() {
  return (
    <>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={3}>
          <LevelContent />
        </ResizablePanel>
        <ResizableHandle className="w-1 bg-gray-300 transition-colors hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600" />
        <ResizablePanel defaultSize={75} minSize={60}>
          <ReactFlowProvider>
            <SystemDesignerProvider>
              <SystemBuilder />
            </SystemDesignerProvider>
          </ReactFlowProvider>
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* <AIChatWidget /> */}
    </>
  );
}
