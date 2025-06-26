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
import { Button } from "@/components/ui/button";
import "reactflow/dist/base.css";
import "reactflow/dist/style.css";
import { CustomEdgeComponent as CustomEdge } from "./CustomEdge";
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
  onSaveLinking,
}: {
  PassedFlowManager: () => React.ReactNode;
  canEdit?: boolean;
  onSaveLinking?: () => void;
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
    // Linking functionality from context
    linkingTextAreaId,
    linkingSelection,
    stopLinking,
    isLinkingMode,
  } = useSystemDesigner();

  // Track selection changes for linking - simplified to use React Flow's built-in selection
  useEffect(() => {
    // React Flow handles selection internally, the context tracks it automatically
    // No additional logic needed here since the context useEffect handles selection tracking
  }, []);

  const handleConnect: OnConnect = (params) => {
    if (!canEdit) return; // Prevent connections in view-only mode
    const { source, target } = params;
    if (!source || !target) return;

    onConnect(params);
  };

  const whiteboardNode = nodes.find((node) => node.type === "Whiteboard")!;

  useEffect(() => {
    onSelectNode(whiteboardNode);
  }, [onSelectNode, whiteboardNode]);

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
        onNodeClick={(event, node) => {
          // During linking mode, allow React Flow's built-in selection behavior
          if (linkingTextAreaId) {
            // Let React Flow handle the selection, the context will track it automatically
            return;
          }
          
          // Only set focused element for UI panels if not multi-selecting
          if (!event.ctrlKey && !event.metaKey) {
            onSelectNode(node);
            // Don't clear edge selection - let user mix selections freely
          }
        }}
        onEdgeClick={(event, edge) => {
          // During linking mode, allow React Flow's built-in selection behavior
          if (linkingTextAreaId) {
            // Let React Flow handle the selection, the context will track it automatically
            return;
          }
          
          // Only set focused element for UI panels if not multi-selecting
          if (!event.ctrlKey && !event.metaKey) {
            onSelectEdge(edge);
            // Don't clear node selection - let user mix selections freely
          }
        }}
        onNodeDragStart={
          canEdit
            ? (_, node) => {
                onSelectNode(node);
                // Don't clear edge selection - let user mix selections freely
              }
            : undefined
        }
        onSelectionStart={() => {
          onSelectNode(whiteboardNode);
          // Don't clear edge selection - let user mix selections freely
        }}
        onNodesDelete={canEdit ? () => onSelectNode(whiteboardNode) : undefined}
        onEdgesDelete={canEdit ? () => onSelectEdge(null) : undefined}
        onPaneClick={() => {
          onSelectNode(whiteboardNode);
          onSelectEdge(null); // Pane click should clear all selections - this is expected behavior
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
        {linkingTextAreaId && (
          <Panel position="top-center">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Command/Ctrl + click to link 1+ element (node or edge) to the
                  selected textarea
                </span>
                <div className="flex items-center gap-2">
                  {onSaveLinking && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={onSaveLinking}
                      className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save Links
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopLinking}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        )}
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
  onSaveLinking,
}: {
  PassedFlowManager: () => React.ReactNode;
  canEdit?: boolean;
  onSaveLinking?: () => void;
}) {
    return (
    <SystemDesigner 
      PassedFlowManager={PassedFlowManager} 
      canEdit={canEdit}
      onSaveLinking={onSaveLinking}
    />
  );
}
