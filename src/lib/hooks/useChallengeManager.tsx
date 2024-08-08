import { type SystemComponentNodeDataProps } from "@/components/SystemComponentNode";
import { type Challenge } from "@/content/challenges/types";
import { useCallback } from "react";
import { type ReactFlowJsonObject } from "reactflow";
import { create } from "zustand";
import { useSystemDesigner } from "./useSystemDesigner";
import { useParams, useRouter } from "next/navigation";
import challenges from "@/content/challenges";

export const SYSTEM_COMPONENT_NODE = "SystemComponentNode";

const useLevelStore = create<{
  setChallenge: (challenge: Challenge) => void;
  challenge?: Challenge;
  toNextStage: () => void;
  toPreviousStage: () => void;
  isInitialised: boolean;
  setIsInitialised: (isInitialised: boolean) => void;
  currentStageIndex: number;
}>((set, get) => ({
  challenge: undefined,
  setChallenge: (challenge: Challenge) => {
    set({ challenge });
  },
  currentStageIndex: 0,
  isInitialised: false,
  setIsInitialised: (isInitialised: boolean) => {
    set({ isInitialised });
  },
  toNextStage: () => {
    set((state) => {
      const nextStageIndex = get().currentStageIndex + 1;
      return {
        ...state,
        currentStageIndex: nextStageIndex,
      };
    });
  },
  toPreviousStage: () => {
    set((state) => {
      const previousStageIndex = get().currentStageIndex - 1;
      return {
        ...state,
        currentStageIndex: previousStageIndex,
      };
    });
  },
}));

export const useChallengeManager = () => {
  const { slug } = useParams();
  const challenge = challenges.find((challenge) => challenge.slug === slug);

  const { toNextStage, toPreviousStage, setChallenge, currentStageIndex } =
    useLevelStore((state) => state);

  const { updateNodes, updateEdges, nodes, edges } = useSystemDesigner();

  // useEffect(() => {
  //   if (isInitialised) return;

  //   setIsInitialised(true);

  //   const nodes: Node<SystemComponentNodeDataProps>[] =
  //     currentLevel?.preConnectedComponents
  //       .filter((x) => x.type)
  //       .map((component, index) => {
  //         const systemComponent = getSystemComponent(component.type);

  //         const id = component.id;
  //         return {
  //           data: {
  //             id,
  //             name: systemComponent?.name,
  //             // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //             icon: systemComponent?.icon,
  //             withTargetHandle: true,
  //             withSourceHandle: true,
  //             configs: (component.configs as Record<string, unknown>) ?? {},
  //           },
  //           id,
  //           type: SYSTEM_COMPONENT_NODE,
  //           position: { x: 100 + index * 100, y: 100 },
  //         };
  //       }) ?? [];

  //   updateNodes(nodes);

  //   const edges: Edge[] =
  //     currentLevel?.preConnectedComponents.flatMap(({ id, targets }) => {
  //       return targets.map((targetId) => ({
  //         id: `${id} -> ${targetId}`,
  //         source: id,
  //         target: targetId,
  //         type: "CustomEdge",
  //         animated: true,
  //         markerEnd: { type: MarkerType.ArrowClosed },
  //       }));
  //     }) ?? [];

  //   updateEdges(edges);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentLevel]);

  // const { data, mutate } = api.ai.hello.useMutation();
  // data && console.log(data);

  const checkSolution = async () => {
    const cleaned = cleanup({ nodes, edges });

    // mutate({
    //   level: currentLevel!,
    //   solutionComponents: cleaned,
    // });
  };

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

  return {
    challenge: challenge!,
    stage: challenge?.stages[currentStageIndex],
    toNextStage: () => {
      if (currentStageIndex < challenge!.stages.length - 1) {
        toNextStage();
      }
      return;
    },
    toPreviousStage: () => {
      if (currentStageIndex > 0) {
        toPreviousStage();
      }
      return;
    },
    checkSolution,
    useSystemComponentConfigSlice,
    currentStageIndex,
    setChallenge,
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
