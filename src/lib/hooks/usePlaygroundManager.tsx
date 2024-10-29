// import { type SystemComponentNodeDataProps } from "@/components/ReactflowCustomNodes/APIsNode";
import {
  type OtherNodeDataProps,
  type SystemComponentNodeDataProps,
} from "@/components/ReactflowCustomNodes/SystemComponentNode";
import { type PlaygroundResponse } from "@/server/api/routers/checkAnswer";
import { api } from "@/trpc/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { type Edge, type Node } from "reactflow";
import { useSystemDesigner } from "./useSystemDesigner";
import useLocalStorageState from "./useLocalStorageState";

export const SYSTEM_COMPONENT_NODE = "SystemComponentNode";

export const usePlaygroundManager = () => {
  const pathname = usePathname();
  const { nodes, edges } = useSystemDesigner();
  const [feedback, setFeedback] =
    useLocalStorageState<PlaygroundResponse | undefined>(
      `playground-${pathname}-feedback`,
      undefined,
    );

  const { mutate, data, isPending } = api.ai.playground.useMutation();

  const checkSolution = async () => {
    const whiteboard = nodes.find((node) => node.type === "Whiteboard");
    const prompt = getSystemDesignPrompt({
      nodes,
      edges,
    });

    console.log(whiteboard?.data.configs.context, prompt);

    mutate({
      systemDesign: prompt,
      systemDesignContext: whiteboard?.data.configs.context as string,
    });
  };

  useEffect(() => {
    if (data) {
      setFeedback(data);
    }
  }, [data, setFeedback]);

  return {
    checkSolution,
    isLoadingAnswer: isPending,
    answer: feedback,
  };
};

const getSystemDesignPrompt = ({
  nodes,
  edges,
}: {
  nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[];
  edges: Edge[];
}): string => {
  const extractRequirements = (
    nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[],
  ) => {
    const whiteboard = nodes.find((node) => node.type === "Whiteboard");
    if (!whiteboard || !("configs" in whiteboard.data)) return null;

    const configs = whiteboard.data.configs;

    return {
      systemContext: configs.context as string,
      systemName: configs.displayName as string,
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

  const whiteboardData = extractRequirements(nodes);

  const prompt = {
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
