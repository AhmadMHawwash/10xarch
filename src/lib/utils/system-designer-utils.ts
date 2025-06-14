import type { EdgeChange } from "reactflow";

/**
 * Checks if the current active element is a form input that should prevent keyboard shortcuts
 */
export function isActiveElementEditable(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;
  
  return (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement ||
    (activeElement instanceof HTMLElement && activeElement.contentEditable === 'true')
  );
}

/**
 * Handles keyboard events for the system designer
 * Returns the appropriate action to take based on the key combination
 */
export function handleSystemDesignerKeyDown(
  event: KeyboardEvent,
  selectedEdge: { id: string } | null
): {
  action: 'copy' | 'paste' | 'delete-edge' | 'none';
  edgeChange?: EdgeChange;
} {
  // Copy shortcut
  if ((event.ctrlKey || event.metaKey) && event.key === "c") {
    return { action: 'copy' };
  }
  
  // Paste shortcut
  if ((event.ctrlKey || event.metaKey) && event.key === "v") {
    return { action: 'paste' };
  }
  
  // Edge deletion with Delete or Backspace key
  if ((event.key === "Delete" || event.key === "Backspace") && selectedEdge) {
    // Don't delete the edge if the user is editing text in an input or textarea
    if (isActiveElementEditable()) {
      return { action: 'none' };
    }
    
    const edgeChange: EdgeChange = {
      id: selectedEdge.id,
      type: "remove",
    };
    
    return { 
      action: 'delete-edge',
      edgeChange 
    };
  }
  
  return { action: 'none' };
}

/**
 * Creates a notification handler for whiteboard deletion attempts
 */
export function createWhiteboardDeletionNotifier(
  toast: (options: { title: string }) => void
) {
  return () => {
    toast({
      title: "You cannot delete the System definitions",
    });
  };
}

/**
 * Processes nodes to update their internal state after edge changes
 */
export function updateNodesFromEdgeChanges<T extends { id: string; data: any }>(
  nodes: T[],
  updatedNodes: T[]
): T[] {
  return nodes.map(node => {
    const updatedNode = updatedNodes.find(n => n.id === node.id);
    return {
      ...node,
      data: {
        ...node.data,
        ...updatedNode?.data,
      }
    };
  });
}

/**
 * Schedules node internals updates for a list of node IDs
 */
export function scheduleNodeInternalsUpdate(
  nodeIds: string[],
  updateNodeInternals: (nodeId: string) => void,
  delay = 0
): void {
  if (nodeIds.length === 0) return;
  
  const updateFunction = () => {
    nodeIds.forEach(nodeId => {
      updateNodeInternals(nodeId);
    });
  };
  
  if (delay > 0) {
    setTimeout(updateFunction, delay);
  } else {
    queueMicrotask(updateFunction);
  }
}

/**
 * Finds nodes that need their internals updated after node deletions
 */
export function findNodesToUpdateAfterDeletion(
  deletedNodeIds: string[],
  edges: Array<{ source: string; target: string }>
): string[] {
  const nodesToUpdateSet = new Set<string>();
  
  edges.forEach(edge => {
    // If source was deleted, update target node
    if (deletedNodeIds.includes(edge.source) && !deletedNodeIds.includes(edge.target)) {
      nodesToUpdateSet.add(edge.target);
    }
    // If target was deleted, update source node
    if (deletedNodeIds.includes(edge.target) && !deletedNodeIds.includes(edge.source)) {
      nodesToUpdateSet.add(edge.source);
    }
  });
  
  return Array.from(nodesToUpdateSet);
} 