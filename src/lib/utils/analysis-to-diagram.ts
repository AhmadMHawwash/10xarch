import type { AnalysisResults, AnalysisNode, AnalysisEdge } from "@/types/analysis";
import type { SystemComponentNodeDataProps } from "@/components/ReactflowCustomNodes/SystemComponentNode";
import type { CustomEdgeData } from "@/types/system";
import type { Node, Edge } from "reactflow";

// Valid SystemComponent names from the schema
type ValidSystemComponentName = 
  | "Client"
  | "Server"
  | "Load Balancer"
  | "Cache"
  | "CDN"
  | "Database"
  | "Message Queue"
  | "Custom Component";

// Mapping from analysis node names to valid SystemComponent types
const COMPONENT_TYPE_MAPPING: Record<string, ValidSystemComponentName> = {
  // Direct matches
  "client": "Client",
  "server": "Server", 
  "electron": "Server",
  "main_process": "Server",
  "renderer": "Client",
  "ipc": "Custom Component",
  "database": "Database",
  "cache": "Cache",
  "cdn": "CDN",
  "load_balancer": "Load Balancer",
  "loadbalancer": "Load Balancer",
  "message_queue": "Message Queue",
  "messagequeue": "Message Queue",
  "queue": "Message Queue",
  
  // Common variations
  "api": "Server",
  "backend": "Server",
  "frontend": "Client",
  "web_server": "Server",
  "webserver": "Server",
  "app_server": "Server",
  "application_server": "Server",
  "db": "Database",
  "redis": "Cache",
  "memcached": "Cache",
  "nginx": "Load Balancer",
  "haproxy": "Load Balancer",
  "cloudfront": "CDN",
  "rabbitmq": "Message Queue",
  "kafka": "Message Queue",
  "sqs": "Message Queue",
  "endpoint_group": "Custom Component",
  "external": "Custom Component",
  "framework": "Custom Component",
  "plugin": "Custom Component",
  
  // Generic fallbacks
  "service": "Server",
  "microservice": "Server",
  "component": "Custom Component",
};

/**
 * Maps an analysis node name to a valid SystemComponent type
 */
function mapToComponentType(nodeName: string): ValidSystemComponentName {
  const lowerName = nodeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  // Try exact match first
  if (COMPONENT_TYPE_MAPPING[lowerName]) {
    return COMPONENT_TYPE_MAPPING[lowerName];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(COMPONENT_TYPE_MAPPING)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return value;
    }
  }
  
  // Default fallback
  return "Custom Component";
}

/**
 * Generates smart positions for nodes in a 2D layout
 */
