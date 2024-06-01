import { getSystemComponent } from "@/components/Gallery";
import { type SystemComponentNodeDataProps } from "@/components/SystemComponentNode";
import { api } from "@/trpc/react";
import { useEffect, useRef, useState } from "react";
import {
  MarkerType,
  type Edge,
  type Node,
  type ReactFlowJsonObject,
} from "reactflow";
import levels from "../levels";
import { type Level } from "../levels/type";
import { extractIdAndType, useSystemDesigner } from "./useSystemDesigner";

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
            },
            id,
            type: SYSTEM_COMPONENT_NODE,
            position: { x: 100 + index * 100, y: 100 },
          };
        }) ?? [];
    initNodes(nodes);
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

    initEdges(edges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { data, mutate } = api.ai.hello.useMutation();
  setTimeout(() => {
    void navigator.clipboard.writeText(JSON.stringify(data));
  }, 1000);

  const checkSolution = async () => {
    const cleaned = cleanup({ nodes, edges });

    // await navigator.clipboard.writeText(
    //   JSON.stringify({
    //     level: currentLevel!,
    //     userSolution: { components: cleaned.nodes, connections: cleaned.edges },
    //   }),
    // );
    mutate({
      level: currentLevel!,
      userSolution: { components: cleaned.nodes, connections: cleaned.edges },
      tree: cleaned.edges,
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

// interface Node {
//   id: string;
//   type: string;
//   children: Node[];
// }

// interface Edge {
//   source: { id: string; type: string };
//   target: { id: string; type: string };
// }

// function buildTree(edges: Edge[]): Node[] {
//   const nodesMap = new Map<string, Node>();

//   // Create nodes
//   edges.forEach(({ source, target }) => {
//     if (!nodesMap.has(source.id)) {
//       nodesMap.set(source.id, {
//         id: source.id,
//         type: source.type,
//         children: [],
//       });
//     }
//     if (!nodesMap.has(target.id)) {
//       nodesMap.set(target.id, {
//         id: target.id,
//         type: target.type,
//         children: [],
//       });
//     }
//   });

//   // Build tree
//   edges.forEach(({ source, target }) => {
//     const sourceNode = nodesMap.get(source.id)!;
//     const targetNode = nodesMap.get(target.id)!;
//     sourceNode.children.push(targetNode);
//   });

//   // Find roots
//   const roots: Node[] = [];
//   nodesMap.forEach((node) => {
//     const isRoot = edges.every(({ target }) => target.id !== node.id);
//     if (isRoot) {
//       roots.push(node);
//     }
//   });

//   return roots;
// }
