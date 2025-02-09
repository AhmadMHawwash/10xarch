"use client";
import { useHeroSystemDesigner } from "@/lib/hooks/useHeroSystemDesigner";
import { Bot, ChevronDown, ChevronUp } from "lucide-react";
import { useState, type ComponentType } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MarkerType,
  Panel,
  SelectionMode,
  type EdgeProps,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/base.css";
import "reactflow/dist/style.css";
import { CustomEdge } from "./CustomEdge";
import HeroSystemComponentNode from "./ReactflowCustomNodes/HeroSystemComponentNode";

const nodeTypes: Record<string, ComponentType<NodeProps>> = {
  SystemComponentNode: HeroSystemComponentNode,
};

const edgeTypes: Record<string, ComponentType<EdgeProps>> = {
  CustomEdge,
};

function HeroAIFeedback() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-lg bg-white/5 backdrop-blur-lg dark:bg-gray-800/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/5"
      >
        <div className="text-sm text-gray-500 dark:text-gray-400">AI Feedback</div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          <div>
            <div className="mb-1 text-xs font-medium text-emerald-500 dark:text-emerald-400">✓ Strengths</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Lightning-fast URL lookups with Redis cache, high availability through load balancing, and reliable data storage with PostgreSQL.
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-amber-500 dark:text-amber-400">↑ Improvable</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Consider adding rate limiting and analytics tracking for production readiness.
            </div>
          </div>
          <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
            <div className="text-xs text-blue-500 dark:text-blue-400">💡 Pro Tip</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Get detailed explanations and explore alternative designs by chatting with our AI system design expert.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HeroSystemDesigner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onInit,
  } = useHeroSystemDesigner();

  return (
    <div className="relative flex h-full flex-grow flex-col bg-white dark:bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
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
        selectionMode={SelectionMode.Partial}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.8,
          maxZoom: 0.8,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        className="light-theme dark:dark-theme"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.8}
        maxZoom={0.8}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#4a5568"
          gap={12}
          size={1}
        />
        <Panel position="top-center" className="left-0 right-0 top-0 w-full">
          <div className="w-full bg-white/5 px-4 py-3 backdrop-blur-lg dark:bg-gray-800/50">
            <div className="mx-auto flex max-w-screen-xl items-center gap-2 text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-200">Challenges</span>
              <span className="text-gray-400">/</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">URL Shortener</span>
              <span className="text-gray-400">/</span>
              <span className="text-blue-600 dark:text-blue-400">High-Level Design</span>
            </div>
          </div>
        </Panel>
        <Panel position="bottom-center">
          <HeroAIFeedback />
        </Panel>
        <Panel position="bottom-right" className="p-4">
          <button className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-all hover:bg-blue-600">
            <Bot className="h-6 w-6" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900/75 px-3 py-1.5 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm">
              Chat with AI
            </div>
          </button>
        </Panel>
        <Controls />
      </ReactFlow>
    </div>
  );
} 