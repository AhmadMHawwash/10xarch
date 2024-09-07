import {
  type SystemComponentNodeDataProps,
  type OtherNodeDataProps,
} from "@/components/ReactflowCustomNodes/SystemComponentNode";
import challenges from "@/content/challenges";
import { type Challenge } from "@/content/challenges/types";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { type Edge, type Node } from "reactflow";
import { create } from "zustand";
import { useSystemDesigner } from "./useSystemDesigner";

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
  const currentLevel = challenge?.stages[currentStageIndex];

  const { updateNodes, nodes, edges } = useSystemDesigner();

  const { mutate, data, isPending } = api.ai.hello.useMutation();

  const checkSolution = async () => {
    const promptBuilder = getLLMPromptBuilder({
      nodes,
      edges,
    });
    const prompt = promptBuilder(challenge!, currentLevel!);

    mutate({
      challengeAndSolutionPrompt: prompt,
      criteria: currentLevel?.criteria ?? [],
    });
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
    isLoadingAnswer: isPending,
    answer: data,
  };
};

const getLLMPromptBuilder = ({
  nodes,
  edges,
}: {
  nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[];
  edges: Edge[];
}): ((
  challenge: Challenge,
  currentStage: Challenge["stages"][number],
) => string) => {
  const extractRequirements = (
    nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[],
  ) => {
    const whiteboard = nodes.find((node) => node.type === "Whiteboard");
    if (!whiteboard || !("configs" in whiteboard.data)) return null;

    const configs = whiteboard.data.configs;

    return {
      functionalRequirements: configs["functional requirements"] as string,
      nonFunctionalRequirements: configs[
        "non-functional requirements"
      ] as string,
      apiDefinitions: (
        configs["API definitions and flows"] as Array<{
          name: string;
          definition: string;
          flow: string;
        }>
      )?.map((api) => ({
        name: api.name,
        definition: api.definition,
        flow: api.flow,
      })),
      capacityEstimations: configs["Capacity estimations"] as Record<
        string,
        string
      >,
    };
  };

  const findTargets = (sourceId: string) => {
    return edges
      .filter((edge) => edge.source === sourceId)
      .map((edge) => edge.target);
  };

  const extractNodeConfigs = (
    node: Node<SystemComponentNodeDataProps | OtherNodeDataProps>,
  ) => {
    if (node.data.name === "Database" && "configs" in node.data) {
      return {
        schema: (
          node.data.configs["Database models"] as [string, string][]
        )?.map(([name, definition]) => ({
          name,
          definition,
        })),
        purpose: node.data.configs["Database purpose"],
      };
    }
    return node.data.configs;
  };

  const cleanedNodes = nodes
    .filter((node) => node.type !== "Whiteboard")
    .map((node) => ({
      type: node.data.name,
      id: node.id,
      configs: extractNodeConfigs(node),
      "and it targets these nodes": findTargets(node.id),
    }));

  const buildLLMPrompt = (
    challenge: Challenge,
    currentStage: Challenge["stages"][number],
  ) => {
    const whiteboardData = extractRequirements(nodes);

    const prompt = {
      challenge: {
        title: challenge?.title ?? "",
        description: `${challenge?.description}. \nAnd this challenge has a set of levels ${challenge?.stages.length} to be exact, each level depend on the previous one, and the user tackles them one by one.`,
      },
      "Current level of the challenge": {
        problem: currentStage?.problem ?? "",
        assumptions: currentStage?.assumptions ?? [],
        hintsPerArea: currentStage?.hintsPerArea ?? {},
      },
      solution: {
        components: cleanedNodes,
        "API definitions": whiteboardData?.apiDefinitions ?? [],
        "Traffic capacity estimation ":
          whiteboardData?.capacityEstimations?.traffic ?? "",
        "Storage capacity estimation":
          whiteboardData?.capacityEstimations?.storage ?? "",
        "Bandwidth capacity estimation":
          whiteboardData?.capacityEstimations?.bandwidth ?? "",
        "Memory capacity estimation":
          whiteboardData?.capacityEstimations?.memory ?? "",
        "Functional requirments": whiteboardData?.functionalRequirements ?? "",
        "Non functional requirments":
          whiteboardData?.nonFunctionalRequirements ?? "",
      },
    };

    return JSON.stringify(prompt, null, 2);
  };

  return buildLLMPrompt;
};
