"use client";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import {
  SystemDesignerProvider,
  useSystemDesigner,
} from "@/lib/hooks/useSystemDesigner";
import { Loader2 } from "lucide-react";
import { type ComponentType } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MarkerType,
  Panel,
  ReactFlowProvider,
  SelectionMode,
  type EdgeProps,
  type NodeProps,
  type OnConnect,
} from "reactflow";
import "reactflow/dist/style.css";
import { CustomEdge } from "./CustomEdge";
import Gallery from "./Gallery";
import APIsNode from "./ReactflowCustomNodes/APIsNode";
import SystemComponentNode from "./ReactflowCustomNodes/SystemComponentNode";
import { Whiteboard } from "./SystemComponents/Whiteboard";
import { Button } from "./ui/button";

const nodeTypes: Record<string, ComponentType<NodeProps>> = {
  SystemComponentNode,
  Whiteboard,
  APIsNode,
};

const edgeTypes: Record<string, ComponentType<EdgeProps>> = {
  CustomEdge,
};

const SystemDesigner = () => {
  const {
    nodes,
    edges,
    initInstance,
    onEdgesChange,
    onNodesChange,
    initWrapper,
    onConnect,
    onDragOver,
    onDrop,
    onConnectStart,
    onConnectEnd,
  } = useSystemDesigner();

  const { checkSolution, isLoadingAnswer } = useChallengeManager();

  const handleConnect: OnConnect = (params) => {
    const { source, target } = params;
    if (!source || !target) return;

    // updateUserSolution({ source, target });
    onConnect(params);
  };

  return (
    <div className="relative flex h-full flex-grow flex-col" ref={initWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onInit={initInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          markerEnd: { type: MarkerType.ArrowClosed },
          animated: true,
        }}
        proOptions={{
          hideAttribution: true,
        }}
        connectionMode={ConnectionMode.Loose}
        panOnScroll
        selectionOnDrag
        panOnDrag={false}
        selectionMode={SelectionMode.Partial}
        fitView={false}
      >
        <Background variant={BackgroundVariant.Dots} color="black" />
        <Panel position="top-right" className="flex flex-col items-end">
          <Button className="mr-2" onClick={checkSolution} disabled={isLoadingAnswer}>
            {isLoadingAnswer ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check solution'
            )}
          </Button>
          <Gallery />
          {/* <ApiRequestFlowModeMode /> */}
        </Panel>
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default function SystemBuilder() {
  return (
    <ReactFlowProvider>
      <SystemDesignerProvider>
        <SystemDesigner />
      </SystemDesignerProvider>
    </ReactFlowProvider>
  );
}
