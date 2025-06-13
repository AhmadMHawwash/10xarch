import { type Edge, type Node, type NodeChange, type Connection, type ReactFlowJsonObject, type EdgeChange, applyEdgeChanges, applyNodeChanges, addEdge, type ReactFlowInstance } from "reactflow";
import { type SystemComponent, type SystemComponentType } from "../levels/type";
import { getSystemComponent } from "@/components/Gallery";
import { type WhiteboardNodeDataProps, type SystemComponentNodeDataProps } from "@/components/ReactflowCustomNodes/SystemComponentNode";
import { componentsNumberingStore } from "../levels/utils";
import { SYSTEM_COMPONENT_NODE } from "./useChallengeManager";

// Define component targets
export const componentTargets: Record<
  SystemComponent["name"],
  SystemComponent["name"][]
> = {
  Client: ["Server", "Load Balancer", "CDN", "Message Queue", "Custom Component"],
  CDN: ["Load Balancer", "Server", "Custom Component"],
  "Load Balancer": ["Server", "Custom Component"],
  Server: ["Server", "Cache", "Database", "Message Queue", "Custom Component", "Load Balancer"],
  Cache: ["Database", "Custom Component"],
  Database: ["Custom Component"],
  "Message Queue": ["Server", "Custom Component"],
  "Custom Component": ["Client", "Server", "Load Balancer", "Cache", "CDN", "Database", "Message Queue", "Custom Component"],
};

// Default starting nodes
export const defaultStartingNodes: Node<
  SystemComponentNodeDataProps | WhiteboardNodeDataProps
>[] = [
  {
    id: "Whiteboard-1",
    type: "Whiteboard",
    data: {
      name: "Whiteboard",
      id: "Whiteboard-1",
      configs: {},
      targetHandles: [],
    },
    position: {
      x: 100,
      y: 100,
    },
  },
];

// Pure function to deserialize nodes
export const deserializeNodes = (nodes: string | null): Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[] => {
  if (nodes === null || nodes === undefined) return [];
  try {
    const parsedNodes = JSON.parse(nodes) as Node<
      SystemComponentNodeDataProps | WhiteboardNodeDataProps
    >[];

    // Instead of resetting, update the component numbering store to the highest number for each component
    const componentCounts: Record<SystemComponent["name"], number> = {
      Client: 1,
      Server: 1,
      Database: 1,
      "Load Balancer": 1,
      Cache: 1,
      CDN: 1,
      "Message Queue": 1,
      "Custom Component": 1,
    };

    // Calculate the highest number for each component type
    parsedNodes.forEach((node) => {
      if (node.data.name === "Whiteboard") return;
      
      const match = node.id.match(/^(.+)-(\d+)$/);
      if (match?.[1] && match[2]) {
        const componentName = match[1];
        const number = parseInt(match[2], 10);
        if (componentName in componentCounts && !isNaN(number)) {
          componentCounts[componentName as SystemComponent["name"]] = 
            Math.max(componentCounts[componentName as SystemComponent["name"]], number + 1);
        }
      }
    });

    // Update the component numbering store with the highest numbers
    componentsNumberingStore.setState({
      componentsToCount: componentCounts,
    });

    return parsedNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        name: node.data.name as SystemComponent["name"],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        icon: getSystemComponent(node.data.name as SystemComponentType)?.icon,
        targetHandles: node.data.targetHandles ?? [],
        sourceHandles: node.data.sourceHandles ?? [],
      },
    }));
  } catch (e) {
    console.error("Error deserializing nodes:", e);
    return [];
  }
};

