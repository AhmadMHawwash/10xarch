"use client";
import {
  type OtherNodeDataProps,
  type SystemComponentNodeDataProps,
} from "@/components/ReactflowCustomNodes/SystemComponentNode";
import { useToast } from "@/components/ui/use-toast";
import { noop } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type DragEventHandler,
  type PropsWithChildren,
} from "react";
import {
  useReactFlow,
  useUpdateNodeInternals,
  type Edge,
  type Node,
  type OnConnect,
  type OnConnectEnd,
  type OnConnectStart,
  type OnEdgesChange,
  type OnNodesChange,
  type ReactFlowInstance,
} from "reactflow";
import {
  defaultStartingNodes,
  deserializeNodes,
  handleConnect,
  handleConnectEnd,
  handleConnectStart,
  handleCopy as handleCopyPure,
  handleEdgesChange,
  handleNodeDrop,
  handleNodesChange,
  handlePaste as handlePastePure,
  restoreFlow,
  saveFlow,
  updateComponentConfig,
  updateEdgeLabel as updateEdgeLabelPure
} from "./systemDesignerUtils";
import useLocalStorageState from "./useLocalStorageState";

interface SystemDesignerState {
  nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[];
  edges: Edge[];
  initInstance: (instance: ReactFlowInstance) => void;
  initWrapper: (wrapper: HTMLDivElement) => void;
  updateNodes: (nodes: Node[]) => void;
  updateEdges: (edges: Edge[]) => void;
  updateEdgeLabel: (edgeId: string, label: string, data?: Record<string, unknown>) => void;
  onConnect: OnConnect;
  onDragOver: DragEventHandler;
  onDrop: DragEventHandler;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnectStart: OnConnectStart;
  onConnectEnd: OnConnectEnd;
  onSave: () => void;
  onRestore: () => void;
  isEdgeBeingConnected?: boolean;
  setNodes: (
    nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[],
  ) => void;
  setEdges: (edges: Edge[]) => void;
  onSelectNode: (
    node: Node<SystemComponentNodeDataProps | OtherNodeDataProps> | null,
  ) => void;
  onSelectEdge: (edge: Edge | null) => void;
  selectedNode: Node<SystemComponentNodeDataProps | OtherNodeDataProps> | null;
  selectedEdge: Edge | null;
  useSystemComponentConfigSlice: <T>(
    componentId: string,
    configKey: string,
    defaultValue?: T,
  ) => [T, (configValue: T) => void];
  handleCopy: () => void;
  handlePaste: () => void;
}

const SystemDesignerContext = createContext<SystemDesignerState>({
  nodes: [],
  edges: [],
  updateEdges: noop,
  updateNodes: noop,
  updateEdgeLabel: noop,
  initInstance: noop,
  initWrapper: noop,
  onConnect: noop,
  onDragOver: noop,
  onDrop: noop,
  onNodesChange: noop,
  onEdgesChange: noop,
  onConnectStart: noop,
  onConnectEnd: noop,
  onSave: noop,
  onRestore: noop,
  setNodes: noop,
  setEdges: noop,
  selectedNode: null,
  selectedEdge: null,
  onSelectNode: noop,
  onSelectEdge: noop,
  useSystemComponentConfigSlice: noop,
  handleCopy: noop,
  handlePaste: noop,
});


