"use client";
import { getSystemComponent } from "@/components/Gallery";
import {
  type OtherNodeDataProps,
  type SystemComponentNodeDataProps,
} from "@/components/ReactflowCustomNodes/SystemComponentNode";
import { useToast } from "@/components/ui/use-toast";
import { noop } from "@/lib/utils";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type DragEventHandler,
  type PropsWithChildren,
} from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
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
import { type SystemComponentType, type SystemComponent } from "../levels/type";
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
  // toggleApiRequestFlowMode: () => void;
  // isApiRequestFlowMode: boolean;
  // selectedApiFlow?: string;
  // setSelectedApiFlow: (selectedApiFlow: string) => void;
}

const SystemDesignerContext = createContext<SystemDesignerState>({
  nodes: [],
  edges: [],
  updateEdges: noop,
  updateNodes: noop,
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
});

export const makeKey = (id: number, type: string) => `${type}-${id}`;
export const extractIdAndType = (
  key: string,
): {
  id: string;
  type: SystemComponent["name"];
} => {
  const [type, id] = key.split("-");
  return { id: id!, type: type as SystemComponent["name"] };
};

const componentTargets: Record<
  SystemComponent["name"],
  SystemComponent["name"][]
> = {
  Client: ["Server", "Server Cluster", "Load Balancer", "CDN"],
  CDN: ["Load Balancer", "Server", "Server Cluster"],
  "Load Balancer": ["Server", "Server Cluster"],
  Server: [
    "Cache",
    "Database",
    "Cache Cluster",
    "Database Cluster",
    "Message Queue",
  ],
  "Server Cluster": [
    "Cache",
    "Database",
    "Cache Cluster",
    "Database Cluster",
    "Message Queue",
  ],
  Cache: ["Database", "Database Cluster"],
  Database: [],
  "Message Queue": ["Server", "Server Cluster"],
  "Cache Cluster": ["Database Cluster", "Database"],
  "Database Cluster": [],
};

const deserializeNodes = (nodes: string | null) => {
  if (nodes === null) return [];
  const parsedNodes = JSON.parse(nodes) as Node<
    SystemComponentNodeDataProps | OtherNodeDataProps
  >[];
  return parsedNodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      name: node.data.name as SystemComponent["name"],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      icon: getSystemComponent(node.data.name as SystemComponentType)?.icon,
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
    },
    position: {
      x: 100,
      y: 100,
    },
  },
];

