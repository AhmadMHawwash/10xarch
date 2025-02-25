"use client";
import { getSystemComponent } from "@/components/Gallery";
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
  useRef,
  useState,
  useEffect,
  type DragEventHandler,
  type PropsWithChildren,
} from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  useUpdateNodeInternals,
  type Edge,
  type Node,
  type NodeChange,
  type OnConnect,
  type OnConnectEnd,
  type OnConnectStart,
  type OnEdgesChange,
  type OnNodesChange,
  type ReactFlowInstance,
  type ReactFlowJsonObject,
} from "reactflow";
import { type SystemComponent, type SystemComponentType } from "../levels/type";
import { componentsNumberingStore } from "../levels/utils";
import { SYSTEM_COMPONENT_NODE } from "./useChallengeManager";
import useLocalStorageState from "./useLocalStorageState";

interface SystemDesignerState {
  nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[];
  edges: Edge[];
  initInstance: (instance: ReactFlowInstance) => void;
  initWrapper: (wrapper: HTMLDivElement) => void;
  updateNodes: (nodes: Node[]) => void;
  updateEdges: (edges: Edge[]) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
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
  selectedNode: Node<SystemComponentNodeDataProps | OtherNodeDataProps> | null;
  useSystemComponentConfigSlice: <T>(
    componentId: string,
    configKey: string,
    defaultValue?: T,
  ) => [T, (configValue: T) => void];
  handleCopy: () => void;
  handlePaste: (event: KeyboardEvent) => void;
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
  onSelectNode: noop,
  useSystemComponentConfigSlice: noop,
  handleCopy: noop,
  handlePaste: noop,
});

const componentTargets: Record<
  SystemComponent["name"],
  SystemComponent["name"][]
> = {
  Client: ["Server", "Load Balancer", "CDN"],
  CDN: ["Load Balancer", "Server"],
  "Load Balancer": ["Server"],
  Server: ["Cache", "Database", "Message Queue"],
  Cache: ["Database"],
  Database: [],
  "Message Queue": ["Server"],
};

const deserializeNodes = (nodes: string | null) => {
  if (nodes === null) return [];
  const parsedNodes = JSON.parse(nodes) as Node<
    SystemComponentNodeDataProps | OtherNodeDataProps
  >[];

  // Instead of resetting, update the component numbering store to the highest number for each component
  const componentCounts: Record<SystemComponent["name"], number> = {
    Client: 1,
    Server: 1,
    Database: 1,
    "Load Balancer": 1,
    Cache: 1,
    CDN: 1,
    "Message Queue": 1,
  };

  // Calculate the highest number for each component type
  parsedNodes.forEach((node) => {
    if (node.data.name === "Whiteboard") return;
    
    const match = node.id.match(/^(.+)-(\d+)$/);
    if (match?.[1] && match[2]) {
      const componentName = match[1];
      const number = parseInt(match[2], 10);
      if (componentName in componentCounts && !isNaN(number)) {
        componentCounts[componentName as SystemComponent["name"]] = 
          Math.max(componentCounts[componentName as SystemComponent["name"]], number + 1);
      }
    }
  });

  // Update the component numbering store with the highest numbers
  componentsNumberingStore.setState({
    componentsToCount: componentCounts,
  });

  return parsedNodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      name: node.data.name as SystemComponent["name"],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      icon: getSystemComponent(node.data.name as SystemComponentType)?.icon,
      targetHandles: node.data.targetHandles ?? [],
      sourceHandles: node.data.sourceHandles ?? [],
    },
  }));
};

export const defaultStartingNodes: Node<
  SystemComponentNodeDataProps | OtherNodeDataProps
>[] = [
  {
    id: "Whiteboard-1",
    type: "Whiteboard",
    data: {
      name: "Whiteboard",
      id: "Whiteboard-1",
      configs: {},
      targetHandles: [],
    },
    position: {
      x: 100,
      y: 100,
    },
  },
];

