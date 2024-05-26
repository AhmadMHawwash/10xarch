'use client'
import { DrawManagerProvider, useDrawManager } from "@/lib/hooks/useDrawManager";
import { useLevelsManager } from "@/lib/hooks/useLevelsManager";
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
import SystemComponentNode from "./SystemComponentNode";
import { CustomEdge } from "./CustomEdge";
import { Dashboard } from "./SystemDashboard";
import Gallery from "./Gallery";
const nodeTypes: Record<string, ComponentType<NodeProps>> = {
  SystemComponentNode: SystemComponentNode,
};

const edgeTypes: Record<string, ComponentType<EdgeProps>> = {
  CustomEdge: CustomEdge,
};

const DnDFlow = () => {
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
  } = useDrawManager();

  // const { updateUserSolution } = useLevelsManager();

  const handleConnect: OnConnect = (params) => {
    const { source, target } = params;
    if (!source || !target) return;

    // updateUserSolution({ source, target });
    onConnect(params);
  };

  return (
    <div className="flex h-full flex-grow flex-col">
      <ReactFlowProvider>
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
            fitView
          >
            <Background variant={BackgroundVariant.Dots} color="black" />
            <Panel position="top-right">
              <Dashboard />
            </Panel>
            <Controls />
          </ReactFlow>
          <Gallery />
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default function SystemBuilder() {
  return (
    <DrawManagerProvider>
      <DnDFlow />
    </DrawManagerProvider>
  );
}