// Pure function to handle node connection
export const handleConnect = (
  params: Connection,
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  edges: Edge[]
): {
  updatedNodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  updatedEdges: Edge[],
  nodesToUpdate: string[]
} => {
  const { source, target, targetHandle, sourceHandle } = params;
  const sourceNode = nodes.find((node) => node.id === source);
  const targetNode = nodes.find((node) => node.id === target);

  if (!sourceNode || !targetNode) {
    return { updatedNodes: nodes, updatedEdges: edges, nodesToUpdate: [] };
  }

  // Check if this is a self-connection (edge connecting a node to itself)
  const isSelfConnection = source === target;

  // to exclude OtherNodeDataProps
  const typedSourceNode = sourceNode as Node<SystemComponentNodeDataProps>;
  // to exclude OtherNodeDataProps
  const typedTargetNode = targetNode as Node<SystemComponentNodeDataProps>;

  const targets = componentTargets[typedSourceNode?.data.name];
  if (!targets.includes(typedTargetNode?.data.name)) {
    return { updatedNodes: nodes, updatedEdges: edges, nodesToUpdate: [] };
  }

  // Update both nodes' handles
  const updatedNodes = nodes.map((node) => {
    if (node.id === target) {
      // Update target node's targetHandles
      const updatedTargetHandles =
        node.data.targetHandles?.map((handle) => ({
          ...handle,
          isConnected: handle.isConnected || handle.id === targetHandle,
        })) ?? [];

      // Generate a unique handle ID
      const timestamp = Date.now();
      const newTargetHandle = {
        id: `${target}-target-handle-${timestamp}`,
        isConnected: false,
      };

      // If this is a self-connection, we need to update sourceHandles too
      if (isSelfConnection) {
        const updatedSourceHandles =
          node.data.sourceHandles?.map((handle) => ({
            ...handle,
            isConnected: handle.isConnected || handle.id === sourceHandle,
          })) ?? [];

        // Generate a unique handle ID for source
        const newSourceHandle = {
          id: `${source}-source-handle-${timestamp + 1}`,
          isConnected: false,
        };

        return {
          ...node,
          data: {
            ...node.data,
            targetHandles: [...updatedTargetHandles, newTargetHandle],
            sourceHandles: [...updatedSourceHandles, newSourceHandle],
          },
        };
      }

      return {
        ...node,
        data: {
          ...node.data,
          targetHandles: [...updatedTargetHandles, newTargetHandle],
        },
      };
    }
    
    if (node.id === source && !isSelfConnection) {
      // Update source node's sourceHandles (only if not a self-connection, which was handled above)
      const updatedSourceHandles =
        node.data.sourceHandles?.map((handle) => ({
          ...handle,
          isConnected: handle.isConnected || handle.id === sourceHandle,
        })) ?? [];

      // Generate a unique handle ID
      const timestamp = Date.now();
      const newSourceHandle = {
        id: `${source}-source-handle-${timestamp}`,
        isConnected: false,
      };

      return {
        ...node,
        data: {
          ...node.data,
          sourceHandles: [...updatedSourceHandles, newSourceHandle],
        },
      };
    }
    
    return node;
  });

  // Add the new edge
  const newEdge = {
    ...params,
    id: `${source}:${sourceHandle} -> ${target}:${targetHandle}`,
    type: "CustomEdge",
    data: { sourceHandle, targetHandle },
  };
  const updatedEdges = addEdge(newEdge, edges);

  // Return nodes that need UI updates
  return { 
    updatedNodes, 
    updatedEdges,
    nodesToUpdate: [sourceNode.id, targetNode.id]
  };
};

// Pure function to handle connection start
export const handleConnectStart = (
  nodeId: string | null,
  handleType: string | null,
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[]
): Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[] => {
  if (!nodeId) return nodes;
  
  const sourceNode = nodes.find((node) => node.id === nodeId);
  if (!sourceNode) return nodes;
  
  const isSource = handleType === "source";
  const isTarget = !isSource;

  // to exclude OtherNodeDataProps
  const typedSourceNode = sourceNode as Node<SystemComponentNodeDataProps>;

  const targets = componentTargets[typedSourceNode?.data.name];
  const sources = Object.entries(componentTargets).reduce(
    (acc, [key, value]) => {
      if (value.includes(typedSourceNode.data.name)) acc.push(key);
      return acc;
    },
    [] as string[],
  );

  // to exclude OtherNodeDataProps
  return (nodes as Node<SystemComponentNodeDataProps>[]).map(
    (node) => ({
      ...node,
      selected: false,
      data: {
        ...node.data,
        withTargetHandle: isSource && targets.includes(node.data.name),
        withSourceHandle: isTarget && sources.includes(node.data.name),
      },
    }),
  );
};

