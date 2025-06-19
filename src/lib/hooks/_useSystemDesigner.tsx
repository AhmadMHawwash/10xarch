"use client";
import {
  type SystemComponentNodeDataProps,
  type WhiteboardNodeDataProps,
} from "@/components/ReactflowCustomNodes/SystemComponentNode";
import { useToast } from "@/components/ui/use-toast";
import { noop } from "@/lib/utils";
import {
  createWhiteboardDeletionNotifier,
  findNodesToUpdateAfterDeletion,
  scheduleNodeInternalsUpdate,
  updateNodesFromEdgeChanges
} from "@/lib/utils/system-designer-utils";
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
  type EdgeChange,
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
  updateEdgeLabel as updateEdgeLabelPure,
} from "./systemDesignerUtils";
import useLocalStorageState from "./useLocalStorageState";

interface SystemDesignerState {
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[];
  edges: Edge[];
  initInstance: (instance: ReactFlowInstance) => void;
  initWrapper: (wrapper: HTMLDivElement) => void;
  updateNodes: (nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[]) => void;
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
    nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  ) => void;
  setEdges: (edges: Edge[]) => void;
  onSelectNode: (
    node: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps> | null,
  ) => void;
  onSelectEdge: (edge: Edge | null) => void;
  selectedNode: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps> | null;
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
  
  // Check if we're in a playground (not a challenge)
  const isPlayground = pathname.startsWith('/playgrounds/');
  
  // For playgrounds, use regular state; for challenges, use local storage
  const [playgroundNodes, setPlaygroundNodes] = useState<Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[]>(defaultStartingNodes);
  const [playgroundEdges, setPlaygroundEdges] = useState<Edge[]>([]);
  
  // Track when playground nodes have been processed to apply deserializer logic
  const playgroundNodesProcessedRef = useRef(false);
  
  // Reset processed flag when pathname changes (different playground)
  useEffect(() => {
    playgroundNodesProcessedRef.current = false;
  }, [pathname]);
  
  // Apply deserializer logic to playground nodes when they're loaded from database
  useEffect(() => {
    if (isPlayground && playgroundNodes.length > 0 && playgroundNodes !== defaultStartingNodes && !playgroundNodesProcessedRef.current) {
      // Apply the same deserializer logic used in challenges to ensure proper component counting
      const serializedNodes = JSON.stringify(playgroundNodes);
      const deserializedNodes = deserializeNodes(serializedNodes);
      
      // If deserialization was successful and we have nodes, use them
      if (deserializedNodes.length > 0) {
        setPlaygroundNodes(deserializedNodes);
        playgroundNodesProcessedRef.current = true;
      }
    }
  }, [isPlayground, playgroundNodes]);
  
  const [challengeNodes, setChallengeNodes] = useLocalStorageState<
    Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[]
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
  const [challengeEdges, setChallengeEdges] = useLocalStorageState<Edge[]>(
    `${normalizedPathname}-reactflow-edges`,
    [],
  );
  
  // Use the appropriate state based on context
  const nodes = isPlayground ? playgroundNodes : challengeNodes;
  const edges = isPlayground ? playgroundEdges : challengeEdges;
  const setNodes = isPlayground ? setPlaygroundNodes : setChallengeNodes;
  const setEdges = isPlayground ? setPlaygroundEdges : setChallengeEdges;
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { setViewport } = useReactFlow();
  const [isEdgeBeingConnected, setIsEdgeBeingConnected] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node<
    SystemComponentNodeDataProps | WhiteboardNodeDataProps
  > | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const { toast } = useToast();
  const [clipboardData, setClipboardData] = useState<{
    nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[];
    edges: Edge[];
  } | null>(null);
  const updateNodeInternals = useUpdateNodeInternals();

  const onConnect: OnConnect = useCallback(
    (params) => {
      const result = handleConnect(params, nodes, edges);
      queueMicrotask(() => {
        setNodes(result.updatedNodes);
        setEdges(result.updatedEdges);
      });

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

  const updateNodes = useCallback((nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[]) => {
    setNodes(nodes);
  }, [setNodes]);

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
    const notifyWhiteboardDeletion = createWhiteboardDeletionNotifier(toast);
    
    const result = handleNodesChange(changes, nodes, edges, notifyWhiteboardDeletion);
    
    // Update both edges and nodes
    queueMicrotask(() => {
      setEdges(result.updatedEdges);
      setNodes(result.updatedNodes);
    });
    
    // Find nodes that might have had handles changed
    const nodeDeletions = changes.filter(change => change.type === 'remove');
    if (nodeDeletions.length > 0) {
      // For each deleted node, find connected nodes that need their internals updated
      const deletedNodeIds = nodeDeletions.map(change => change.id);
      const nodesToUpdateInternals = findNodesToUpdateAfterDeletion(deletedNodeIds, edges);
      
      // Update the internals of all affected nodes
      scheduleNodeInternalsUpdate(nodesToUpdateInternals, updateNodeInternals);
    }
  }, [nodes, edges, toast, updateNodeInternals]);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    const result = handleEdgesChange(changes, edges, nodes);
    queueMicrotask(() => {
      setNodes(nodes => {
        // Update the nodes with the updated data
        // this is just to not overwrite reactflow's internal state (selected, etc)
        return updateNodesFromEdgeChanges(nodes, result.updatedNodes);
      });
      setEdges(result.updatedEdges);
    });

    // Schedule UI updates for affected nodes
    scheduleNodeInternalsUpdate(result.nodesToUpdateUI, updateNodeInternals, 100);
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
      
      // Handle edge deletion with Delete or Backspace key
      if ((event.key === "Delete" || event.key === "Backspace") && selectedEdge) {
        // Don't delete the edge if the user is editing text in an input or textarea
        const activeElement = document.activeElement;
        if (
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          (activeElement instanceof HTMLElement && activeElement.isContentEditable)
        ) {
          return;
        }
        
        const edgeChange: EdgeChange = {
          id: selectedEdge.id,
          type: "remove",
        };
        onEdgesChange([edgeChange]);
        setSelectedEdge(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCopy, handlePaste, selectedEdge, onEdgesChange]);

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