function generateNodePositions(nodes: AnalysisNode[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  
  if (nodes.length === 0) return positions;
  
  // Group nodes by likely architectural layers
  const layers = {
    client: [] as AnalysisNode[],
    loadBalancer: [] as AnalysisNode[],
    server: [] as AnalysisNode[],
    api: [] as AnalysisNode[],
    cache: [] as AnalysisNode[],
    database: [] as AnalysisNode[],
    external: [] as AnalysisNode[],
    framework: [] as AnalysisNode[],
  };
  
  // Categorize nodes into layers
  nodes.forEach(node => {
    const componentType = mapToComponentType(node.name);
    const lowerName = node.name.toLowerCase();
    
    if (componentType === "Client" || lowerName.includes("frontend") || lowerName.includes("ui")) {
      layers.client.push(node);
    } else if (componentType === "Load Balancer") {
      layers.loadBalancer.push(node);
    } else if (componentType === "Server" || (lowerName.includes("service") && !lowerName.includes("api"))) {
      layers.server.push(node);
    } else if (componentType === "Cache") {
      layers.cache.push(node);
    } else if (componentType === "Database" || lowerName.includes("storage")) {
      layers.database.push(node);
    } else if (lowerName.startsWith("api") || lowerName.includes("endpoint") || lowerName.includes("route")) {
      layers.api.push(node);
    } else if (lowerName.includes("external") || lowerName.includes("stripe") || lowerName.includes("sentry") || lowerName.includes("supabase")) {
      layers.external.push(node);
    } else if (lowerName.includes("framework")) {
      // De-emphasize framework nodes by moving them to external lane so they don't clutter core topology
      layers.external.push(node);
    } else {
      layers.external.push(node);
    }
  });
  
  const LAYER_SPACING = 300;
  const NODE_SPACING = 150;
  let currentY = 50;
  
  // Position each layer
  Object.entries(layers).forEach(([_, layerNodes]) => {
    if (layerNodes.length === 0) return;
    
    const layerWidth = Math.max(1, layerNodes.length) * NODE_SPACING;
    const startX = Math.max(50, (layerWidth < 800 ? (800 - layerWidth) / 2 : 50)); // Ensure positive X coordinates
    
    layerNodes.forEach((node, index) => {
      positions[node.name] = {
        x: startX + (index * NODE_SPACING),
        y: currentY
      };
    });
    
    currentY += LAYER_SPACING;
  });
  
  return positions;
}

/**
 * Converts analysis nodes to ReactFlow nodes
 */
export function convertNodesToReactFlow(nodes: AnalysisNode[]): Node<SystemComponentNodeDataProps>[] {
  const positions = generateNodePositions(nodes);
  
  return nodes.map((node, index) => {
    const componentType = mapToComponentType(node.name);
    const position = positions[node.name] ?? { x: (index % 4) * 220, y: Math.floor(index / 4) * 180 };
    
    // Use the original node.id for edge mapping (not node.name which is the component type)
    const nodeId = node.id.trim();
    
    return {
      id: nodeId, // Use original node.id for edge mapping
      type: "SystemComponentNode",
      position,
      data: {
        id: nodeId,
        name: componentType,
        displayName: node.displayName ?? node.title ?? node.name,
        subtitle: node.subtitle,
        title: node.title ?? node.displayName ?? node.name,
        withTargetHandle: true,
        withSourceHandle: true,
        configs: {
          title: node.displayName ?? node.title ?? node.name,
          subtitle: node.subtitle ?? `Confidence: ${Math.round(node.confidence * 100)}%`,
          confidence: node.confidence,
        },
        targetHandles: [{ id: `${nodeId}-target`, isConnected: false }],
        sourceHandles: [{ id: `${nodeId}-source`, isConnected: false }],
      },
    };
  });
}

/**
 * Use AI to intelligently map edge references to actual node IDs
 */
/**
 * Creates a deterministic node ID from component name and type
 */
function generateDeterministicNodeId(name: string, componentType: ValidSystemComponentName): string {
  // Normalize the name by removing special characters and converting to lowercase
  const normalizedName = name.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Create a consistent mapping based on component type
  const typePrefix = componentType.toLowerCase().replace(/\s+/g, '-');
  
  // If name is already descriptive, use it. Otherwise, use the component type
  if (normalizedName && normalizedName !== typePrefix) {
    return `${typePrefix}-${normalizedName}`;
  }
  
  return typePrefix;
}



/**
 * Converts analysis edges to ReactFlow edges
 */
export async function convertEdgesToReactFlow(edges: AnalysisEdge[], validNodeIds: Set<string>, nodes: Node<SystemComponentNodeDataProps>[]): Promise<Edge<CustomEdgeData>[]> {
  console.log('🔄 Converting edges with deterministic validation...');
  const totalEdges = edges.length;
  
  // Filter edges to only include those with valid node references
  const tryResolve = (id: string): string | null => {
    const trimmed = id.trim();
    if (validNodeIds.has(trimmed)) return trimmed;
    // attempt to match by displayName/title
    const byDisplay = nodes.find(n => (
      (n.data.displayName && n.data.displayName.toLowerCase() === trimmed.toLowerCase()) ??
      (n.data.title && n.data.title.toLowerCase() === trimmed.toLowerCase())
    ));
    if (byDisplay) return byDisplay.id;
    return null;
  };

  const validEdges = edges.map(edge => {
    const resolvedSource = tryResolve(edge.source) ?? edge.source.trim();
    const resolvedTarget = tryResolve(edge.target) ?? edge.target.trim();
    return { ...edge, source: resolvedSource, target: resolvedTarget };
  }).filter(edge => {
    const normalizedSource = edge.source.trim();
    const normalizedTarget = edge.target.trim();
    const sourceExists = validNodeIds.has(normalizedSource);
    const targetExists = validNodeIds.has(normalizedTarget);
    
    if (!sourceExists || !targetExists) {
      console.error(`❌ CRITICAL: Cannot resolve edge ${edge.source} -> ${edge.target}`);
      console.error(`   Source "${edge.source}" exists: ${sourceExists}`);
      console.error(`   Target "${edge.target}" exists: ${targetExists}`);
      console.error(`   Available node IDs:`, Array.from(validNodeIds));
      console.error(`   AI MUST generate consistent node references!`);
      return false;
    }
    
    return true;
  });

  const droppedEdges = totalEdges - validEdges.length;
  if (droppedEdges > 0) {
    console.warn(`⚠️ Edge coverage: kept ${validEdges.length}/${totalEdges} (${Math.round((validEdges.length/Math.max(1,totalEdges))*100)}%), dropped ${droppedEdges}`);
  }
  
  const convertedEdges = validEdges.map((edge, index) => ({
    id: `edge-${edge.source}-${edge.target}-${index}`,
    source: edge.source, // Maps to ReactFlow node ID
    target: edge.target, // Maps to ReactFlow node ID
    type: "CustomEdge",
    data: {
      label: edge.data?.label ?? `${edge.source} → ${edge.target}`,
      apiDefinition: edge.data?.apiDefinition,
    },
  }));
  
  return convertedEdges;
}

/**
 * Converts full analysis results to ReactFlow format
 */
export async function convertAnalysisToReactFlow(results: AnalysisResults): Promise<{
  nodes: Node<SystemComponentNodeDataProps>[];
  edges: Edge<CustomEdgeData>[];
  componentMapping: Record<string, ValidSystemComponentName>;
}> {
  const nodes = results.nodes ? convertNodesToReactFlow(results.nodes) : [];
  
  // Get valid node IDs for edge validation
  const validNodeIds = new Set(nodes.map(node => node.id));
  
  const edges = results.edges ? await convertEdgesToReactFlow(results.edges, validNodeIds, nodes) : [];

  // Orphan node telemetry: nodes with zero incident edges
  try {
    const incident = new Map<string, number>();
    for (const n of nodes) incident.set(n.id, 0);
    for (const e of edges) {
      incident.set(e.source, (incident.get(e.source) ?? 0) + 1);
      incident.set(e.target, (incident.get(e.target) ?? 0) + 1);
    }
    const orphanNodes = Array.from(incident.entries()).filter(([, c]) => c === 0).map(([id]) => id);
    if (orphanNodes.length > 0) {
      console.warn(`⚠️ Orphan nodes with no edges: ${orphanNodes.length}`, orphanNodes);
    }
  } catch (e) {
    console.warn('Failed to compute orphan nodes', e);
  }
  
  // Create mapping for reference
  const componentMapping: Record<string, ValidSystemComponentName> = {};
  if (results.nodes) {
    results.nodes.forEach(node => {
      componentMapping[node.name] = mapToComponentType(node.name);
    });
  }
  
  return { nodes, edges, componentMapping };
}

/**
 * Export the mapping for external use
 */
export { COMPONENT_TYPE_MAPPING };

/**
 * Export valid component names for reference
 */
export const VALID_COMPONENT_NAMES: ValidSystemComponentName[] = [
  "Client",
  "Server", 
  "Load Balancer",
  "Cache",
  "CDN",
  "Database",
  "Message Queue",
  "Custom Component"
]; 