// Pure function to handle connection end
export const handleConnectEnd = (
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[]
): Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[] => {
  return nodes.map((node) => ({
    ...node,
    selected: false,
    data: {
      ...node.data,
      withTargetHandle: true,
      withSourceHandle: true,
    },
  }));
};

// Pure function to handle node dropping
export const handleNodeDrop = (
  componentName: string,
  position: { x: number, y: number },
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[]
): Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[] => {
  // Cast the string to SystemComponent["name"] since we know it's valid
  const typedComponentName = componentName as SystemComponent["name"];
  const component = getSystemComponent(typedComponentName);
  if (!component) return nodes;

  const id = componentsNumberingStore.getState().getNextId(typedComponentName);
  
  // Generate unique handle IDs using timestamp
  const timestamp = Date.now();
  const data: SystemComponentNodeDataProps = {
    name: typedComponentName,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    icon: component.icon,
    withTargetHandle: true,
    withSourceHandle: true,
    id,
    configs: typedComponentName === "Custom Component" 
      ? { "title": "Custom Component" } 
      : {},
    targetHandles: [{ id: `${id}-target-handle-${timestamp}`, isConnected: false }],
    sourceHandles: [{ id: `${id}-source-handle-${timestamp + 1}`, isConnected: false }],
  };

  const newNode: Node<SystemComponentNodeDataProps> = {
    id,
    type: SYSTEM_COMPONENT_NODE,
    position,
    data,
  };

  return [...nodes, newNode];
};

