"use client";
import {
  DrawManagerProvider,
  useDrawManager,
} from "@/lib/hooks/useDrawManager";
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
import SystemComponentNode from "./SystemComponentNode";
import { Dashboard } from "./SystemDashboard";
import { Button } from "./ui/button";

const nodeTypes: Record<string, ComponentType<NodeProps>> = {
  SystemComponentNode: SystemComponentNode,
};

const edgeTypes: Record<string, ComponentType<EdgeProps>> = {
  CustomEdge: CustomEdge,
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
    onSave,
  } = useDrawManager();

  // const { updateUserSolution } = useLevelsManager();

  const handleConnect: OnConnect = (params) => {
    const { source, target } = params;
    if (!source || !target) return;

    // updateUserSolution({ source, target });
    onConnect(params);
  };

  return (
    <div className="relative h-full flex-grow" ref={initWrapper}>
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
        connectionMode={ConnectionMode.Loose}
        panOnScroll
        selectionOnDrag
        panOnDrag={false}
        selectionMode={SelectionMode.Partial}
        fitView={false}
      >
        <Background variant={BackgroundVariant.Dots} color="black" />
        <Panel position="top-right">
          <Dashboard />
        </Panel>
        <Panel position="bottom-right">
          <Button onClick={onSave}>Check solution</Button>
        </Panel>
        <Controls />
      </ReactFlow>
      <Gallery />
    </div>
  );
};

export default function SystemBuilder() {
  return (
    <ReactFlowProvider>
      <DrawManagerProvider>
        <div className="flex h-full flex-grow flex-col">
          <SystemDesigner />
        </div>
      </DrawManagerProvider>
    </ReactFlowProvider>
  );
}
