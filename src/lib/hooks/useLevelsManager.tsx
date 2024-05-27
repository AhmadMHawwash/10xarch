import { getSystemComponent, type SystemComponent } from "@/components/Gallery";
import { useEffect, useRef, useState } from "react";
import { MarkerType, type Edge, type Node } from "reactflow";
import levels from "../levels";
import { type Level } from "../levels/type";
import { nodesNumberingStore, useDrawManager } from "./useDrawManager";

export const SYSTEM_COMPONENT_NODE = "SystemComponentNode";
export const useLevelsManager = () => {
  const [currentLevel, setCurrentLevel] = useState<Level | undefined>(
    levels[0],
  );
  const isInitializedLevel = useRef<boolean>(false);
  const { initNodes, initEdges } = useDrawManager();

  useEffect(() => {
    if (isInitializedLevel.current) return;

    isInitializedLevel.current = true;

    const nodes: Node<{
      name: SystemComponent["name"];
      icon: unknown;
      id: number;
      withTargetHandle: boolean;
    }>[] =
      currentLevel?.preConnectedComponents.map((component, index) => {
        const systemComponent = getSystemComponent(component.type)!;

        return {
          data: {
            id: component.id,
            name: systemComponent?.name,
            icon: systemComponent?.icon,
            withTargetHandle: true,
          },
          id: `${systemComponent?.name}_${nodesNumberingStore.getState().getNextNodeId()}`,
          type: SYSTEM_COMPONENT_NODE,
          position: { x: 100 + index * 100, y: 100 },
        };
      }) ?? [];
    initNodes(nodes);
    const edges: Edge[] =
      currentLevel?.preConnectedConnections.map(({ source, target }) => {
        const x = `${source.type}_${source.id}`;
        const y = `${target.type}_${target.id}`;
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

  return {
    level: currentLevel,
    toNextLevel: () => setCurrentLevel(levels[1]),
  };
};
