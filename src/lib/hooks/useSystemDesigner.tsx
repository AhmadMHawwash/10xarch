import { getSystemComponent, type SystemComponent } from "@/components/Gallery";
import type { SystemComponentNodeDataProps } from "@/components/SystemComponentNode";
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
import { create } from "zustand";
import { SYSTEM_COMPONENT_NODE } from "./useLevelsManager";

interface SystemDesignerState {
  nodes: Node<SystemComponentNodeDataProps>[];
  edges: Edge[];
  initInstance: (instance: ReactFlowInstance) => void;
  initWrapper: (wrapper: HTMLDivElement) => void;
  initNodes: (nodes: Node[]) => void;
  initEdges: (edges: Edge[]) => void;
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
}

const SystemDesignerContext = createContext<SystemDesignerState>({
  nodes: [],
  edges: [],
  initEdges: noop,
  initNodes: noop,
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
});

export const nodesNumberingStore = create<{
  nodesCount: number;
  getNextNodeId: () => number;
  setNodesCount: (_x: number) => void;
}>((set, get) => ({
  nodesCount: 1,
  getNextNodeId: () => {
    const id = get().nodesCount;
    set((state) => ({ nodesCount: state.nodesCount + 1 }));
    return id;
  },
  setNodesCount: (count) => set({ nodesCount: count }),
}));

const componentTargets: Record<
  SystemComponent["name"],
  SystemComponent["name"][]
> = {
  Client: ["Server", "Load Balancer", "CDN"],
  CDN: ["Load Balancer", "Server"],
  "Load Balancer": ["Server"],
  Server: ["Cache", "SQL Database"],
  Cache: [],
  "SQL Database": [],
};

export const SystemDesignerProvider = ({ children }: PropsWithChildren) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node<SystemComponentNodeDataProps>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { setViewport } = useReactFlow();
  const [isEdgeBeingConnected, setIsEdgeBeingConnected] = useState(false);

  const toast = (_x: unknown) => null;
  // const toast = useToast();

  const onConnect: OnConnect = useCallback(
    (params) => {
      const { source, target } = params;
      const sourceNode = nodes.find((node) => node.id === source);
      const targetNode = nodes.find((node) => node.id === target);

      if (!sourceNode || !targetNode) return;

      const targets = componentTargets[sourceNode?.data.name];
      if (!targets.includes(targetNode?.data.name)) {
        // toast(
        //   warning({
        //     title: `You cannot connect ${sourceNode?.data.name} to ${targetNode?.data.name}`,
        //     position: "bottom",
        //   }),
        // );
        return;
      }

      return setEdges((eds: Edge[]) =>
        addEdge({ ...params, type: "CustomEdge" }, eds),
      );
    },
    [nodes, toast],
  );

  const onConnectStart: OnConnectStart = useCallback(
    (event, data) => {
      console.log(data);
      const sourceNode = nodes.find((node) => node.id === data.nodeId);
      if (!sourceNode) return;
      const isSource = data.handleType === "source";
      const isTarget = !isSource;

      const targets = componentTargets[sourceNode?.data.name];
      const sources = Object.entries(componentTargets).reduce(
        (acc, [key, value]) => {
          if (value.includes(sourceNode.data.name)) acc.push(key);
          return acc;
        },
        [] as string[],
      );

      const newNodes = nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          withTargetHandle: isSource && targets.includes(node.data.name),
          withSourceHandle: isTarget && sources.includes(node.data.name),
        },
      }));
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

      const nextNodeId = nodesNumberingStore.getState().getNextNodeId();
      const data: SystemComponentNodeDataProps = {
        name: componentName,
        icon: component.icon,
        withTargetHandle: true,
        withSourceHandle: true,
        id: nextNodeId,
      };

      const newNode: Node<SystemComponentNodeDataProps> = {
        id: nextNodeId.toString(),
        type: SYSTEM_COMPONENT_NODE,
        position,
        data,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );

  const initNodes = useCallback((nodes: Node[]) => {
    setNodes(nodes);
  }, []);

  const initEdges = useCallback((edges: Edge[]) => {
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
    const newNodes = applyNodeChanges(changes, nodes);

    setNodes(newNodes);
  };

  const onEdgesChange: OnEdgesChange = (changes) => {
    const newEdges = applyEdgeChanges(changes, edges);

    setEdges(newEdges);
  };

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem("reactflow", JSON.stringify(flow));
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
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

  return (
    <SystemDesignerContext.Provider
      value={{
        onConnect,
        onDragOver,
        onDrop,
        initInstance,
        initNodes,
        initEdges,
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
      }}
    >
      {children}
    </SystemDesignerContext.Provider>
  );
};

export const useSystemDesigner = () => {
  return useContext(SystemDesignerContext);
};
