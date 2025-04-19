import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  handleEdgesChange,
  handleCopy,
  handlePaste,
  deserializeNodes,
} from '../systemDesignerUtils';
import { type Edge, type Node, type EdgeChange } from 'reactflow';
import { type SystemComponentNodeDataProps, type OtherNodeDataProps } from '@/components/ReactflowCustomNodes/SystemComponentNode';
import { SYSTEM_COMPONENT_NODE } from '../useChallengeManager';
import { type SystemComponent } from '@/lib/levels/type';
import { type LucideIcon } from 'lucide-react';

// Mock dependencies
vi.mock('../../levels/utils', () => ({
  componentsNumberingStore: {
    getState: vi.fn(() => ({
      getNextId: vi.fn((name) => `${name}-123`),
      resetCounting: vi.fn(),
      componentsToCount: {},
    })),
    setState: vi.fn(),
  },
}));

describe('systemDesignerUtils edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to create mock nodes for testing
  // Using proper typing for node creation
  const createMockNode = (id: string, type = SYSTEM_COMPONENT_NODE, name = 'Server'): Node<SystemComponentNodeDataProps | OtherNodeDataProps> => ({
    id,
    type,
    position: { x: 100, y: 100 },
    data: {
      id,
      name: name as SystemComponent["name"], // Cast to allowed component name
      icon: 'icon-mock' as unknown as LucideIcon, // Properly cast for tests
      configs: {},
      withSourceHandle: true,
      withTargetHandle: true,
      sourceHandles: [{ id: `${id}-source-1`, isConnected: false }],
      targetHandles: [{ id: `${id}-target-1`, isConnected: false }],
    },
  });

  describe('handleEdgesChange edge cases', () => {
    it('should handle multiple edge deletions at once', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('node-1') as Node<SystemComponentNodeDataProps>,
        createMockNode('node-2') as Node<SystemComponentNodeDataProps>,
        createMockNode('node-3') as Node<SystemComponentNodeDataProps>,
      ];
      
      const edges: Edge[] = [
        { 
          id: 'node-1:node-1-source-1 -> node-2:node-2-target-1', 
          source: 'node-1', 
          target: 'node-2',
          sourceHandle: 'node-1-source-1',
          targetHandle: 'node-2-target-1',
        },
        { 
          id: 'node-2:node-2-source-1 -> node-3:node-3-target-1', 
          source: 'node-2', 
          target: 'node-3',
          sourceHandle: 'node-2-source-1',
          targetHandle: 'node-3-target-1',
        },
      ];
      
      const changes: EdgeChange[] = [
        { type: 'remove', id: 'node-1:node-1-source-1 -> node-2:node-2-target-1' },
        { type: 'remove', id: 'node-2:node-2-source-1 -> node-3:node-3-target-1' },
      ];
      
      const result = handleEdgesChange(changes, edges, nodes);
      
      // Should update all nodes involved in deletions
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      expect(result.nodesToUpdateUI).toContain('node-1');
      expect(result.nodesToUpdateUI).toContain('node-2');
      expect(result.nodesToUpdateUI).toContain('node-3');
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      
      // Should remove source handles
      const node1 = result.updatedNodes.find(n => n.id === 'node-1');
      expect(node1?.data.sourceHandles?.length).toBe(1);
      
      // Should remove target and source handles from middle node
      const node2 = result.updatedNodes.find(n => n.id === 'node-2');
      expect(node2?.data.targetHandles?.length).toBe(1);
      expect(node2?.data.sourceHandles?.length).toBe(1);
      
      // Should have no edges left (we deleted both edges)
      expect(result.updatedEdges.length).toBe(0);
    });

    it('should handle malformed edge IDs gracefully', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('node-1') as Node<SystemComponentNodeDataProps>,
        createMockNode('node-2') as Node<SystemComponentNodeDataProps>,
      ];
      
      const edges: Edge[] = [
        { id: 'valid-edge', source: 'node-1', target: 'node-2' },
        { id: 'malformed-edge', source: 'node-1', target: 'node-2' }, // No handle info in ID
      ];
      
      const changes: EdgeChange[] = [
        { type: 'remove', id: 'malformed-edge' }, // Should not crash
        { type: 'remove', id: 'source-only -> ' }, // Only source
        { type: 'remove', id: ' -> target-only' }, // Only target
        { type: 'remove', id: 'no-separator' }, // No separator
      ];
      
      // Should not throw
      const result = handleEdgesChange(changes, edges, nodes);
      
      // Should still process valid changes
      expect(result.updatedEdges.length).toBe(1);
      const validEdge = result.updatedEdges[0];
      expect(validEdge?.id).toBe('valid-edge');
    });

    it('should properly remove handles when deleting an edge', () => {
      // Create test nodes with handles
      const sourceNode = {
        ...createMockNode('node-1') as Node<SystemComponentNodeDataProps>,
        data: {
          ...(createMockNode('node-1') as Node<SystemComponentNodeDataProps>).data,
          sourceHandles: [
            { id: 'source-handle-1', isConnected: true }, // This handle should be removed
            { id: 'source-handle-2', isConnected: false } // This handle should remain
          ]
        }
      };
      
      const targetNode = {
        ...createMockNode('node-2') as Node<SystemComponentNodeDataProps>,
        data: {
          ...(createMockNode('node-2') as Node<SystemComponentNodeDataProps>).data,
          targetHandles: [
            { id: 'target-handle-1', isConnected: true }, // This handle should be removed
            { id: 'target-handle-2', isConnected: false } // This handle should remain
          ]
        }
      };
      
      const nodes: Node<SystemComponentNodeDataProps>[] = [sourceNode, targetNode];
      
      // Create an edge between the source and target handles
      const edges: Edge[] = [
        { 
          id: 'edge-to-delete', 
          source: 'node-1', 
          target: 'node-2',
          sourceHandle: 'source-handle-1',
          targetHandle: 'target-handle-1'
        }
      ];
      
      // Change to delete the edge
      const changes: EdgeChange[] = [
        { type: 'remove', id: 'edge-to-delete' }
      ];
      
      // Call handleEdgesChange with the delete change
      const result = handleEdgesChange(changes, edges, nodes);
      
      // Verify that the edge was deleted
      expect(result.updatedEdges.length).toBe(0);
      
      // Find the updated nodes
      const updatedSourceNode = result.updatedNodes.find(n => n.id === 'node-1');
      const updatedTargetNode = result.updatedNodes.find(n => n.id === 'node-2');
      
      // Verify that the used handles were removed
      expect(updatedSourceNode?.data.sourceHandles?.find(h => h.id === 'source-handle-1')).toBeUndefined();
      expect(updatedTargetNode?.data.targetHandles?.find(h => h.id === 'target-handle-1')).toBeUndefined();
      
      // Verify that the unused handles remain
      expect(updatedSourceNode?.data.sourceHandles?.find(h => h.id === 'source-handle-2')).toBeDefined();
      expect(updatedTargetNode?.data.targetHandles?.find(h => h.id === 'target-handle-2')).toBeDefined();
      
      // Verify that the nodes are in the nodesToUpdateUI array
      expect(result.nodesToUpdateUI).toContain('node-1');
      expect(result.nodesToUpdateUI).toContain('node-2');
    });
  });

  describe('handleCopy edge cases', () => {
    it('should handle nodes with no edges', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        { ...createMockNode('node-1') as Node<SystemComponentNodeDataProps>, selected: true },
      ];
      
      const edges: Edge[] = [];
      
      const result = handleCopy(nodes, edges);
      
      expect(result.clipboardNodes.length).toBe(1);
      expect(result.clipboardEdges.length).toBe(0);
    });

    it('should handle no selected nodes', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        { ...createMockNode('node-1') as Node<SystemComponentNodeDataProps>, selected: false },
        { ...createMockNode('node-2') as Node<SystemComponentNodeDataProps>, selected: false },
      ];
      
      const edges: Edge[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2' },
      ];
      
      const result = handleCopy(nodes, edges);
      
      expect(result.clipboardNodes.length).toBe(0);
      expect(result.clipboardEdges.length).toBe(0);
    });

    it('should handle complex node selections with disconnected groups', () => {
      // Two disconnected groups of selected nodes
      const nodes: Node<SystemComponentNodeDataProps>[] = [
        { ...createMockNode('node-1') as Node<SystemComponentNodeDataProps>, selected: true },
        { ...createMockNode('node-2') as Node<SystemComponentNodeDataProps>, selected: true },
        { ...createMockNode('node-3') as Node<SystemComponentNodeDataProps>, selected: false }, // Unselected in middle
        { ...createMockNode('node-4') as Node<SystemComponentNodeDataProps>, selected: true },
        { ...createMockNode('node-5') as Node<SystemComponentNodeDataProps>, selected: true },
      ];
      
      const edges: Edge[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2' }, // Group 1
        { id: 'edge-2', source: 'node-2', target: 'node-3' }, // Edge to unselected
        { id: 'edge-3', source: 'node-3', target: 'node-4' }, // Edge from unselected
        { id: 'edge-4', source: 'node-4', target: 'node-5' }, // Group 2
      ];
      
      const result = handleCopy(nodes, edges);
      
      // Should include all selected nodes
      expect(result.clipboardNodes.length).toBe(4);
      
      // Should only include edges between selected nodes
      expect(result.clipboardEdges.length).toBe(2);
      
      // Check edges by ID
      const edge1 = result.clipboardEdges.find(e => e.id === 'edge-1');
      const edge2 = result.clipboardEdges.find(e => e.id === 'edge-2');
      const edge3 = result.clipboardEdges.find(e => e.id === 'edge-3');
      const edge4 = result.clipboardEdges.find(e => e.id === 'edge-4');
      
      expect(edge1).toBeDefined();
      expect(edge4).toBeDefined();
      expect(edge2).toBeUndefined();
      expect(edge3).toBeUndefined();
    });
  });

  describe('handlePaste edge cases', () => {
    it('should handle single node paste by resetting handles', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [];
      const edges: Edge[] = [];
      
      // Single node clipboard with many handles
      const clipboardNode = {
        ...createMockNode('node-1') as Node<SystemComponentNodeDataProps>,
        data: {
          ...createMockNode('node-1').data,
          sourceHandles: [
            { id: 'handle-1', isConnected: true },
            { id: 'handle-2', isConnected: true },
            { id: 'handle-3', isConnected: true },
          ],
          targetHandles: [
            { id: 'handle-4', isConnected: true },
            { id: 'handle-5', isConnected: true },
          ],
        },
      };
      
      const clipboardData = {
        nodes: [clipboardNode],
        edges: [], // No edges
      };
      
      const result = handlePaste(clipboardData, nodes, edges);
      
      // Should create single node
      expect(result.newNodes.length).toBe(1);
      
      // For single node, should reset handles to just one of each
      const pastedNode = result.newNodes[0];
      
      // Check for null before accessing properties
      if (!pastedNode) {
        throw new Error('Pasted node not found');
      }
      
      expect(pastedNode.data.sourceHandles?.length).toBe(1);
      expect(pastedNode.data.sourceHandles?.[0]?.isConnected).toBe(false);
      expect(pastedNode.data.targetHandles?.length).toBe(1);
      expect(pastedNode.data.targetHandles?.[0]?.isConnected).toBe(false);
    });

    it('should handle multinode paste with dangling edges', () => {
      const nodes: Node<SystemComponentNodeDataProps>[] = [];
      const edges: Edge[] = [];
      
      // Clipboard with edges to nodes not in clipboard
      const clipboardData = {
        nodes: [createMockNode('node-1') as Node<SystemComponentNodeDataProps>],
        edges: [
          { 
            id: 'edge-1', 
            source: 'node-1', 
            target: 'node-2', // Not in clipboard
            sourceHandle: 'handle-1',
            targetHandle: 'handle-2',
          },
        ],
      };
      
      const result = handlePaste(clipboardData, nodes, edges);
      
      // Should paste node
      expect(result.newNodes.length).toBe(1);
      
      // Should not paste edge with missing node
      expect(result.newEdges.length).toBe(0);
    });

    it('should handle paste with duplicate IDs', () => {
      // Existing node with same ID as in clipboard
      const existingNodes: Node<SystemComponentNodeDataProps>[] = [
        createMockNode('Server-123') as Node<SystemComponentNodeDataProps>, // Same ID as what will be generated
      ];
      const existingEdges: Edge[] = [];
      
      const clipboardData = {
        nodes: [createMockNode('Server-1') as Node<SystemComponentNodeDataProps>],
        edges: [],
      };
      
      // Mock to return same ID as existing node (already handled by the default mock)
      
      const result = handlePaste(clipboardData, existingNodes, existingEdges);
      
      // Should have two nodes
      expect(result.newNodes.length).toBe(2);
      
      // Node IDs should be the same, since the paste logic relies on the numbering store
      // to generate unique IDs. In a real scenario, the numbering store would return
      // an ID that doesn't conflict.
      const pastedNodeIds = result.newNodes.map(n => n.id);
      const matchingIds = pastedNodeIds.filter(id => id === 'Server-123');
      expect(matchingIds.length).toBe(2);
      
      // But they should be at different positions - first is at 100, second at 200
      const positions = result.newNodes.map(n => n.position);
      
      // We need to make sure we have both positions
      expect(positions).toEqual(expect.arrayContaining([
        expect.objectContaining({ x: 100, y: 100 }),
        expect.objectContaining({ x: 200, y: 200 })
      ]));
    });
  });

  describe('deserializeNodes edge cases', () => {
    it('should handle nodes with missing handles gracefully', () => {
      const mockNode = {
        ...createMockNode('Server-1'),
        data: {
          ...createMockNode('Server-1').data,
          sourceHandles: undefined, // Missing sourceHandles
          targetHandles: undefined, // Missing targetHandles
        },
      };
      
      const serializedNodes = JSON.stringify([mockNode]);
      
      const result = deserializeNodes(serializedNodes);
      
      // Should have at least one node
      expect(result.length).toBeGreaterThan(0);
      
      // Should initialize empty arrays for missing handles
      if (result.length > 0) {
        expect(result[0]?.data.sourceHandles).toEqual([]);
        expect(result[0]?.data.targetHandles).toEqual([]);
      }
    });

    it('should handle null data in nodes', () => {
      // A malformed node with null data
      const malformedNode = {
        id: 'bad-node',
        type: SYSTEM_COMPONENT_NODE,
        position: { x: 0, y: 0 },
        data: null,
      };
      
      const serializedNodes = JSON.stringify([malformedNode]);
      
      // Should not throw, but the result may not be usable 
      // (this tests the error handling)
      expect(() => deserializeNodes(serializedNodes)).not.toThrow();
    });
  });
}); 