import { useCallback, useState } from "react";
import {
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type ReactFlowInstance,
} from "reactflow";
import { type HeroNodeData } from "@/components/ReactflowCustomNodes/HeroSystemComponentNode";

// Example: URL Shortener System
const initialDemoNodes: Node<HeroNodeData>[] = [
  {
    id: "client",
    type: "SystemComponentNode",
    position: { x: 50, y: 150 },
    data: { 
      label: "Client App",
      description: "Web/Mobile",
      type: "client",
      name: "Client",
      id: "client",
      configs: {},
    },
    draggable: false,
  },
  {
    id: "load-balancer",
    type: "SystemComponentNode",
    position: { x: 250, y: 150 },
    data: { 
      label: "Load Balancer",
      description: "Round Robin",
      type: "load-balancer",
      name: "Load Balancer",
      id: "load-balancer",
      configs: {},
    },
    draggable: false,
  },
  {
    id: "api-service",
    type: "SystemComponentNode",
    position: { x: 450, y: 150 },
    data: { 
      label: "URL Service",
      description: "URL Generation/Redirect",
      type: "service",
      name: "Server",
      id: "api-service",
      configs: {},
    },
    draggable: false,
  },
  {
    id: "cache",
    type: "SystemComponentNode",
    position: { x: 650, y: 50 },
    data: { 
      label: "Redis Cache",
      description: "URL Mapping Cache",
      type: "cache",
      name: "Cache",
      id: "cache",
      configs: {},
    },
    draggable: false,
  },
  {
    id: "database",
    type: "SystemComponentNode",
    position: { x: 650, y: 250 },
    data: { 
      label: "URL Database",
      description: "PostgreSQL",
      type: "database",
      name: "Database",
      id: "database",
      configs: {},
    },
    draggable: false,
  },
];

const initialDemoEdges: Edge[] = [
  {
    id: "client-lb",
    source: "client",
    target: "load-balancer",
    type: "CustomEdge",
    animated: true,
  },
  {
    id: "lb-api",
    source: "load-balancer",
    target: "api-service",
    type: "CustomEdge",
    animated: true,
  },
  {
    id: "api-cache",
    source: "api-service",
    target: "cache",
    type: "CustomEdge",
    animated: true,
  },
  {
    id: "api-db",
    source: "api-service",
    target: "database",
    type: "CustomEdge",
    animated: true,
  },
];

interface UseHeroSystemDesignerReturn {
  nodes: Node<HeroNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onInit: (instance: ReactFlowInstance) => void;
}

export function useHeroSystemDesigner(): UseHeroSystemDesignerReturn {
  const [nodes] = useState<Node<HeroNodeData>[]>(initialDemoNodes);
  const [edges] = useState<Edge[]>(initialDemoEdges);

  const onNodesChange = useCallback<OnNodesChange>(() => {
    // Nodes are not changeable in demo
  }, []);

  const onEdgesChange = useCallback<OnEdgesChange>(() => {
    // Edges are not changeable in demo
  }, []);

  const onConnect = useCallback<OnConnect>(() => {
    // Connections are not allowed in demo
  }, []);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    // No initialization needed for demo
  }, []);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onInit,
  };
} 