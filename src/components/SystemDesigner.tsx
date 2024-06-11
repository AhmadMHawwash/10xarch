"use client";
import {
  SystemDesignerProvider,
  useSystemDesigner as useSystemDesigner,
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
  type OnConnect,
} from "reactflow";
import "reactflow/dist/style.css";
import { CustomEdge } from "./CustomEdge";
import Gallery from "./Gallery";
import SystemComponentNode from "./SystemComponentNode";
import { Dashboard } from "./SystemDashboard";
import { Button } from "./ui/button";
import { useLevelManager } from "@/lib/hooks/useLevelManager";

const nodeTypes: Record<string, ComponentType<NodeProps>> = {
  SystemComponentNode,
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

  const { checkSolution, toNextLevel } = useLevelManager();

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
        connectionMode={ConnectionMode.Loose}
        panOnScroll
        selectionOnDrag
        panOnDrag={false}
        selectionMode={SelectionMode.Partial}
        fitView={false}
      >
        <Background variant={BackgroundVariant.Dots} color="black" />
        <Panel position="top-left">
          <Dashboard />
        </Panel>
        <Panel position="top-right">
          <Gallery />
        </Panel>
        <Panel position="bottom-right">
          <Button onClick={checkSolution}>Check solution</Button>
          <Button onClick={toNextLevel}>To next level</Button>
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
