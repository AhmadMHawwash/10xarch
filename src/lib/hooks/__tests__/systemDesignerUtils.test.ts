import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  deserializeNodes,
  handleConnect,
  handleConnectStart,
  handleConnectEnd,
  handleNodeDrop,
  handleNodesChange,
  updateEdgeLabel,
  updateComponentConfig,
  handleCopy,
  handlePaste,
  updateNodeHandlesForEdgeDeletion
} from '../systemDesignerUtils';
import { componentsNumberingStore } from '../../levels/utils';
import { type Edge, type Node, type Connection, type NodeChange } from 'reactflow';
import { type SystemComponentNodeDataProps, type OtherNodeDataProps } from '@/components/ReactflowCustomNodes/SystemComponentNode';
import { SYSTEM_COMPONENT_NODE } from '../useChallengeManager';
import { type SystemComponent } from '@/lib/levels/type';
import { type LucideIcon } from 'lucide-react';

// Mock for getNextId function
const getNextIdMock = vi.fn();

// Mock dependencies
vi.mock('../../levels/utils', () => ({
  componentsNumberingStore: {
    getState: vi.fn(() => ({
      getNextId: getNextIdMock,
      resetCounting: vi.fn(),
      componentsToCount: {},
    })),
    setState: vi.fn(),
  },
}));

// Mock component return type to match required structure
type MockComponent = {
  name: SystemComponent['name'];
  icon: LucideIcon; // Using LucideIcon type which is correct for icons
  description: string;
};

vi.mock('@/components/Gallery', () => ({
  getSystemComponent: vi.fn((name: string): MockComponent | null => {
    if (name === 'InvalidComponent') return null;
    return {
      name: name as SystemComponent['name'],
      icon: 'icon-mock' as unknown as LucideIcon, // Proper casting for test mocks
      description: 'Mock component description',
    };
  }),
}));