// Pure function to handle node changes
export const handleNodesChange = (
  changes: NodeChange[],
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  edges: Edge[],
  notifyWhiteboardDeletion: () => void
): {
  updatedNodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  updatedEdges: Edge[]
} => {
  const isDeletingWhiteboard = changes.some(
    (change) => change.type === "remove" && change.id.includes("Whiteboard"),
  );

  if (isDeletingWhiteboard) {
    notifyWhiteboardDeletion();
  }

  const changesWithKeptSystemDefs = changes.filter(
    (change) =>
      !(change.type === "remove" && change.id.includes("Whiteboard")),
  );
  
  // Find all node deletions
  const nodeDeletions = changesWithKeptSystemDefs.filter(
    (change) => change.type === "remove"
  );
  
  let updatedEdges = [...edges];
  let updatedNodes = [...nodes];
  
  // If nodes are being deleted, update connected nodes and edges
  if (nodeDeletions.length > 0) {
    const nodeIdsToDelete = new Set(
      nodeDeletions.map((change) => change.id)
    );
    
    // Find all edges connected to the deleted nodes
    const connectedEdges = edges.filter((edge) => 
      nodeIdsToDelete.has(edge.source) || nodeIdsToDelete.has(edge.target)
    );
    
    // Track nodes that need their handles updated
    const nodesToUpdate = new Map<string, { 
      targetHandlesToRemove: Set<string>, 
      sourceHandlesToRemove: Set<string> 
    }>();
    
    // For each connected edge, collect the handles that need to be updated
    connectedEdges.forEach(edge => {
      // Handle source node deletion
      if (nodeIdsToDelete.has(edge.source) && !nodeIdsToDelete.has(edge.target)) {
        // Target node stays but needs its targetHandle updated
        const targetId = edge.target;
        const targetHandleId = edge.targetHandle;
        
        if (!nodesToUpdate.has(targetId)) {
          nodesToUpdate.set(targetId, {
            targetHandlesToRemove: new Set(),
            sourceHandlesToRemove: new Set()
          });
        }
        
        if (targetHandleId) {
          nodesToUpdate.get(targetId)!.targetHandlesToRemove.add(targetHandleId);
        }
      }
      
      // Handle target node deletion
      if (nodeIdsToDelete.has(edge.target) && !nodeIdsToDelete.has(edge.source)) {
        // Source node stays but needs its sourceHandle updated
        const sourceId = edge.source;
        const sourceHandleId = edge.sourceHandle;
        
        if (!nodesToUpdate.has(sourceId)) {
          nodesToUpdate.set(sourceId, {
            targetHandlesToRemove: new Set(),
            sourceHandlesToRemove: new Set()
          });
        }
        
        if (sourceHandleId) {
          nodesToUpdate.get(sourceId)!.sourceHandlesToRemove.add(sourceHandleId);
        }
      }
    });
    
    // Update the nodes with the collected handles to remove
    updatedNodes = updatedNodes.map(node => {
      const nodeId = node.id;
      const updateInfo = nodesToUpdate.get(nodeId);
      
      if (!updateInfo) {
        return node;
      }
      
      // Update source handles
      let sourceHandles = node.data.sourceHandles ?? [];
      if (updateInfo.sourceHandlesToRemove.size > 0) {
        // Filter out handles that were connected to deleted nodes
        sourceHandles = sourceHandles.filter(
          handle => !updateInfo.sourceHandlesToRemove.has(handle.id)
        );
        
        // Ensure at least one source handle exists
        if (sourceHandles.length === 0) {
          const timestamp = Date.now();
          const randomId = Math.floor(Math.random() * 10000);
          sourceHandles.push({
            id: `${nodeId}-source-handle-${timestamp}-${randomId}`,
            isConnected: false
          });
        }
      }
      
      // Update target handles
      let targetHandles = node.data.targetHandles ?? [];
      if (updateInfo.targetHandlesToRemove.size > 0) {
        // Filter out handles that were connected to deleted nodes
        targetHandles = targetHandles.filter(
          handle => !updateInfo.targetHandlesToRemove.has(handle.id)
        );
        
        // Ensure at least one target handle exists
        if (targetHandles.length === 0) {
          const timestamp = Date.now();
          const randomId = Math.floor(Math.random() * 10000);
          targetHandles.push({
            id: `${nodeId}-target-handle-${timestamp}-${randomId}`,
            isConnected: false
          });
        }
      }
      
      return {
        ...node,
        data: {
          ...node.data,
          sourceHandles,
          targetHandles
        }
      };
    });
    
    // Filter out any edges connected to the deleted nodes
    updatedEdges = edges.filter((edge) => {
      return !nodeIdsToDelete.has(edge.source) && !nodeIdsToDelete.has(edge.target);
    });
  }
  
  // Apply the node changes
  updatedNodes = applyNodeChanges(changesWithKeptSystemDefs, updatedNodes);
  
  return {
    updatedNodes,
    updatedEdges
  };
};

// Pure function to handle edge changes
export const handleEdgesChange = (
  changes: EdgeChange[],
  edges: Edge[],
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[]
): {
  updatedNodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  updatedEdges: Edge[],
  nodesToUpdateUI: string[]
} => {
  let nodesToUpdateUI: string[] = [];
  let updatedNodes = [...nodes];
  const edgeDeletions = changes.filter((change) => change.type === "remove");
  
  if (edgeDeletions.length > 0) {
    // Track all nodes that need their internals updated
    const nodesToUpdate = new Set<string>();
    
    // Process all edge deletions
    for (const deletion of edgeDeletions) {
      const edgeId = deletion.id;
      if (!edgeId) continue;
      
      // Find the edge we're deleting to get source and target information
      const edgeToDelete = edges.find(e => e.id === edgeId);
      
      if (edgeToDelete) {
        // We found the edge directly, use its source and target info
        const sourceId = edgeToDelete.source;
        const targetId = edgeToDelete.target;
        const sourceHandleId = edgeToDelete.sourceHandle;
        const targetHandleId = edgeToDelete.targetHandle;
        
        // Add nodes to update set
        nodesToUpdate.add(sourceId);
        nodesToUpdate.add(targetId);
        
        // Update source and target nodes
        updatedNodes = updateNodeHandlesForEdgeDeletion(
          updatedNodes, 
          sourceId, 
          sourceHandleId, 
          targetId, 
          targetHandleId
        );
      } else {
        // Try the old parsing method for backward compatibility
        // Edge ID format is "sourceId:sourceHandleId -> targetId:targetHandleId"
        const [sourceWithHandle, targetWithHandle] = edgeId.split(" -> ");
        if (!sourceWithHandle || !targetWithHandle) continue;

        const [sourceId, sourceHandleId] = sourceWithHandle.split(":");
        const [targetId, targetHandleId] = targetWithHandle.split(":");
        if (!sourceId || !sourceHandleId || !targetId || !targetHandleId) continue;

        // Add nodes to update set
        nodesToUpdate.add(sourceId);
        nodesToUpdate.add(targetId);
        
        // Update source and target nodes
        updatedNodes = updateNodeHandlesForEdgeDeletion(
          updatedNodes, 
          sourceId, 
          sourceHandleId, 
          targetId, 
          targetHandleId
        );
      }
    }
    
    // Convert nodesToUpdate set to array
    nodesToUpdateUI = Array.from(nodesToUpdate);
  }

  const updatedEdges = applyEdgeChanges(changes, edges);
  
  return { 
    updatedNodes, 
    updatedEdges, 
    nodesToUpdateUI 
  };
};