export const SystemDesignerProvider = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useLocalStorageState<
    Node<SystemComponentNodeDataProps | OtherNodeDataProps>[]
  >(`${pathname}-reactflow-nodes`, defaultStartingNodes, deserializeNodes);
  const [edges, setEdges] = useLocalStorageState<Edge[]>(
    `${pathname}-reactflow-edges`,
    [],
  );
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { setViewport } = useReactFlow();
  const [isEdgeBeingConnected, setIsEdgeBeingConnected] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node<
    SystemComponentNodeDataProps | OtherNodeDataProps
  > | null>(null);
  const { toast } = useToast();
  const [clipboardData, setClipboardData] = useState<{
    nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[];
    edges: Edge[];
  } | null>(null);
  const updateNodeInternals = useUpdateNodeInternals();

  const onConnect: OnConnect = useCallback(
    (params) => {
      const { source, target, targetHandle, sourceHandle } = params;
      const sourceNode = nodes.find((node) => node.id === source);
      const targetNode = nodes.find((node) => node.id === target);

      if (!sourceNode || !targetNode) return;

      // to exclude OtherNodeDataProps
      const typedSourceNode = sourceNode as Node<SystemComponentNodeDataProps>;
      // to exclude OtherNodeDataProps
      const typedTargetNode = targetNode as Node<SystemComponentNodeDataProps>;

      const targets = componentTargets[typedSourceNode?.data.name];
      if (!targets.includes(typedTargetNode?.data.name)) {
        return;
      }

      // Update both nodes' handles
      const updatedNodes = nodes.map((node) => {
        if (node.id === target) {
          // Update target node's targetHandles
          const updatedTargetHandles =
            node.data.targetHandles?.map((handle) => ({
              ...handle,
              isConnected: handle.isConnected || handle.id === targetHandle,
            })) ?? [];

          // Generate a unique handle ID
          const timestamp = Date.now();
          const newTargetHandle = {
            id: `${target}-target-handle-${timestamp}`,
            isConnected: false,
          };

          return {
            ...node,
            data: {
              ...node.data,
              targetHandles: [...updatedTargetHandles, newTargetHandle],
            },
          };
        }
        
        if (node.id === source) {
          // Update source node's sourceHandles
          const updatedSourceHandles =
            node.data.sourceHandles?.map((handle) => ({
              ...handle,
              isConnected: handle.isConnected || handle.id === sourceHandle,
            })) ?? [];

          // Generate a unique handle ID
          const timestamp = Date.now();
          const newSourceHandle = {
            id: `${source}-source-handle-${timestamp}`,
            isConnected: false,
          };

          return {
            ...node,
            data: {
              ...node.data,
              sourceHandles: [...updatedSourceHandles, newSourceHandle],
            },
          };
        }
        
        return node;
      });

      queueMicrotask(() => {
        setEdges((eds: Edge[]) =>
          addEdge(
            {
              ...params,
              id: `${source}:${sourceHandle} -> ${target}:${targetHandle}`,
              type: "CustomEdge",
              data: { sourceHandle, targetHandle },
            },
            eds,
          ),
        );
        setNodes(updatedNodes);
      });
      
      // Update both nodes' internals
      setTimeout(() => {
        updateNodeInternals(targetNode.id);
        updateNodeInternals(sourceNode.id);
      }, 200);
    },
    [nodes],
  );

  const onConnectStart: OnConnectStart = useCallback(
    (event, data) => {
      const sourceNode = nodes.find((node) => node.id === data.nodeId);
      if (!sourceNode) return;
      const isSource = data.handleType === "source";
      const isTarget = !isSource;

      // to exclude OtherNodeDataProps
      const typedSourceNode = sourceNode as Node<SystemComponentNodeDataProps>;

      const targets = componentTargets[typedSourceNode?.data.name];
      const sources = Object.entries(componentTargets).reduce(
        (acc, [key, value]) => {
          if (value.includes(typedSourceNode.data.name)) acc.push(key);
          return acc;
        },
        [] as string[],
      );

      // to exclude OtherNodeDataProps
      const newNodes = (nodes as Node<SystemComponentNodeDataProps>[]).map(
        (node) => ({
          ...node,
          data: {
            ...node.data,
            withTargetHandle: isSource && targets.includes(node.data.name),
            withSourceHandle: isTarget && sources.includes(node.data.name),
          },
        }),
      );
      setNodes(newNodes);
      setIsEdgeBeingConnected(true);
    },
    [nodes],
  );

  const onConnectEnd = useCallback(() => {
    const newNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        withTargetHandle: true,
        withSourceHandle: true,
      },
    }));
    setNodes(newNodes);
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

      const componentName: SystemComponent["name"] = event.dataTransfer.getData(
        "application/reactflow",
      ) as SystemComponent["name"];

      if (!componentName) return;

      const position = reactFlowInstance?.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const component = getSystemComponent(componentName);
      if (!component) return;

      const id = componentsNumberingStore.getState().getNextId(componentName);
      
      // Generate unique handle IDs using timestamp
      const timestamp = Date.now();
      const data: SystemComponentNodeDataProps = {
        name: componentName,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        icon: component.icon,
        withTargetHandle: true,
        withSourceHandle: true,
        id,
        configs: {},
        targetHandles: [{ id: `${id}-target-handle-${timestamp}`, isConnected: false }],
        sourceHandles: [{ id: `${id}-source-handle-${timestamp + 1}`, isConnected: false }],
      };

      const newNode: Node<SystemComponentNodeDataProps> = {
        id,
        type: SYSTEM_COMPONENT_NODE,
        position,
        data,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
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

  const onNodesChange: OnNodesChange = (changes: NodeChange[]) => {
    const isDeletingWhiteboard = changes.some(
      (change) => change.type === "remove" && change.id.includes("Whiteboard"),
    );

    if (isDeletingWhiteboard) {
      toast({
        title: "You cannot delete the System definitions",
      });
    }

    const changesWithKeptSystemDefs = changes.filter(
      (change) =>
        !(change.type === "remove" && change.id.includes("Whiteboard")),
    );
    const newNodes = applyNodeChanges(changesWithKeptSystemDefs, nodes);

    setNodes(newNodes);
  };

  const onEdgesChange: OnEdgesChange = (changes) => {
    let nodesToUpdateUI: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[] = [];
    const edgeDeletions = changes.filter((change) => change.type === "remove");
    
    if (edgeDeletions.length > 0) {
      // Update nodes to mark affected handles as not connected
      setNodes((currentNodes) => {
        const edgeId = edgeDeletions[0]?.id;
        if (!edgeId) return currentNodes;

        // Edge ID format is "sourceId:sourceHandleId -> targetId:targetHandleId"
        const [sourceWithHandle, targetWithHandle] = edgeId.split(" -> ");
        if (!sourceWithHandle || !targetWithHandle) return currentNodes;

        const [sourceId, sourceHandleId] = sourceWithHandle.split(":");
        const [targetId, targetHandleId] = targetWithHandle.split(":");
        if (!sourceId || !sourceHandleId || !targetId || !targetHandleId) return currentNodes;

        const sourceNode = currentNodes.find((node) => node.id === sourceId);
        const targetNode = currentNodes.find((node) => node.id === targetId);
        
        if (!sourceNode || !targetNode) return currentNodes;

        nodesToUpdateUI = [sourceNode, targetNode];

        // Remove the connected handles from both nodes
        const updatedSourceHandles = sourceNode.data.sourceHandles?.filter(
          (handle) => handle.id !== sourceHandleId,
        );

        const updatedTargetHandles = targetNode.data.targetHandles?.filter(
          (handle) => handle.id !== targetHandleId,
        );

        const updatedNodes = currentNodes.map((node) => {
          if (node.id === sourceId) {
            return {
              ...node,
              data: {
                ...node.data,
                sourceHandles: updatedSourceHandles,
              },
            };
          }
          if (node.id === targetId) {
            return {
              ...node,
              data: {
                ...node.data,
                targetHandles: updatedTargetHandles,
              },
            };
          }
          return node;
        });
        return updatedNodes;
      });
    }

    const newEdges = applyEdgeChanges(changes, edges);
    setEdges(newEdges);

    if (nodesToUpdateUI.length > 0) {
      setTimeout(() => {
        nodesToUpdateUI.forEach((node) => {
          updateNodeInternals(node.id);
        });
      }, 200);
    }
  };

  const onSave = useCallback(() => {
    if (typeof window === "undefined") return;

    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem("reactflow", JSON.stringify(flow));
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      if (typeof window === "undefined") return;

      // Reset the component numbering store
      componentsNumberingStore.getState().resetCounting();

      const flow: ReactFlowJsonObject = JSON.parse(
        localStorage.getItem("reactflow") ?? "{}",
      ) as ReactFlowJsonObject;

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow().catch(console.error);
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
          const updatedNodes = nodes.map((node) => {
            if (node.id === componentId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  configs: {
                    ...node.data.configs,
                    [configKey]: configValue,
                  },
                },
              };
            }
            return node;
          });
          updateNodes(updatedNodes);
        },
      ];
    },
    [nodes, updateNodes],
  );

  const updateEdgeLabel = useCallback((edgeId: string, label: string) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: {
              ...edge.data,
              label,
            },
          };
        }
        return edge;
      }),
    );
  }, []);

  const handleCopy = useCallback(() => {
    if (!reactFlowInstance) return;

    const selectedNodes = nodes.filter((node) =>
      reactFlowInstance.getNodes().find((n) => n.selected && n.id === node.id),
    );

    if (selectedNodes.length === 0) return;

    const selectedEdges = edges.filter((edge) => {
      const sourceNode = selectedNodes.find((node) => node.id === edge.source);
      const targetNode = selectedNodes.find((node) => node.id === edge.target);
      return sourceNode && targetNode;
    });

    setClipboardData({
      nodes: selectedNodes,
      edges: selectedEdges,
    });
  }, [nodes, edges, reactFlowInstance]);

  const handlePaste = useCallback(() => {
    if (!clipboardData || !reactFlowInstance) return;

    const { nodes: clipboardNodes, edges: clipboardEdges } = clipboardData;

    // Create a mapping of old IDs to new IDs
    const idMapping: Record<string, string> = {};

    // Create new nodes with a fixed offset from original positions
    const newNodes = clipboardNodes.map((node) => {
      const componentName = node.data.name as SystemComponent["name"];
      const newId = componentsNumberingStore
        .getState()
        .getNextId(componentName);
      idMapping[node.id] = newId;

      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 100,
          y: node.position.y + 100,
        },
        data: {
          ...node.data,
          id: newId,
        },
        selected: true,
      };
    });

    // Create new edges with updated source/target IDs
    const newEdges = clipboardEdges.map((edge) => ({
      ...edge,
      id: `${idMapping[edge.source]} -> ${idMapping[edge.target]}`,
      source: idMapping[edge.source] ?? "",
      target: idMapping[edge.target] ?? "",
      selected: true,
    })) as Edge[];

    // Deselect all existing nodes and edges, then add new ones
    setNodes((nds) => [
      ...nds.map((node) => ({ ...node, selected: false })),
      ...newNodes,
    ]);
    setEdges((eds) => [
      ...eds.map((edge) => ({ ...edge, selected: false })),
      ...newEdges,
    ]);
  }, [clipboardData, reactFlowInstance, setNodes, setEdges]);

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
        onSelectNode: setSelectedNode,
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
