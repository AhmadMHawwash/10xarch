// import { type SystemComponentNodeDataProps } from "@/components/ReactflowCustomNodes/APIsNode";
import { extractAPIDefinitions } from "@/components/ai-chat/ChatUI";
import {
  type WhiteboardNodeDataProps,
  type SystemComponentNodeDataProps,
} from "@/components/ReactflowCustomNodes/SystemComponentNode";
import { useToast } from "@/components/ui/use-toast";
import { type PlaygroundResponse } from "@/server/api/routers/checkAnswer";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { type Edge, type Node } from "reactflow";
import { useSystemDesigner } from "./_useSystemDesigner";

export const SYSTEM_COMPONENT_NODE = "SystemComponentNode";

export const usePlaygroundManager = () => {
  const { id: playgroundId } = useParams();
  const { nodes, edges } = useSystemDesigner();
  const { toast } = useToast();

  const {
    data: playgroundData,
    refetch: refetchPlayground,
    isLoading: isLoadingPlayground,
  } = api.playgrounds.getById.useQuery(playgroundId as string, {
    enabled: !!playgroundId,
  });

  // Get feedback from the playground data (backend) instead of local storage
  const feedback = playgroundData?.playground.evaluationFeedback 
    ? (JSON.parse(playgroundData.playground.evaluationFeedback) as PlaygroundResponse)
    : null;

  // Mutation to get AI feedback
  const { mutate, isPending, data } = api.ai.playground.useMutation({
    onError: (err) => {
      // Check if this is a rate limit error
      const isRateLimitError =
        err.data?.code === "TOO_MANY_REQUESTS" ||
        err.message.includes("rate limit") ||
        err.message.includes("evaluation limit");

      // Show error toast with a credits purchase suggestion for rate limit errors
      toast({
        title: isRateLimitError ? "Rate Limit Reached" : "Error",
        description: (
          <div className="space-y-2">
            <p>{err.message}</p>
            {isRateLimitError && (
              <p className="pt-1 text-sm">
                You can{" "}
                <a href="/credits" className="font-medium underline">
                  purchase credits
                </a>{" "}
                to continue using evaluations beyond the free limit.
              </p>
            )}
          </div>
        ),
        variant: "destructive",
      });
      console.error("Error checking solution:", err);
    },
    onSuccess: async () => {
      // Feedback is automatically saved by the AI endpoint
      // Just refetch to get the updated data
      void refetchPlayground();
    },
  });

  // Mutation to update playground data
  const { mutateAsync: updatePlayground, isPending: isUpdatingPlayground } =
    api.playgrounds.update.useMutation({
      onError: (err) => {
        console.error("Error saving feedback to database:", err);
      },
      onSuccess: () => {
        void refetchPlayground();
      },
    });

  const checkSolution = async (title?: string, description?: string) => {
    const whiteboard = nodes.find((node) => node.type === "Whiteboard");
    const prompt = getSystemDesignPrompt({
      nodes,
      edges,
    });

    if (whiteboard?.data?.configs) {
      const context = whiteboard.data.configs.context as string | undefined;

      mutate({
        systemDesign: prompt,
        systemDesignContext: context ?? "",
        title: title?.trim() ?? undefined,
        description: description?.trim() ?? undefined,
        playgroundId: playgroundId as string,
      });
    } else {
      toast({
        title: "Error",
        description: "Please create a whiteboard with system context first.",
        variant: "destructive",
      });
      console.error("Whiteboard node or its data is missing");
    }
  };


  const dbSavedNodes = (
    playgroundData?.playground.jsonBlob as {
      nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[];
    }
  )?.nodes;
  const dbSavedEdges = (
    playgroundData?.playground.jsonBlob as {
      edges: Edge[];
    }
  )?.edges;

  return {
    checkSolution,
    isLoadingAnswer: isPending,
    answer: feedback,
    playgroundId: playgroundId as string,
    updatePlayground,
    refetchPlayground,
    isLoadingPlayground,
    isUpdatingPlayground,
    playground: {
      ...playgroundData?.playground,
      nodes: dbSavedNodes,
      edges: dbSavedEdges,
    },
  };
};

const getSystemDesignPrompt = ({
  nodes,
  edges,
}: {
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[];
  edges: Edge<{
    label?: string;
    apiDefinition?: string;
    requestFlow?: string;
  }>[];
}): string => {
  const extractRequirements = (
    nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
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
      apiDefinitions: extractAPIDefinitions(edges),
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
    node: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>,
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