export const SystemDesignerProvider = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const normalizedPathname = pathname;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useLocalStorageState<
    Node<SystemComponentNodeDataProps | OtherNodeDataProps>[]
  >(
    `${normalizedPathname}-reactflow-nodes`, 
    defaultStartingNodes, 
    (value) => {
      // Custom deserializer to ensure we always have at least the default nodes
      const parsedNodes = deserializeNodes(value);
      // If no nodes were parsed or the whiteboard node is missing, return the defaults
      if (parsedNodes.length === 0 || !parsedNodes.some(node => node.id.includes('Whiteboard'))) {
        return defaultStartingNodes;
      }
      return parsedNodes;
    }
  );
  const [edges, setEdges] = useLocalStorageState<Edge[]>(
    `${normalizedPathname}-reactflow-edges`,
    [],
  );
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { setViewport } = useReactFlow();
  const [isEdgeBeingConnected, setIsEdgeBeingConnected] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node<
    SystemComponentNodeDataProps | OtherNodeDataProps
  > | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const { toast } = useToast();
  const [clipboardData, setClipboardData] = useState<{
    nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[];
    edges: Edge[];
  } | null>(null);
  const updateNodeInternals = useUpdateNodeInternals();

  const onConnect: OnConnect = useCallback(
    (params) => {
      const result = handleConnect(params, nodes, edges);
      setNodes(result.updatedNodes);
      setEdges(result.updatedEdges);
      
      // Update node internals
      setTimeout(() => {
        result.nodesToUpdate.forEach(nodeId => {
          updateNodeInternals(nodeId);
        });
      }, 200);
    },
    [nodes, edges, updateNodeInternals],
  );

  const onConnectStart: OnConnectStart = useCallback(
    (event, data) => {
      if (!data.nodeId) return;
      const updatedNodes = handleConnectStart(data.nodeId, data.handleType, nodes);
      setNodes(updatedNodes);
      setIsEdgeBeingConnected(true);
    },
    [nodes],
  );

  const onConnectEnd = useCallback(() => {
    const updatedNodes = handleConnectEnd(nodes);
    setNodes(updatedNodes);
    setIsEdgeBeingConnected(false);
  }, [nodes]);

  const onDragOver: DragEventHandler = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move" as DataTransfer["dropEffect"];
  }, []);

  const onDrop: DragEventHandler = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const componentName = event.dataTransfer.getData(
        "application/reactflow",
      );

      if (!componentName) return;

      const position = reactFlowInstance?.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const updatedNodes = handleNodeDrop(componentName, position, nodes);
      setNodes(updatedNodes);
    },
    [reactFlowInstance, nodes],
  );

  const updateNodes = useCallback((nodes: Node[]) => {
    setNodes(nodes);
  }, []);

  const updateEdges = useCallback((edges: Edge[]) => {
    setEdges(edges);
  }, []);

  const initInstance = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  const initWrapper = useCallback((wrapper: HTMLDivElement) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    reactFlowWrapper.current = wrapper;
  }, []);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    const notifyWhiteboardDeletion = () => {
      toast({
        title: "You cannot delete the System definitions",
      });
    };
    
    const newNodes = handleNodesChange(changes, nodes, notifyWhiteboardDeletion);
    setNodes(newNodes);
  }, [nodes, toast]);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    const result = handleEdgesChange(changes, edges, nodes);
    setNodes(result.updatedNodes);
    setEdges(result.updatedEdges);

    if (result.nodesToUpdateUI.length > 0) {
      setTimeout(() => {
        result.nodesToUpdateUI.forEach((nodeId) => {
          updateNodeInternals(nodeId);
        });
      }, 200);
    }
  }, [nodes, edges, updateNodeInternals]);

  const onSave = useCallback(() => {
    saveFlow(reactFlowInstance);
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const result = restoreFlow();
    
    // Keep default nodes if the restored nodes array is empty
    const restoredNodes = result.nodes.length > 0 ? result.nodes : defaultStartingNodes;
    
    setNodes(restoredNodes);
    setEdges(result.edges);
    setViewport(result.viewport);
  }, [setViewport]);

  const useSystemComponentConfigSlice = useCallback(
    <T,>(
      componentId: string,
      configKey: string,
      defaultValue?: T,
    ): [T, (configValue: T) => void] => {
      const component = nodes.find((node) => node.id === componentId);
      return [
        (component?.data.configs?.[configKey] ?? defaultValue) as T,
        (configValue: T) => {
          const updatedNodes = updateComponentConfig(nodes, componentId, configKey, configValue);
          updateNodes(updatedNodes);
        },
      ];
    },
    [nodes, updateNodes],
  );

  const updateEdgeLabel = useCallback((edgeId: string, label: string, data?: Record<string, unknown>) => {
    const updatedEdges = updateEdgeLabelPure(edges, edgeId, label, data);
    setEdges(updatedEdges);
  }, [edges]);

  const handleCopy = useCallback(() => {
    const result = handleCopyPure(nodes, edges);
    
    if (result.hasWhiteboard) {
      toast({
        title: "Cannot copy System definitions",
        description: "System definition components cannot be copied.",
      });
      return;
    }
    
    setClipboardData({
      nodes: result.clipboardNodes,
      edges: result.clipboardEdges,
    });
  }, [nodes, edges, toast]);

  const handlePaste = useCallback(() => {
    // Don't paste if focus is in a form input element
    const activeElement = document.activeElement;
    if (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      (activeElement instanceof HTMLElement && activeElement.isContentEditable)
    ) {
      return;
    }

    const result = handlePastePure(clipboardData, nodes, edges);
    setNodes(result.newNodes);
    setEdges(result.newEdges);
  }, [clipboardData, nodes, edges]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        handleCopy();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        handlePaste();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCopy, handlePaste]);

  return (
    <SystemDesignerContext.Provider
      value={{
        onConnect,
        onDragOver,
        onDrop,
        initInstance,
        updateNodes,
        updateEdges,
        updateEdgeLabel,
        initWrapper,
        onEdgesChange,
        onNodesChange,
        onConnectStart,
        onConnectEnd,
        onSave,
        onRestore,
        edges,
        nodes,
        isEdgeBeingConnected,
        setNodes,
        setEdges,
        selectedNode,
        selectedEdge,
        onSelectNode: setSelectedNode,
        onSelectEdge: setSelectedEdge,
        useSystemComponentConfigSlice,
        handleCopy,
        handlePaste,
      }}
    >
      {children}
    </SystemDesignerContext.Provider>
  );
};

export const useSystemDesigner = () => {
  return useContext(SystemDesignerContext);
};
