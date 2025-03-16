"use client";
import { useEffect, type ComponentType } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MarkerType,
  Panel,
  SelectionMode,
  PanOnScrollMode,
  type EdgeProps,
  type NodeProps,
  type OnConnect,
} from "reactflow";
import "reactflow/dist/base.css";
import "reactflow/dist/style.css";
import { CustomEdge } from "./CustomEdge";
import Gallery from "./Gallery";
import SystemComponentNode from "./ReactflowCustomNodes/SystemComponentNode";
import { Whiteboard } from "./SystemComponents/Whiteboard";
import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";

const nodeTypes: Record<string, ComponentType<NodeProps>> = {
  SystemComponentNode,
  Whiteboard,
};

const edgeTypes: Record<string, ComponentType<EdgeProps>> = {
  CustomEdge,
};

const SystemDesigner = ({
  PassedFlowManager,
}: {
  PassedFlowManager: () => React.ReactNode;
}) => {
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
    onSelectNode,
  } = useSystemDesigner();

  const handleConnect: OnConnect = (params) => {
    const { source, target } = params;
    if (!source || !target) return;

    onConnect(params);
  };

  const whiteboardNode = nodes.find((node) => node.type === "Whiteboard")!;

  useEffect(() => {
    onSelectNode(whiteboardNode);
  }, []);

  return (
    <div
      className="relative flex h-full flex-grow flex-col bg-white dark:bg-gray-900 design-canvas"
      ref={initWrapper}
      id="system-designer"
    >
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
        onNodeClick={(_, node) => onSelectNode(node)}
        onNodeDragStart={(_, node) => onSelectNode(node)}
        onSelectionStart={() => onSelectNode(whiteboardNode)}
        onNodesDelete={() => onSelectNode(whiteboardNode)}
        onPaneClick={() => onSelectNode(whiteboardNode)}
        defaultEdgeOptions={{
          markerEnd: { type: MarkerType.ArrowClosed },
          animated: false,
        }}
        proOptions={{
          hideAttribution: true,
        }}
        connectionMode={ConnectionMode.Loose}
        selectionMode={SelectionMode.Partial}
        fitView={false}
        panOnDrag={false}
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Free}
        selectionOnDrag={true}
        className="light-theme dark:dark-theme"
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#4a5568"
          gap={12}
          size={1}
        />
        <Panel position="bottom-center">
          <PassedFlowManager />
        </Panel>
        <Panel position="top-right" className="m-auto flex">
          <div className="component-gallery">
            <Gallery />
          </div>
        </Panel>
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default function SystemBuilder({
  PassedFlowManager,
}: {
  PassedFlowManager: () => React.ReactNode;
}) {
  return <SystemDesigner PassedFlowManager={PassedFlowManager} />;
}
