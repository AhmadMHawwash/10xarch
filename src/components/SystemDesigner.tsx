"use client";
import {
  SystemDesignerProvider,
  useSystemDesigner,
} from "@/lib/hooks/useSystemDesigner";
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
  type OnConnect
} from "reactflow";
import "reactflow/dist/base.css";
import "reactflow/dist/style.css";
import { CustomEdge } from "./CustomEdge";
import { FlowManager } from "./SolutionFlowManager";
import Gallery from "./Gallery";
import APIsNode from "./ReactflowCustomNodes/APIsNode";
import SystemComponentNode from "./ReactflowCustomNodes/SystemComponentNode";
import { Whiteboard } from "./SystemComponents/Whiteboard";

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

  const handleConnect: OnConnect = (params) => {
    const { source, target } = params;
    if (!source || !target) return;

    onConnect(params);
  };

  return (
    <div className="relative flex h-full flex-grow flex-col bg-gray-900" ref={initWrapper}>
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
        className="dark-theme"
      >
        <Background variant={BackgroundVariant.Dots} color="#4a5568" />
        <Panel position="bottom-center">
          <FlowManager />
        </Panel>
        <Panel position="top-right" className="m-auto flex">
          <Gallery />
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