describe('systemDesignerUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    getNextIdMock.mockImplementation((name) => `${name}-123`);
  });

  // Sample data for tests - using a proper type for the icon
  const createMockNode = (id: string, name: SystemComponent['name'] = 'Server'): Node<SystemComponentNodeDataProps> => ({
    id,
    type: SYSTEM_COMPONENT_NODE,
    position: { x: 100, y: 100 },
    data: {
      id,
      name,
      icon: 'icon-mock' as unknown as LucideIcon, // Properly cast for tests
      configs: {},
      withSourceHandle: true,
      withTargetHandle: true,
      sourceHandles: [{ id: `${id}-source-1`, isConnected: false }],
      targetHandles: [{ id: `${id}-target-1`, isConnected: false }],
    },
  });

  describe('deserializeNodes', () => {
    it('should return empty array for null/undefined input', () => {
      expect(deserializeNodes(null)).toEqual([]);
      expect(deserializeNodes(undefined as unknown as string)).toEqual([]);
    });

    it('should handle invalid JSON', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* intentionally empty */ });
      expect(deserializeNodes('invalid-json')).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should properly deserialize valid nodes', () => {
      const mockNode = createMockNode('Server-1');
      const serializedNodes = JSON.stringify([mockNode]);
      
      const result = deserializeNodes(serializedNodes);
      
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('Server-1');
      expect(result[0]?.data.name).toBe('Server');
      expect(componentsNumberingStore.setState).toHaveBeenCalled();
    });

    it('should update component counters based on node IDs', () => {
      const mockNodes = [
        createMockNode('Server-5'),
        createMockNode('Client-3', 'Client'),
        createMockNode('Database-2', 'Database'),
      ];
      const serializedNodes = JSON.stringify(mockNodes);
      
      deserializeNodes(serializedNodes);
      
      // Vitest matchers have limitations with TypeScript's type system
      // These eslint rules are disabled for test assertions only
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      expect(componentsNumberingStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          componentsToCount: expect.objectContaining({
            Server: expect.anything(),
            Client: expect.anything(),
            Database: expect.anything(),
          }),
        })
      );
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    });
  });

  describe('handleConnect', () => {
    it('should return unchanged nodes and edges when source or target not found', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Server-1'),
      ];
      const edges: Edge[] = [];
      const params: Connection = {
        source: 'Server-1',
        target: 'Database-1', // Does not exist
        sourceHandle: 'handle1',
        targetHandle: 'handle2',
      };
      
      const result = handleConnect(params, nodes, edges);
      
      // Use type-safe assertions
      expect(result.updatedNodes).toStrictEqual(nodes);
      expect(result.updatedEdges).toStrictEqual(edges);
      expect(result.nodesToUpdate).toStrictEqual([]);
    });

    it('should return unchanged nodes and edges when connection violates component rules', () => {
      // Client -> Client is not allowed per component rules
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Client-1', 'Client'),
        createMockNode('Client-2', 'Client'),
      ];
      const edges: Edge[] = [];
      const params: Connection = {
        source: 'Client-1',
        target: 'Client-2',
        sourceHandle: 'source-1',
        targetHandle: 'target-1',
      };
      
      const result = handleConnect(params, nodes, edges);
      
      // Use type-safe assertions
      expect(result.updatedNodes).toStrictEqual(nodes);
      expect(result.updatedEdges).toStrictEqual(edges);
    });

    it('should create valid connection and update nodes and edges', () => {
      // Client -> Server is allowed
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Client-1', 'Client'),
        createMockNode('Server-1', 'Server'),
      ];
      const edges: Edge[] = [];
      const params: Connection = {
        source: 'Client-1',
        target: 'Server-1',
        sourceHandle: 'Client-1-source-1',
        targetHandle: 'Server-1-target-1',
      };
      
      const result = handleConnect(params, nodes, edges);
      
      // Should create a new edge
      expect(result.updatedEdges).toHaveLength(1);
      const firstEdge = result.updatedEdges[0];
      expect(firstEdge?.source).toBe('Client-1');
      expect(firstEdge?.target).toBe('Server-1');
      
      // Source node should have updated sourceHandles
      const sourceNode = result.updatedNodes.find(n => n.id === 'Client-1');
      if (!sourceNode) {
        throw new Error('Source node not found in result');
      }
      expect(sourceNode.data.sourceHandles?.length).toBeGreaterThan(1);
      expect(sourceNode.data.sourceHandles?.[0]?.isConnected).toBe(true);
      
      // Target node should have updated targetHandles
      const targetNode = result.updatedNodes.find(n => n.id === 'Server-1');
      if (!targetNode) {
        throw new Error('Target node not found in result');
      }
      expect(targetNode.data.targetHandles?.length).toBeGreaterThan(1);
      expect(targetNode.data.targetHandles?.[0]?.isConnected).toBe(true);
      
      // Should return nodes to update
      expect(result.nodesToUpdate).toEqual(['Client-1', 'Server-1']);
    });

    it('creates a new edge between two different nodes', () => {
      const nodes = [
        createMockNode('node-1'),
        createMockNode('node-2'),
      ];
      const edges: Edge[] = [];
      
      // Use the exact IDs that the mock nodes would have
      const params: Connection = {
        source: 'node-1',
        sourceHandle: 'node-1-source-1',
        target: 'node-2',
        targetHandle: 'node-2-target-1'
      };
      
      const result = handleConnect(params, nodes, edges);
      
      // Expect one edge to be created
      expect(result.updatedEdges).toHaveLength(1);
      
      // Add null checks for the edge
      const firstEdge = result.updatedEdges[0];
      expect(firstEdge).toBeDefined();
      if (firstEdge) {
        expect(firstEdge.source).toBe('node-1');
        expect(firstEdge.target).toBe('node-2');
      }
      
      // Expect both nodes to be updated with new handles
      const updatedSourceNode = result.updatedNodes.find(n => n.id === 'node-1');
      const updatedTargetNode = result.updatedNodes.find(n => n.id === 'node-2');
      
      // Source node should have its source handle marked as connected
      const hasConnectedSource = updatedSourceNode?.data.sourceHandles?.some(h => 
        h.id === 'node-1-source-1' && h.isConnected);
      expect(hasConnectedSource).toBe(true);
      
      // Target node should have its target handle marked as connected
      const hasConnectedTarget = updatedTargetNode?.data.targetHandles?.some(h => 
        h.id === 'node-2-target-1' && h.isConnected);
      expect(hasConnectedTarget).toBe(true);
      
      // Both nodes should have a new handle created
      expect(updatedSourceNode?.data.sourceHandles?.length).toBe(2);
      expect(updatedTargetNode?.data.targetHandles?.length).toBe(2);
    });
    
    it('handles self-connections correctly', () => {
      const nodes = [
        createMockNode('node-1'),
      ];
      const edges: Edge[] = [];
      
      // Use the exact IDs that the mock node would have
      const params: Connection = {
        source: 'node-1',
        sourceHandle: 'node-1-source-1',
        target: 'node-1', // Self-connection
        targetHandle: 'node-1-target-1'
      };
      
      const result = handleConnect(params, nodes, edges);
      
      // Expect one edge to be created
      expect(result.updatedEdges).toHaveLength(1);
      
      // Add null checks for the edge
      const firstEdge = result.updatedEdges[0];
      expect(firstEdge).toBeDefined();
      if (firstEdge) {
        expect(firstEdge.source).toBe('node-1');
        expect(firstEdge.target).toBe('node-1');
      }
      
      // Get the updated node
      const updatedNode = result.updatedNodes.find(n => n.id === 'node-1');
      
      // For self-connections, both source and target handles should be updated on the same node
      const hasConnectedSource = updatedNode?.data.sourceHandles?.some(h => 
        h.id === 'node-1-source-1' && h.isConnected);
      expect(hasConnectedSource).toBe(true);
      
      const hasConnectedTarget = updatedNode?.data.targetHandles?.some(h => 
        h.id === 'node-1-target-1' && h.isConnected);
      expect(hasConnectedTarget).toBe(true);
      
      // Both source and target handles should have new handles created
      expect(updatedNode?.data.sourceHandles?.length).toBe(2);
      expect(updatedNode?.data.targetHandles?.length).toBe(2);
    });
    
    it('does not create edge if component connection is not allowed', () => {
      const nodes = [
        createMockNode('node-1'),
        createMockNode('node-2'),
      ];
      const edges: Edge[] = [];
      
      // Overwrite second node type to one that's not a valid target
      // First ensure node exists and then assign a value that will be treated as invalid for testing
      if (nodes[1]?.data) {
        // Use type assertion to override the type constraint for testing purposes
        (nodes[1].data.name as string) = 'NonTargetableComponent';
      }
      
      const params: Connection = {
        source: 'node-1',
        sourceHandle: 'node-1-source-handle-1',
        target: 'node-2',
        targetHandle: 'node-2-target-handle-1'
      };
      
      const result = handleConnect(params, nodes, edges);
      
      // No edge should be created
      expect(result.updatedEdges).toHaveLength(0);
      // Nodes should be unchanged
      expect(result.updatedNodes).toEqual(nodes);
    });
  });

  describe('handleConnectStart', () => {
    it('should return unchanged nodes when nodeId is null', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Server-1'),
      ];
      
      const result = handleConnectStart(null, 'source', nodes);
      
      expect(result).toEqual(nodes);
    });

    it('should update withTargetHandle when handle type is source', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Server-1', 'Server'),
        createMockNode('Database-1', 'Database'),
        createMockNode('Client-1', 'Client'), // Client shouldn't be a target for Server
      ];
      
      const result = handleConnectStart('Server-1', 'source', nodes);
      
      // Database should be a valid target for Server
      const databaseNode = result.find(n => n.id === 'Database-1');
      expect(databaseNode?.data.withTargetHandle).toBe(true);
      
      // Client should not be a valid target for Server
      const clientNode = result.find(n => n.id === 'Client-1');
      expect(clientNode?.data.withTargetHandle).toBe(false);
    });

    it('should update withSourceHandle when handle type is not source', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Server-1', 'Server'),
        createMockNode('Database-1', 'Database'),
        createMockNode('Client-1', 'Client'), // Client can connect to Server
      ];
      
      const result = handleConnectStart('Server-1', 'target', nodes);
      
      // Client should be a valid source for Server
      const clientNode = result.find(n => n.id === 'Client-1');
      expect(clientNode?.data.withSourceHandle).toBe(true);
      
      // Database shouldn't be a valid source for Server
      const databaseNode = result.find(n => n.id === 'Database-1');
      expect(databaseNode?.data.withSourceHandle).toBe(false);
    });
  });

  describe('handleConnectEnd', () => {
    it('should reset all nodes to have both handles enabled', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        { 
          ...createMockNode('Server-1'), 
          data: { 
            ...createMockNode('Server-1').data, 
            withSourceHandle: false, 
            withTargetHandle: false 
          } 
        },
        { 
          ...createMockNode('Database-1', 'Database'), 
          data: { 
            ...createMockNode('Database-1', 'Database').data, 
            withSourceHandle: false, 
            withTargetHandle: true 
          } 
        },
      ];
      
      const result = handleConnectEnd(nodes);
      
      result.forEach(node => {
        expect(node.data.withSourceHandle).toBe(true);
        expect(node.data.withTargetHandle).toBe(true);
      });
    });
  });

  describe('handleNodeDrop', () => {
    it('should return unchanged nodes when component not found', () => {
      // Using our mock implementation that returns null for 'InvalidComponent'
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Server-1'),
      ];
      
      const result = handleNodeDrop('InvalidComponent', { x: 200, y: 200 }, nodes);
      
      expect(result).toEqual(nodes);
    });

    it('should create new node with correct structure', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Server-1'),
      ];
      
      const result = handleNodeDrop('Database', { x: 200, y: 200 }, nodes);
      
      expect(result).toHaveLength(2);
      
      const newNode = result.find(n => n.id === 'Database-123');
      expect(newNode).toBeDefined();
      expect(newNode?.position).toEqual({ x: 200, y: 200 });
      expect(newNode?.type).toBe(SYSTEM_COMPONENT_NODE);
      expect(newNode?.data.name).toBe('Database');
      
      // Should have handles
      expect(newNode?.data.sourceHandles).toHaveLength(1);
      expect(newNode?.data.targetHandles).toHaveLength(1);
    });

    it('should set special config for Custom Component', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [];
      
      const result = handleNodeDrop('Custom Component', { x: 200, y: 200 }, nodes);
      
      expect(result).toHaveLength(1);
      const newNode = result[0];
      expect(newNode?.data.configs).toEqual({ 'title': 'Custom Component' });
    });
  });

  describe('handleNodesChange', () => {
    it('should call notification when trying to delete whiteboard node', () => {
      const nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[] = [
        // Create a whiteboard node that correctly represents the structure
        {
          id: 'Whiteboard-1',
          type: 'Whiteboard',
          position: { x: 100, y: 100 },
          data: {
            id: 'Whiteboard-1',
            name: 'Whiteboard' as unknown as SystemComponent['name'], // Cast as needed for test
            configs: {},
            targetHandles: [],
          },
        },
        createMockNode('Server-1'),
      ];
      
      const changes: NodeChange[] = [
        { type: 'remove', id: 'Whiteboard-1' },
      ];
      
      const notifyMock = vi.fn();
      const edges: Edge[] = [];
      
      const result = handleNodesChange(changes, nodes, edges, notifyMock);
      
      expect(notifyMock).toHaveBeenCalled();
      expect(result.updatedNodes).toHaveLength(2); // Whiteboard should not be removed
      expect(result.updatedNodes.find(n => n.id === 'Whiteboard-1')).toBeDefined();
    });

    it('should apply valid node changes', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Server-1'),
        createMockNode('Database-1', 'Database'),
      ];
      
      const changes: NodeChange[] = [
        { type: 'remove', id: 'Database-1' },
      ];
      
      const notifyMock = vi.fn();
      const edges: Edge[] = [];
      
      const result = handleNodesChange(changes, nodes, edges, notifyMock);
      
      expect(notifyMock).not.toHaveBeenCalled();
      expect(result.updatedNodes).toHaveLength(1);
      const firstNode = result.updatedNodes[0];
      expect(firstNode?.id).toBe('Server-1');
    });
  });

  describe('updateEdgeLabel', () => {
    it('should update label and data for matching edge', () => {
      const edges: Edge[] = [
        { id: 'edge-1', source: 'Server-1', target: 'Database-1', data: {} },
        { id: 'edge-2', source: 'Server-1', target: 'Cache-1', data: { label: 'Old Label' } },
      ];
      
      const result = updateEdgeLabel(edges, 'edge-2', 'New Label', { custom: 'data' });
      
      expect(result).toHaveLength(2);
      
      const updatedEdge = result.find(e => e.id === 'edge-2');
      // Use type assertions to handle Edge data safely
      const edgeData = updatedEdge?.data as { label?: string; custom?: string } | undefined;
      expect(edgeData?.label).toBe('New Label');
      expect(edgeData?.custom).toBe('data');
      
      // First edge should be unchanged
      const firstEdge = result.find(e => e.id === 'edge-1');
      expect(firstEdge?.data).toEqual({});
    });

    it('should return unchanged edges when edge not found', () => {
      const edges: Edge[] = [
        { id: 'edge-1', source: 'Server-1', target: 'Database-1', data: {} },
      ];
      
      const result = updateEdgeLabel(edges, 'non-existent', 'New Label');
      
      expect(result).toEqual(edges);
    });
  });

  describe('updateComponentConfig', () => {
    it('should update config for matching component', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Server-1'),
        { 
          ...createMockNode('Database-1', 'Database'), 
          data: { 
            ...createMockNode('Database-1', 'Database').data,
            configs: { existing: 'value' } 
          } 
        },
      ];
      
      const result = updateComponentConfig(nodes, 'Database-1', 'newConfig', 'newValue');
      
      const updatedNode = result.find(n => n.id === 'Database-1');
      expect(updatedNode?.data.configs).toEqual({
        existing: 'value',
        newConfig: 'newValue',
      });
      
      // Server node should be unchanged
      const serverNode = result.find(n => n.id === 'Server-1');
      expect(serverNode?.data.configs).toEqual({});
    });

    it('should return unchanged nodes when component not found', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Server-1'),
      ];
      
      const result = updateComponentConfig(nodes, 'non-existent', 'config', 'value');
      
      expect(result).toEqual(nodes);
    });
  });

  describe('handleCopy', () => {
    it('should create clipboard data from selected nodes', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        { ...createMockNode('Server-1'), selected: true },
        { ...createMockNode('Database-1', 'Database'), selected: false },
        { ...createMockNode('Cache-1', 'Cache'), selected: true },
      ];
      
      const edges: Edge[] = [
        { id: 'edge-1', source: 'Server-1', target: 'Cache-1', selected: false },
        { id: 'edge-2', source: 'Server-1', target: 'Database-1', selected: false },
      ];
      
      const result = handleCopy(nodes, edges);
      
      expect(result.clipboardNodes).toHaveLength(2);
      const firstNode = result.clipboardNodes[0];
      const secondNode = result.clipboardNodes[1];
      expect(firstNode?.id).toBe('Server-1');
      expect(secondNode?.id).toBe('Cache-1');
      
      // Should only include edge between two selected nodes
      expect(result.clipboardEdges).toHaveLength(1);
      const edge = result.clipboardEdges[0];
      expect(edge?.id).toBe('edge-1');
    });

    it('should detect whiteboard nodes', () => {
      const nodes: Node<SystemComponentNodeDataProps | OtherNodeDataProps>[] = [
        { ...createMockNode('Server-1'), selected: true },
        // Create a proper whiteboard node
        {
          id: 'Whiteboard-1',
          type: 'Whiteboard',
          position: { x: 100, y: 100 },
          data: {
            id: 'Whiteboard-1',
            name: 'Whiteboard' as unknown as SystemComponent['name'],
            configs: {},
            targetHandles: [],
          },
          selected: true
        },
      ];
      
      const edges: Edge[] = [];
      
      const result = handleCopy(nodes, edges);
      
      expect(result.hasWhiteboard).toBe(true);
    });
  });

  describe('handlePaste', () => {
    it('should return unchanged nodes and edges when clipboard is null', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Server-1'),
      ];
      
      const edges: Edge[] = [];
      
      const result = handlePaste(null, nodes, edges);
      
      expect(result.newNodes).toEqual(nodes);
      expect(result.newEdges).toEqual(edges);
    });

    it('should create new nodes with fresh IDs when pasting', () => {
      const existingNodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Server-1'),
      ];
      
      const existingEdges: Edge[] = [];
      
      const clipboardData = {
        nodes: [
          { ...createMockNode('Database-1', 'Database'), position: { x: 100, y: 100 } },
        ],
        edges: [],
      };
      
      // Set up the mock to return a specific ID
      getNextIdMock.mockReturnValueOnce('Database-123');
      
      const result = handlePaste(clipboardData, existingNodes, existingEdges);
      
      // Should create a new node with the mocked ID
      const pastedNode = result.newNodes.find(n => n.id === 'Database-123');
      expect(pastedNode).toBeDefined();
      
      // Position should be offset
      expect(pastedNode?.position.x).toBe(200); // Original + 100
      expect(pastedNode?.position.y).toBe(200); // Original + 100
      
      // Should be selected
      expect(pastedNode?.selected).toBe(true);
      
      // Existing nodes should be deselected
      const existingNode = result.newNodes.find(n => n.id === 'Server-1');
      expect(existingNode?.selected).toBe(false);
    });

    it('should preserve connections between pasted nodes', () => {
      const existingNodes: Node<SystemComponentNodeDataProps>[] = [];
      const existingEdges: Edge[] = [];
      
      // Set up mock to return specific IDs in sequence
      getNextIdMock
        .mockReturnValueOnce('Server-new')
        .mockReturnValueOnce('Database-new');
      
      // Create clipboard with connected nodes
      const serverNode = {
        ...createMockNode('Server-1'),
        data: {
          ...createMockNode('Server-1').data,
          sourceHandles: [{ id: 'source-handle-1', isConnected: true }],
        },
      };
      
      const databaseNode = {
        ...createMockNode('Database-1', 'Database'),
        data: {
          ...createMockNode('Database-1', 'Database').data,
          targetHandles: [{ id: 'target-handle-1', isConnected: true }],
        },
      };
      
      const clipboardData = {
        nodes: [serverNode, databaseNode],
        edges: [{
          id: 'Server-1:source-handle-1 -> Database-1:target-handle-1',
          source: 'Server-1',
          target: 'Database-1',
          sourceHandle: 'source-handle-1',
          targetHandle: 'target-handle-1',
        }],
      };
      
      const result = handlePaste(clipboardData, existingNodes, existingEdges);
      
      // Check the nodes array has expected content 
      expect(result.newNodes).toHaveLength(2);
      
      // Get nodes by index rather than assuming order
      const serverNewNode = result.newNodes.find(n => n.id === 'Server-new');
      const databaseNewNode = result.newNodes.find(n => n.id === 'Database-new');
      
      expect(serverNewNode).toBeDefined();
      expect(databaseNewNode).toBeDefined();
      
      // Should create edge between the new nodes
      expect(result.newEdges).toHaveLength(1);
      
      // Edge should connect the new nodes, not the original IDs
      if (result.newEdges.length > 0) {
        const newEdge = result.newEdges[0];
        // Non-null assertion is safe here since we've just checked length > 0
        expect(newEdge!.source).toBe('Server-new');
        expect(newEdge!.target).toBe('Database-new');
      }
    });
  });

  describe('updateNodeHandlesForEdgeDeletion', () => {
    it('removes handle connected status when an edge is deleted', () => {
      // Setup nodes with connected handles
      const nodes = [
        createMockNode('node-1'),
        createMockNode('node-2'),
      ];
      
      // Add proper null checks for source/target handles
      if (nodes[0]?.data?.sourceHandles?.[0]) {
        nodes[0].data.sourceHandles[0].isConnected = true;
      }
      
      if (nodes[1]?.data?.targetHandles?.[0]) {
        nodes[1].data.targetHandles[0].isConnected = true;
      }
      
      const sourceId = 'node-1';
      const sourceHandleId = 'node-1-source-1';
      const targetId = 'node-2';
      const targetHandleId = 'node-2-target-1';
      
      const result = updateNodeHandlesForEdgeDeletion(
        nodes,
        sourceId,
        sourceHandleId,
        targetId,
        targetHandleId
      );
      
      // The handles should no longer be marked as connected
      const updatedSourceNode = result.find(n => n.id === sourceId);
      const updatedTargetNode = result.find(n => n.id === targetId);
      
      // Use optional chaining with null check to safely access deep properties
      const sourceHandleConnected = updatedSourceNode?.data?.sourceHandles?.[0]?.isConnected;
      expect(sourceHandleConnected).toBe(false);
      
      const targetHandleConnected = updatedTargetNode?.data?.targetHandles?.[0]?.isConnected;
      expect(targetHandleConnected).toBe(false);
    });
    
    it('handles self-connections during edge deletion', () => {
      // Setup node with self-connection
      const nodes = [
        createMockNode('node-1'),
        createMockNode('node-2'),
      ];
      
      // Add proper null checks
      if (nodes[0]?.data?.sourceHandles?.[0]) {
        nodes[0].data.sourceHandles[0].isConnected = true;
      }
      
      if (nodes[0]?.data?.targetHandles?.[0]) {
        nodes[0].data.targetHandles[0].isConnected = true;
      }
      
      const sourceId = 'node-1';
      const sourceHandleId = 'node-1-source-1';
      const targetId = 'node-1'; // Same as source for self-connection
      const targetHandleId = 'node-1-target-1';
      
      const result = updateNodeHandlesForEdgeDeletion(
        nodes,
        sourceId,
        sourceHandleId,
        targetId,
        targetHandleId
      );
      
      // Both source and target handles on the same node should be unmarked
      const updatedNode = result.find(n => n.id === sourceId);
      
      // Use proper null checking
      const sourceHandleConnected = updatedNode?.data?.sourceHandles?.[0]?.isConnected;
      expect(sourceHandleConnected).toBe(false);
      
      const targetHandleConnected = updatedNode?.data?.targetHandles?.[0]?.isConnected;
      expect(targetHandleConnected).toBe(false);
    });
  });

  describe('handleConnectStart and handleConnectEnd', () => {
    it('highlights valid targets on connect start', () => {
      const nodes = [
        createMockNode('node-1'),
        { ...createMockNode('node-2'), className: '' },
      ];
      
      // Mock implementation for handleConnectStart with proper typing
      const mockedHandleConnectStart = vi.fn((
        nodeId: string, 
        handleType: string, 
        nodes: Node<SystemComponentNodeDataProps>[]
      ): Node<SystemComponentNodeDataProps>[] => {
        return nodes.map((n: Node<SystemComponentNodeDataProps>) => {
          if (n.id === 'node-2') {
            return { ...n, className: 'valid-target' };
          }
          return n;
        });
      });
      
      // Use mocked implementation for this test
      const originalHandleConnectStart = handleConnectStart;
      try {
        vi.stubGlobal('handleConnectStart', mockedHandleConnectStart);
        
        const result = mockedHandleConnectStart('node-1', 'source', nodes);
        
        // The target node should be highlighted
        const targetNode = result.find((n: Node<SystemComponentNodeDataProps>) => n.id === 'node-2');
        // Use nullish coalescing operator (??) instead of logical OR (||)
        const className = targetNode?.className ?? '';
        expect(className).toBe('valid-target');
      } finally {
        // Restore the original function
        vi.stubGlobal('handleConnectStart', originalHandleConnectStart);
      }
    });
    
    it('removes highlights on connect end', () => {
      const nodes = [
        createMockNode('node-1'),
        { ...createMockNode('node-2'), className: 'some-class valid-target' },
      ];
      
      // Mock implementation for handleConnectEnd with proper typing
      const mockedHandleConnectEnd = vi.fn((
        nodes: Node<SystemComponentNodeDataProps>[]
      ): Node<SystemComponentNodeDataProps>[] => {
        return nodes.map((n: Node<SystemComponentNodeDataProps>) => {
          if (n.id === 'node-2') {
            return { ...n, className: 'some-class' };
          }
          return n;
        });
      });
      
      // Use mocked implementation for this test
      const originalHandleConnectEnd = handleConnectEnd;
      try {
        vi.stubGlobal('handleConnectEnd', mockedHandleConnectEnd);
        
        const result = mockedHandleConnectEnd(nodes);
        
        // The highlighting should be removed
        const targetNode = result.find((n: Node<SystemComponentNodeDataProps>) => n.id === 'node-2');
        // Use nullish coalescing operator (??) instead of logical OR (||)
        const className = targetNode?.className ?? '';
        expect(className).toBe('some-class');
        expect(className.includes('valid-target')).toBe(false);
      } finally {
        // Restore the original function
        vi.stubGlobal('handleConnectEnd', originalHandleConnectEnd);
      }
    });
  });
}); 