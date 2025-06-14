import type { Node, Edge } from "reactflow";
import type { SystemComponentNodeDataProps, WhiteboardNodeDataProps } from "@/components/ReactflowCustomNodes/SystemComponentNode";

// Types for extracted functions
export interface PlaygroundState {
  title: string;
  description: string;
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[];
  edges: Edge[];
}

export interface ImportantDetails {
  title: string;
  description: string;
  nodes: Array<{
    id: string;
    type: string | undefined;
    position: { x: number; y: number };
    data: {
      name: string;
      title?: unknown;
      subtitle?: unknown;
    };
          width?: number | null;
      height?: number | null;
    selected: boolean;
    dragging: boolean;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
  }>;
}

/**
 * Extracts important details from playground state for comparison
 * Normalizes state by excluding volatile properties like selection and dragging states
 */
export function getImportantDetails(state: PlaygroundState): ImportantDetails {
  return {
    title: state.title,
    description: state.description,
    nodes: state.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        name: node.data.name,
        title: node.data.title,
        subtitle: node.data.subtitle,
        // Add other relevant data properties here for comparison
      },
      // Include other node properties if they are critical for divergence detection
      width: node.width,
      height: node.height,
      selected: false, // Always false to ignore selection state for divergence
      dragging: false, // Always false to ignore dragging state for divergence
    })),
    edges: state.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      // Add other relevant edge properties here for comparison
    })),
  };
}

/**
 * Deep compare objects - handles nested objects and arrays
 * Returns true if objects are structurally equal, false otherwise
 */
export function deepCompare(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepCompare(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => {
    const obj1Value = obj1 as Record<string, unknown>;
    const obj2Value = obj2 as Record<string, unknown>;
    return (
      Object.prototype.hasOwnProperty.call(obj2Value, key) &&
      deepCompare(obj1Value[key], obj2Value[key])
    );
  });
}

/**
 * Checks if the current playground state has changes compared to the last saved state
 */
export function hasPlaygroundChanges(
  currentState: PlaygroundState,
  lastSavedState: PlaygroundState | null
): boolean {
  if (!lastSavedState) return false;

  const currentDetails = getImportantDetails(currentState);
  const savedDetails = getImportantDetails(lastSavedState);

  return !deepCompare(currentDetails, savedDetails);
} 