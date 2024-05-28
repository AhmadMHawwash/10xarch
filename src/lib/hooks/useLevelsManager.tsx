import { getSystemComponent } from "@/components/Gallery";
import { type SystemComponentNodeDataProps } from "@/components/SystemComponentNode";
import { useEffect, useRef, useState } from "react";
import {
  MarkerType,
  type Edge,
  type Node,
  type ReactFlowJsonObject,
} from "reactflow";
import levels from "../levels";
import { type Level } from "../levels/type";
import {
  extractIdAndType,
  makeKey,
  nodesNumberingStore,
  useSystemDesigner,
} from "./useSystemDesigner";
import { api } from "@/trpc/react";

export const SYSTEM_COMPONENT_NODE = "SystemComponentNode";
export const useLevelsManager = () => {
  const [currentLevel, setCurrentLevel] = useState<Level | undefined>(
    levels[0],
  );
  const isInitializedLevel = useRef<boolean>(false);
  const { initNodes, initEdges, nodes, edges } = useSystemDesigner();

  useEffect(() => {
    if (isInitializedLevel.current) return;

    isInitializedLevel.current = true;

    const nodes: Node<SystemComponentNodeDataProps>[] =
      currentLevel?.preConnectedComponents.map((component, index) => {
        const systemComponent = getSystemComponent(component.type)!;

        return {
          data: {
            id: component.id,
            name: systemComponent?.name,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            icon: systemComponent?.icon,
            withTargetHandle: true,
            withSourceHandle: true,
          },
          id: makeKey(
            nodesNumberingStore.getState().getNextNodeId(),
            systemComponent?.name,
          ),
          type: SYSTEM_COMPONENT_NODE,
          position: { x: 100 + index * 100, y: 100 },
        };
      }) ?? [];
    initNodes(nodes);
    const edges: Edge[] =
      currentLevel?.preConnectedConnections.map(({ source, target }) => {
        const x = source.id;
        const y = target.id;
        return {
          id: `${x} -to- ${y}`,
          source: x,
          target: y,
          type: "CustomEdge",
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        };
      }) ?? [];

    initEdges(edges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { data, mutate } = api.ai.hello.useMutation();
  console.log(data?.content)

  const checkSolution = async () => {
    const cleaned = cleanup({ nodes, edges });

    mutate({
      level: currentLevel!,
      userSolution: { components: cleaned.nodes, connections: cleaned.edges },
    });
  };

  return {
    level: currentLevel,
    toNextLevel: () => setCurrentLevel(levels[1]),
    checkSolution,
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
  }));

  const edges = flow.edges.map((edge) => {
    const { id: targetId, type: targetType } = extractIdAndType(edge.target);
    const { id: sourceId, type: sourceType } = extractIdAndType(edge.source);
    return {
      source: {
        id: sourceId,
        type: sourceType,
      },
      target: { id: targetId, type: targetType },
    };
  });

  return { nodes, edges };
};
