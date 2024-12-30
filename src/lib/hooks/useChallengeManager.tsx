import {
  type OtherNodeDataProps,
  type SystemComponentNodeDataProps,
} from "@/components/ReactflowCustomNodes/SystemComponentNode";
import challenges from "@/content/challenges";
import { type Challenge } from "@/content/challenges/types";
import {
  type EvaluationResponse,
  type PlaygroundResponse,
} from "@/server/api/routers/checkAnswer";
import { api } from "@/trpc/react";
import { useParams, usePathname } from "next/navigation";
import { useEffect } from "react";
import { type Edge, type Node } from "reactflow";
import { create } from "zustand";
import useLocalStorageState from "./useLocalStorageState";
import { useSystemDesigner } from "./useSystemDesigner";
import { useQueryClient } from "@tanstack/react-query";

export const SYSTEM_COMPONENT_NODE = "SystemComponentNode";

const useStageStore = create<{
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
  const params = useParams<{ slug: string }>();
  const pathname = usePathname();
  const challenge = challenges.find(
    (challenge) => challenge.slug === params?.slug,
  );
  const { toNextStage, toPreviousStage, setChallenge, currentStageIndex } =
    useStageStore((state) => state);
  const currentStage = challenge?.stages[currentStageIndex];
  const [feedbacks, setFeedbacks] = useLocalStorageState<
    (PlaygroundResponse | EvaluationResponse)[]
  >(`${pathname}-feedbacks`, [], (value) =>
    value
      ? (JSON.parse(value) as (PlaygroundResponse | EvaluationResponse)[])
      : [],
  );
  const { nodes, edges } = useSystemDesigner();
  const queryClient = useQueryClient();
  
  const { mutate, data, isPending } = api.ai.hello.useMutation({
    async onSuccess() {
      await queryClient.refetchQueries({
        queryKey: [["credits", "getBalance"], { type: "query" }],
      });
    },
  });

  const checkSolution = async () => {
    const promptBuilder = getChallengePrompt({
      nodes,
      edges,
    });
    const prompt = promptBuilder(challenge!, currentStage!);

    mutate({
      challengeAndSolutionPrompt: prompt,
      criteria: currentStage?.criteria ?? [],
    });
  };

  useEffect(() => {
    if (data) {
      const newFeedbacks = [...feedbacks];
      newFeedbacks[currentStageIndex] = data;
      setFeedbacks(newFeedbacks);
    }
  }, [data]);

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
    currentStageIndex,
    setChallenge,
    isLoadingAnswer: isPending,
    feedback: feedbacks[currentStageIndex],
  };
};

export const getChallengePrompt = ({
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

    console.log(configs);
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
        details: node.data.configs["Database details"],
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
        description: `${challenge?.description}. \nAnd this challenge has a set of stages ${challenge?.stages.length} to be exact, each stage depend on the previous one, and the user tackles them one by one.`,
      },
      "Current stage of the challenge": {
        problem: currentStage?.problem ?? "",
        requirements: currentStage?.metaRequirements ?? [],
        // hintsPerArea: currentStage?.hintsPerArea ?? {},
      },
      solution: {
        components: cleanedNodes,
        "API definitions": whiteboardData?.apiDefinitions ?? [],
        "Traffic capacity estimation ":
          whiteboardData?.capacityEstimations?.Traffic ?? "",
        "Storage capacity estimation":
          whiteboardData?.capacityEstimations?.Storage ?? "",
        "Bandwidth capacity estimation":
          whiteboardData?.capacityEstimations?.Bandwidth ?? "",
        "Memory capacity estimation":
          whiteboardData?.capacityEstimations?.Memory ?? "",
        "Functional requirments": whiteboardData?.functionalRequirements ?? "",
        "Non functional requirments":
          whiteboardData?.nonFunctionalRequirements ?? "",
      },
    };

    return JSON.stringify(prompt, null, 2);
  };

  return buildLLMPrompt;
};
