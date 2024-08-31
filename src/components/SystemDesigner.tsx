"use client";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import {
  SystemDesignerProvider,
  useSystemDesigner,
} from "@/lib/hooks/useSystemDesigner";
import { Loader2, RotateCcw } from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MarkerType,
  Panel,
  ReactFlowProvider,
  SelectionMode,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  type OnConnect,
} from "reactflow";
import "reactflow/dist/style.css";
import { CustomEdge } from "./CustomEdge";
import Gallery from "./Gallery";
import APIsNode, {
  type SystemComponentNodeDataProps,
} from "./ReactflowCustomNodes/APIsNode";
import SystemComponentNode, {
  type OtherNodeDataProps,
} from "./ReactflowCustomNodes/SystemComponentNode";
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
    setNodes,
    setEdges,
  } = useSystemDesigner();

  const { checkSolution, isLoadingAnswer } = useChallengeManager();

  const handleConnect: OnConnect = (params) => {
    const { source, target } = params;
    if (!source || !target) return;

    onConnect(params);
  };

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saveToLocalStorage = () => {
      const flowData = { nodes, edges };
      localStorage.setItem("reactFlowData", JSON.stringify(flowData));
    };

    // Only save if the initial load is complete
    if (isLoaded) {
      saveToLocalStorage();
    }
  }, [nodes, edges, isLoaded]);

  useEffect(() => {
    const savedData = localStorage.getItem("reactFlowData");

    if (!savedData) {
      setNodes([
        {
          id: "Whiteboard-1",
          type: "Whiteboard",
          data: {
            name: "Whiteboard",
            id: "Whiteboard-1",
            configs: {},
          },
          position: {
            x: 100,
            y: 100,
          },
        },
      ]);
      setEdges([]);
    } else {
      try {
        const parsedData = JSON.parse(savedData) as {
          nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[];
          edges: Edge[];
        };
        if (
          Array.isArray(parsedData.nodes) &&
          Array.isArray(parsedData.edges)
        ) {
          setNodes(
            parsedData.nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                name: node.data.name as "Whiteboard" | "Group" | "APIs List",
              },
            })),
          );
          setEdges(parsedData.edges);
        }
      } catch (error) {
        console.error("Error parsing saved flow data:", error);
      }
    }
    // Mark as loaded after the loading process is complete
    setIsLoaded(true);
  }, []); // Empty dependency array ensures this runs only once on mount

  const resetFlow = () => {
    localStorage.removeItem("reactFlowData");
    setNodes([
      {
        id: "Whiteboard-1",
        type: "Whiteboard",
        data: {
          name: "Whiteboard",
          id: "Whiteboard-1",
          configs: {},
        },
        position: {
          x: 100,
          y: 100,
        },
      },
    ]);
    setEdges([]);
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
        <Panel
          position="bottom-center"
          className="flex rounded-sm bg-slate-100 p-2"
        >
          <Button
            size="xs"
            className="mr-2"
            onClick={resetFlow}
            variant="outline"
            title="Reset solution to initial state"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="xs"
            onClick={checkSolution}
            disabled={isLoadingAnswer}
            title="Check solution"
          >
            {isLoadingAnswer ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Run solution"
            )}
          </Button>
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