// Helper function to update node handles when an edge is deleted
export const updateNodeHandlesForEdgeDeletion = (
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  sourceId: string,
  sourceHandleId: string | null | undefined,
  targetId: string,
  targetHandleId: string | null | undefined
) => {
  // Find the source and target nodes
  const sourceNodeIndex = nodes.findIndex((node) => node.id === sourceId);
  const targetNodeIndex = nodes.findIndex((node) => node.id === targetId);
  
  if (sourceNodeIndex === -1 || targetNodeIndex === -1) return nodes;
  
  // Update source node's source handles
  const sourceNode = nodes[sourceNodeIndex];
  if (!sourceNode || !sourceHandleId) return nodes;
  
  const sourceHandles = sourceNode.data.sourceHandles ?? [];
  
  // Only remove the handle if it's not the last one
  const updatedSourceHandles = sourceHandles.length > 1
    ? sourceHandles.filter(handle => handle.id !== sourceHandleId)
    : sourceHandles.map(handle => ({
        ...handle,
        isConnected: false // Set existing handle to disconnected if it's the last one
      }));
  
  // Always ensure at least one handle exists
  if (updatedSourceHandles.length === 0) {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);
    updatedSourceHandles.push({
      id: `${sourceId}-source-handle-${timestamp}-${randomId}`,
      isConnected: false
    });
  }
  
  const updatedNodes = [...nodes];
  
  updatedNodes[sourceNodeIndex] = {
    ...sourceNode,
    data: {
      ...sourceNode.data,
      sourceHandles: updatedSourceHandles,
    },
  };
  
  // Update target node's target handles
  const targetNode = updatedNodes[targetNodeIndex];
  if (!targetNode || !targetHandleId) return updatedNodes;
  
  const targetHandles = targetNode.data.targetHandles ?? [];
  
  // Only remove the handle if it's not the last one
  const updatedTargetHandles = targetHandles.length > 1
    ? targetHandles.filter(handle => handle.id !== targetHandleId)
    : targetHandles.map(handle => ({
        ...handle,
        isConnected: false // Set existing handle to disconnected if it's the last one
      }));
  
  // Always ensure at least one handle exists
  if (updatedTargetHandles.length === 0) {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);
    updatedTargetHandles.push({
      id: `${targetId}-target-handle-${timestamp}-${randomId}`,
      isConnected: false
    });
  }
  
  updatedNodes[targetNodeIndex] = {
    ...targetNode,
    data: {
      ...targetNode.data,
      targetHandles: updatedTargetHandles,
    },
  };
  
  return updatedNodes;
};

// Pure function to update edge label
export const updateEdgeLabel = (
  edges: Edge[],
  edgeId: string, 
  label: string, 
  data?: Record<string, unknown>
): Edge[] => {
  return edges.map((edge) => {
    if (edge.id === edgeId) {
      return {
        ...edge,
        data: {
          ...edge.data,
          ...data,
          label,
        },
      };
    }
    return edge;
  });
};

