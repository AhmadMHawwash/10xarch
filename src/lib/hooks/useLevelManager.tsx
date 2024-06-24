import { getSystemComponent } from "@/components/Gallery";
import { type SystemComponentNodeDataProps } from "@/components/SystemComponentNode";
import { api } from "@/trpc/react";
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
import { componentsNumberingStore } from "../levels/utils";
import { useSystemDesigner } from "./useSystemDesigner";

export const SYSTEM_COMPONENT_NODE = "SystemComponentNode";

const useLevelStore = create<{
  allLevels: Level[];
  toNextLevel: () => void;
  isInitialised: boolean;
  setIsInitialised: (isInitialised: boolean) => void;
  currentLevelIndex: number;
}>((set, get) => ({
  allLevels: levels.map((level) => {
    componentsNumberingStore.getState().resetCounting();
    return level();
  }),
  currentLevelIndex: 0,
  isInitialised: false,
  setIsInitialised: (isInitialised: boolean) => {
    set({ isInitialised });
  },
  toNextLevel: () => {
    set((state) => {
      const nextLevelIndex = get().currentLevelIndex + 1;
      componentsNumberingStore.getState().resetCounting();
      return {
        ...state,
        currentLevelIndex: nextLevelIndex,
        level: levels[nextLevelIndex]?.(),
      };
    });
  },
}));

export const useLevelManager = () => {
  const {
    toNextLevel,
    isInitialised,
    setIsInitialised,
    allLevels,
    currentLevelIndex,
  } = useLevelStore((state) => state);

  const currentLevel = allLevels[currentLevelIndex];
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
              configs: (component.configs as Record<string, unknown>) ?? {},
            },
            id,
            type: SYSTEM_COMPONENT_NODE,
            position: { x: 100 + index * 100, y: 100 },
          };
        }) ?? [];

    updateNodes(nodes);

    const edges: Edge[] =
      currentLevel?.preConnectedComponents.flatMap(({ id, targets }) => {
        return targets.map((targetId) => ({
          id: `${id} -> ${targetId}`,
          source: id,
          target: targetId,
          type: "CustomEdge",
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        }));
      }) ?? [];

    updateEdges(edges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel]);

  const { data, mutate } = api.ai.hello.useMutation();
  data && console.log(data);

  const checkSolution = async () => {
    const cleaned = cleanup({ nodes, edges });

    mutate({
      level: currentLevel!,
      solutionComponents: cleaned,
    });
  };

  const useSystemComponentConfigSlice = useCallback(
    <T,>(
      componentId: string,
      configKey: string,
    ): [T, (configValue: T) => void] => {
      const component = nodes.find((node) => node.id === componentId);

      return [
        (component?.data.configs?.[configKey] ?? undefined) as T,
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

  return {
    level: currentLevel,
    toNextLevel: () => {
      setIsInitialised(false);
      toNextLevel();
    },
    checkSolution,
    useSystemComponentConfigSlice,
  };
};

const cleanup = (
  flow: Omit<
    ReactFlowJsonObject<SystemComponentNodeDataProps, { name: string }>,
    "viewport"
  >,
) => {
  const findTargets = (sourceId: string) => {
    return flow.edges
      .filter((edge) => edge.source === sourceId)
      .map((edge) => edge.target);
  };

  const nodes = flow.nodes.map((node) => ({
    type: node.data.name,
    id: node.id,
    configs: node.data.configs,
    targets: findTargets(node.id),
  }));

  return nodes;
};
