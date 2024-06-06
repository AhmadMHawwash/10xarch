import { getSystemComponent } from "@/components/Gallery";
import { type SystemComponentNodeDataProps } from "@/components/SystemComponentNode";
import { useCallback, useEffect } from "react";
import {
  MarkerType,
  type Edge,
  type Node,
  type ReactFlowJsonObject,
} from "reactflow";
import { create } from "zustand";
import levels from "../levels";
import { type Level } from "../levels/type";
import { extractIdAndType, useSystemDesigner } from "./useSystemDesigner";
import { api } from "@/trpc/react";

export const SYSTEM_COMPONENT_NODE = "SystemComponentNode";

const useLevelStore = create<{
  level: Level | undefined;
  toNextLevel: () => void;
  isInitialised: boolean;
  setIsInitialised: (isInitialised: boolean) => void;
}>((set) => ({
  level: levels[0],
  toNextLevel: () => {
    set((state) => {
      const nextLevelIndex =
        levels.findIndex((level) => level.id === state.level?.id) + 1;
      return {
        ...state,
        level: levels[nextLevelIndex],
      };
    });
  },
  isInitialised: false,
  setIsInitialised: (isInitialised: boolean) => {
    set({ isInitialised });
  },
}));

export const useLevelManager = () => {
  const {
    level: currentLevel,
    toNextLevel,
    isInitialised,
    setIsInitialised,
  } = useLevelStore((state) => state);

  const { updateNodes, updateEdges, nodes, edges } = useSystemDesigner();

  useEffect(() => {
    if (isInitialised) return;

    setIsInitialised(true);

    const nodes: Node<SystemComponentNodeDataProps>[] =
      currentLevel?.preConnectedComponents
        .filter((x) => x.type)
        .map((component, index) => {
          const systemComponent = getSystemComponent(component.type);

          const id = component.id;
          return {
            data: {
              id,
              name: systemComponent?.name,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              icon: systemComponent?.icon,
              withTargetHandle: true,
              withSourceHandle: true,
              configs: component.configs ?? {},
            },
            id,
            type: SYSTEM_COMPONENT_NODE,
            position: { x: 100 + index * 100, y: 100 },
          };
        }) ?? [];

    updateNodes(nodes);

    const edges: Edge[] =
      currentLevel?.preConnectedConnections.map(({ source, target }) => {
        return {
          id: `${source.id} -> ${target.id}`,
          source: source.id,
          target: target.id,
          type: "CustomEdge",
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        };
      }) ?? [];

    updateEdges(edges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel]);

  const { data, mutate } = api.ai.hello.useMutation();
  console.log(data);

  setTimeout(() => {
    // void navigator.clipboard.writeText(JSON.stringify(data));
  }, 1000);

  const checkSolution = async () => {
    const cleaned = cleanup({ nodes, edges });

    mutate({
      level: currentLevel!,
      userSolution: {
        components: cleaned.nodes,
        connections: cleaned.edges,
      },
    });
  };

  const makeComponentConfigSlice = useCallback(
    <T,>(componentId: string, configKey: string) => {
      return {
        get: () => {
          const component = nodes.find((node) => node.id === componentId);
          return (component?.data.configs?.[configKey] ?? undefined) as T;
        },
        set: (configValue: T) => {
          const updatedNodes = nodes.map((node) => {
            if (node.id === componentId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  configs: {
                    [configKey]: configValue,
                  },
                },
              };
            }
            return node;
          });
          updateNodes(updatedNodes);
        },
      };
    },
    [nodes, updateNodes],
  );

  return {
    level: currentLevel,
    toNextLevel: () => {
      setIsInitialised(false);
      toNextLevel();
    },
    checkSolution,
    makeComponentConfigSlice,
  };
};

const cleanup = (
  flow: Omit<
    ReactFlowJsonObject<SystemComponentNodeDataProps, { name: string }>,
    "viewport"
  >,
) => {
  const nodes = flow.nodes.map((node) => ({
    type: node.data.name,
    id: node.id,
    configs: node.data.configs,
  }));

  const edges = flow.edges.map((edge) => {
    const { type: targetType } = extractIdAndType(edge.target);
    const { type: sourceType } = extractIdAndType(edge.source);
    return {
      source: {
        id: edge.source,
        type: sourceType,
      },
      target: { id: edge.target, type: targetType },
    };
  });

  return { nodes, edges };
};