// Pure function to update component config
export const updateComponentConfig = <T,>(
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  componentId: string,
  configKey: string,
  configValue: T
): Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[] => {
  return nodes.map((node) => {
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
};

// Pure function to handle copy
export const handleCopy = (
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  edges: Edge[]
): {
  clipboardNodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  clipboardEdges: Edge[],
  hasWhiteboard: boolean
} => {
  const selectedNodes = nodes.filter((node) => node.selected);
  
  // Check if trying to copy a whiteboard node
  const isWhiteboardSelected = selectedNodes.some((node) => node.id.includes("Whiteboard"));
  
  const selectedEdges = edges.filter((edge) => {
    const sourceSelected = selectedNodes.some((node) => node.id === edge.source);
    const targetSelected = selectedNodes.some((node) => node.id === edge.target);
    return sourceSelected && targetSelected;
  });
  
  return {
    clipboardNodes: selectedNodes,
    clipboardEdges: selectedEdges,
    hasWhiteboard: isWhiteboardSelected
  };
};

// Pure function to handle paste
export const handlePaste = (
  clipboardData: {
    nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
    edges: Edge[]
  } | null,
  existingNodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  existingEdges: Edge[]
): { 
  newNodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  newEdges: Edge[] 
} => {
  if (!clipboardData) {
    return { 
      newNodes: existingNodes, 
      newEdges: existingEdges 
    };
  }

  const { nodes: clipboardNodes, edges: clipboardEdges } = clipboardData;

  // Create a mapping of old IDs to new IDs
  const idMapping: Record<string, string> = {};
  // Create a mapping for handle IDs
  const handleMapping: Record<string, string> = {};

  // Check if we're copying a single node or multiple nodes
  const isSingleNodeCopy = clipboardNodes.length === 1;

  // Get IDs of all nodes being copied for later validation
  const copiedNodeIds = new Set(clipboardNodes.map(node => node.id));

  // Create new nodes with a fixed offset from original positions
  const pastedNodes = clipboardNodes.map((node) => {
    const componentName = node.data.name as SystemComponent["name"];
    const newId = componentsNumberingStore
      .getState()
      .getNextId(componentName);
    idMapping[node.id] = newId;

    // Generate new timestamps for handles
    const timestamp = Date.now() + Math.floor(Math.random() * 1000);

    if (isSingleNodeCopy) {
      // For single node copy, create fresh handles without connections
      const newTargetHandleId = `${newId}-target-handle-${timestamp}`;
      const newSourceHandleId = `${newId}-source-handle-${timestamp + 1}`;
      
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 100,
          y: node.position.y + 100,
        },
        data: {
          ...node.data,
          id: newId,
          // Reset handles for single node copy
          targetHandles: [{ 
            id: newTargetHandleId, 
            isConnected: false 
          }],
          sourceHandles: [{ 
            id: newSourceHandleId, 
            isConnected: false 
          }],
        },
        selected: true,
      };
    } else {
      // For multiple nodes, we need to determine which handles should remain
      // First, check which edges involve this node and another node in the selection
      const nodeEdges = clipboardEdges.filter(edge => 
        (edge.source === node.id && copiedNodeIds.has(edge.target)) || 
        (edge.target === node.id && copiedNodeIds.has(edge.source))
      );
      
      // Create sets of handle IDs that should be kept (connected to other copied nodes)
      const sourceHandlesToKeep = new Set(
        nodeEdges
          .filter(edge => edge.source === node.id)
          .map(edge => edge.sourceHandle)
          .filter(Boolean) as string[]
      );
      
      const targetHandlesToKeep = new Set(
        nodeEdges
          .filter(edge => edge.target === node.id)
          .map(edge => edge.targetHandle)
          .filter(Boolean) as string[]
      );
      
      // Only keep handles that are connected to other copied nodes
      const connectedTargetHandles = node.data.targetHandles
        ?.filter(handle => targetHandlesToKeep.has(handle.id))
        ?.map(handle => {
          // Create a new handle ID and store the mapping
          const newHandleId = `${newId}-target-handle-${timestamp + Math.floor(Math.random() * 100)}`;
          handleMapping[handle.id] = newHandleId;
          
          return {
            id: newHandleId,
            isConnected: true // These are definitely connected since we filtered them
          };
        }) ?? [];
      
      const connectedSourceHandles = node.data.sourceHandles
        ?.filter(handle => sourceHandlesToKeep.has(handle.id))
        ?.map(handle => {
          // Create a new handle ID and store the mapping
          const newHandleId = `${newId}-source-handle-${timestamp + Math.floor(Math.random() * 100) + 1000}`;
          handleMapping[handle.id] = newHandleId;
          
          return {
            id: newHandleId,
            isConnected: true // These are definitely connected since we filtered them
          };
        }) ?? [];
      
      // Always add one unconnected handle of each type for future connections
      const newFreeTargetHandle = { 
        id: `${newId}-target-handle-${timestamp + 500}`, 
        isConnected: false 
      };
      
      const newFreeSourceHandle = { 
        id: `${newId}-source-handle-${timestamp + 1500}`, 
        isConnected: false 
      };

      // Combine the connected handles with the free handles
      const finalTargetHandles = [...connectedTargetHandles, newFreeTargetHandle];
      const finalSourceHandles = [...connectedSourceHandles, newFreeSourceHandle];

      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 100,
          y: node.position.y + 100,
        },
        data: {
          ...node.data,
          id: newId,
          targetHandles: finalTargetHandles,
          sourceHandles: finalSourceHandles,
        },
        selected: true,
      };
    }
  });

  // Only create new edges when copying multiple nodes and only for connections between copied nodes
  const pastedEdges = isSingleNodeCopy ? [] : clipboardEdges
    .filter(edge => copiedNodeIds.has(edge.source) && copiedNodeIds.has(edge.target))
    .map((edge) => {
      const newSource = idMapping[edge.source] ?? "";
      const newTarget = idMapping[edge.target] ?? "";
      // Map the source and target handles to their new IDs
      const newSourceHandle = handleMapping[edge.sourceHandle ?? ""] ?? "";
      const newTargetHandle = handleMapping[edge.targetHandle ?? ""] ?? "";
      
      // Only create edges when all references are valid
      if (newSource && newTarget && newSourceHandle && newTargetHandle) {
        return {
          ...edge,
          id: `${newSource}:${newSourceHandle} -> ${newTarget}:${newTargetHandle}`,
          source: newSource,
          target: newTarget,
          sourceHandle: newSourceHandle,
          targetHandle: newTargetHandle,
          selected: true,
        } as Edge;
      }
      return null;
    }).filter(Boolean) as Edge[];

  // Combine with existing nodes and edges (with all existing items deselected)
  const newNodes = [
    ...existingNodes.map((node) => ({ ...node, selected: false })),
    ...pastedNodes,
  ];
  
  const newEdges = [
    ...existingEdges.map((edge) => ({ ...edge, selected: false })),
    ...pastedEdges,
  ];

  return { newNodes, newEdges };
};

// Pure function to save flow
export const saveFlow = (
  reactFlowInstance: ReactFlowInstance | null
): void => {
  if (typeof window === "undefined" || !reactFlowInstance) return;

  const flow = reactFlowInstance.toObject();
  localStorage.setItem("reactflow", JSON.stringify(flow));
};

// Pure function to restore flow
export const restoreFlow = (): {
  nodes: Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[],
  edges: Edge[],
  viewport: { x: number, y: number, zoom: number }
} => {
  if (typeof window === "undefined") {
    return { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
  }

  // Reset the component numbering store
  componentsNumberingStore.getState().resetCounting();

  try {
    const flowData = localStorage.getItem("reactflow");
    if (!flowData) {
      return { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
    }

    const flow = JSON.parse(flowData) as ReactFlowJsonObject;

    if (!flow || typeof flow !== 'object') {
      return { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
    }

    const viewport = flow.viewport || { x: 0, y: 0, zoom: 1 };
    return {
      nodes: flow.nodes || [],
      edges: flow.edges || [],
      viewport
    };
  } catch (error) {
    console.error("Error restoring flow:", error);
    return { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
  }
}; 