export const SystemDesignerProvider = ({ children }: PropsWithChildren) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useLocalStorageState<
    Node<SystemComponentNodeDataProps | OtherNodeDataProps>[]
  >("reactflow-nodes", defaultStartingNodes, deserializeNodes);
  const [edges, setEdges] = useLocalStorageState<Edge[]>("reactflow-edges", []);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { setViewport } = useReactFlow();
  const [isEdgeBeingConnected, setIsEdgeBeingConnected] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node<
    SystemComponentNodeDataProps | OtherNodeDataProps
  > | null>(null);
  const { toast } = useToast();

  const onConnect: OnConnect = useCallback(
    (params) => {
      const { source, target } = params;
      const sourceNode = nodes.find((node) => node.id === source);
      const targetNode = nodes.find((node) => node.id === target);

      if (!sourceNode || !targetNode) return;

      // to exclude OtherNodeDataProps
      const typedSourceNode = sourceNode as Node<SystemComponentNodeDataProps>;
      // to exclude OtherNodeDataProps
      const typedTargetNode = targetNode as Node<SystemComponentNodeDataProps>;

      const targets = componentTargets[typedSourceNode?.data.name];
      if (!targets.includes(typedTargetNode?.data.name)) {
        // toast(
        //   warning({
        //     title: `You cannot connect ${sourceNode?.data.name} to ${targetNode?.data.name}`,
        //     position: "bottom",
        //   }),
        // );
        return;
      }

      return setEdges((eds: Edge[]) =>
        addEdge(
          {
            ...params,
            id: `${sourceNode.id} -> ${targetNode.id}`,
            type: "CustomEdge",
            // animated: isApiRequestFlowMode,
          },
          eds,
        ),
      );
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
      const data: SystemComponentNodeDataProps = {
        name: componentName,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        icon: component.icon,
        withTargetHandle: true,
        withSourceHandle: true,
        id,
        configs: {},
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
    const newEdges = applyEdgeChanges(changes, edges);

    setEdges(newEdges);
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

  // abandoned feature
  // const toggleApiRequestFlowMode = useCallback(() => {
  //   const newEdges = edges.map((edge) => ({
  //     ...edge,
  //     animated: !isApiRequestFlowMode,
  //   }));

  //   setEdges(newEdges);
  //   setisApiRequestFlowMode((prev) => {
  //     const isRequestFlowMode = !prev;

  //     const systemComponents = nodes.filter(
  //       (node) => node.data.name !== "Whiteboard",
  //     );
  //     const whiteboard = nodes.find((node) => node.data.name === "Whiteboard")!;

  //     if (isRequestFlowMode) {
  //       const farthestY = systemComponents.reduce((acc, node) => {
  //         if (node.position.y + (node?.height ?? 0) > acc)
  //           return node.position.y + (node?.height ?? 0);
  //         return acc;
  //       }, 0);

  //       const farthestX = systemComponents.reduce((acc, node) => {
  //         if (node.position.x + (node.width ?? 0) > acc)
  //           return node.position.x + (node.width ?? 0);
  //         return acc;
  //       }, 0);

  //       const closestX = systemComponents.reduce((acc, node) => {
  //         if (node.position.x < acc) return node.position.x;
  //         return acc;
  //       }, systemComponents[0]?.position.x ?? 0);

  //       const closestY = systemComponents.reduce((acc, node) => {
  //         if (node.position.y < acc) return node.position.y;
  //         return acc;
  //       }, systemComponents[0]?.position.y ?? 0);

  //       const group: Node = {
  //         id: "api-request-flow-group",
  //         type: "group",
  //         data: {
  //           id: "api-request-flow-group",
  //           name: "API Request Flow",
  //           configs: {},
  //         },
  //         position: { x: closestX - 20, y: closestY - 20 },
  //         connectable: false,
  //         deletable: false,
  //         style: {
  //           backgroundColor: "rgba(255, 0, 0, 0.2)",
  //           width: farthestX - closestX + 40,
  //           height: farthestY - closestY + 40,
  //         },
  //       };

  //       const apisNode: Node = {
  //         id: "apis",
  //         data: {
  //           id: "apis",
  //         },
  //         position: { x: -132, y: 0 },
  //         parentId: "api-request-flow-group",
  //         type: "APIsNode",
  //         draggable: false,
  //       };

  //       const newNodes = systemComponents.map((node) => ({
  //         ...node,
  //         position: {
  //           x: node.position.x - group.position.x,
  //           y: node.position.y - group.position.y,
  //         },
  //         extent: "parent" as const,
  //         parentId: "api-request-flow-group",
  //         data: {
  //           ...node.data,
  //         },
  //       }));

  //       setNodes([group, apisNode, whiteboard, ...newNodes]);
  //     } else {
  //       const group = nodes.find(
  //         (node) => node.id === "api-request-flow-group",
  //       );
  //       const newNodes = systemComponents
  //         .filter(
  //           (node) =>
  //             node.id !== "api-request-flow-group" && node.id !== "apis",
  //         )
  //         .map((node) => ({
  //           ...node,
  //           position: !node.parentId
  //             ? node.position
  //             : {
  //                 x: node.position.x + (group?.position?.x ?? 0),
  //                 y: node.position.y + (group?.position?.y ?? 0),
  //               },
  //           parentId: undefined,
  //           data: {
  //             ...node.data,
  //           },
  //         }));
  //       setNodes([...newNodes, whiteboard]);
  //     }

  //     return isRequestFlowMode;
  //   });
  // }, [edges, isApiRequestFlowMode, nodes]);

  return (
    <SystemDesignerContext.Provider
      value={{
        onConnect,
        onDragOver,
        onDrop,
        initInstance,
        updateNodes,
        updateEdges,
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
        // toggleApiRequestFlowMode,
        // isApiRequestFlowMode,
        // selectedApiFlow,
        // setSelectedApiFlow: (v: string) => setSelectedApiFlow(v),
      }}
    >
      {children}
    </SystemDesignerContext.Provider>
  );
};

export const useSystemDesigner = () => {
  return useContext(SystemDesignerContext);
};
