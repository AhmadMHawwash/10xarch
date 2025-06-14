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
  type OnConnectStart,
  type OnConnectEnd,
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
  canEdit = true,
}: {
  PassedFlowManager: () => React.ReactNode;
  canEdit?: boolean;
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
    onSelectEdge,
    setNodes,
  } = useSystemDesigner();

  const handleConnect: OnConnect = (params) => {
    if (!canEdit) return; // Prevent connections in view-only mode
    const { source, target } = params;
    if (!source || !target) return;

    onConnect(params);
  };

  const whiteboardNode = nodes.find((node) => node.type === "Whiteboard")!;

  useEffect(() => {
    onSelectNode(whiteboardNode);
  }, []);

  // Handler to deselect all nodes when starting a connection
  const handleConnectStart: OnConnectStart = (event, params) => {
    if (!canEdit) {
      event.preventDefault(); // Prevent connection start in view-only mode
      return;
    }
    // Deselect all nodes
    const deselectedNodes = nodes.map((node) => ({
      ...node,
      selected: false,
    }));
    setNodes(deselectedNodes);

    // Call the original handler
    onConnectStart(event, params);
  };

  // Handler to deselect all nodes when ending a connection
  const handleConnectEnd: OnConnectEnd = (event) => {
    if (!canEdit) return; // Prevent connection end in view-only mode
    // Deselect all nodes
    const deselectedNodes = nodes.map((node) => ({
      ...node,
      selected: false,
    }));
    setNodes(deselectedNodes);

    // Call the original handler
    onConnectEnd(event);
  };

  return (
    <div
      className="design-canvas relative flex h-full flex-grow flex-col bg-white dark:bg-gray-900"
      ref={initWrapper}
      id="system-designer"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={canEdit ? onNodesChange : undefined}
        onEdgesChange={canEdit ? onEdgesChange : undefined}
        onConnect={handleConnect}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        onInit={initInstance}
        onDrop={canEdit ? onDrop : undefined}
        onDragOver={canEdit ? onDragOver : undefined}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => {
          onSelectNode(node);
          onSelectEdge(null);
        }}
        onEdgeClick={(_, edge) => {
          // Deselect all nodes by updating their selected property
          const deselectedNodes = nodes.map((node) => ({
            ...node,
            selected: false,
          }));
          setNodes(deselectedNodes);
          
          onSelectEdge(edge);
          onSelectNode(null);
        }}
        onNodeDragStart={canEdit ? (_, node) => {
          onSelectNode(node);
          onSelectEdge(null);
        } : undefined}
        onSelectionStart={() => {
          onSelectNode(whiteboardNode);
          onSelectEdge(null);
        }}
        onNodesDelete={canEdit ? () => onSelectNode(whiteboardNode) : undefined}
        onEdgesDelete={canEdit ? () => onSelectEdge(null) : undefined}
        onPaneClick={() => {
          onSelectNode(whiteboardNode);
          onSelectEdge(null);
        }}
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
        selectionOnDrag={canEdit}
        className="light-theme dark:dark-theme"
        nodesDraggable={canEdit}
        nodesConnectable={canEdit}
        nodesFocusable={canEdit}
        edgesFocusable={canEdit}
        elementsSelectable={true} // Always allow selection for viewing
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
            <Gallery canEdit={canEdit} />
          </div>
        </Panel>
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default function SystemBuilder({
  PassedFlowManager,
  canEdit = true,
}: {
  PassedFlowManager: () => React.ReactNode;
  canEdit?: boolean;
}) {
  return <SystemDesigner PassedFlowManager={PassedFlowManager} canEdit={canEdit} />;
}
