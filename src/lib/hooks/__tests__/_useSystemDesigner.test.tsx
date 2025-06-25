import { renderHook, act } from '@testing-library/react-hooks';
import { ReactFlowProvider } from 'reactflow';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SystemDesignerProvider, useSystemDesigner } from '../_useSystemDesigner';
import { ToastProvider } from '@/components/ui/toast';
import { type Node, type Edge, type NodeChange } from 'reactflow';
import { type SystemComponentNodeDataProps, type WhiteboardNodeDataProps } from '@/components/ReactflowCustomNodes/SystemComponentNode';
import { type PiIcon } from 'lucide-react';
import { defaultStartingNodes } from '../systemDesignerUtils';
// Mock dependencies
vi.mock('next/navigation', () => ({
  usePathname: () => '/test-path',
}));

vi.mock('@/components/Gallery', () => ({
  getSystemComponent: () => ({
    icon: () => 'IconMock',
  }),
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/lib/levels/utils', () => ({
  componentsNumberingStore: {
    getState: () => ({
      getNextId: (componentName: string) => `${componentName}-1`,
      resetCounting: vi.fn(),
      componentsToCount: {
        Client: 1,
        Server: 1,
        Database: 1,
        'Load Balancer': 1,
        Cache: 1,
        CDN: 1,
        'Message Queue': 1,
      },
    }),
    setState: vi.fn(),
  },
}));

// Create wrapper component for testing
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>
    <ToastProvider>
      <SystemDesignerProvider>{children}</SystemDesignerProvider>
    </ToastProvider>
  </ReactFlowProvider>
);

// Mock HTML element for ReactFlow wrapper
const mockWrapperElement = document.createElement('div');
mockWrapperElement.getBoundingClientRect = vi.fn(() => ({
  left: 0,
  top: 0,
  width: 1000,
  height: 1000,
  right: 1000,
  bottom: 1000,
  x: 0,
  y: 0,
  toJSON: () => ({}),
}));

describe('useSystemDesigner', () => {
  // Define localStorage mock with proper typing
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
    length: 0,
    key: vi.fn(),
  };

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSystemDesigner(), {
      wrapper: Wrapper,
    });

    expect(result.current.nodes).toEqual(defaultStartingNodes);
    expect(result.current.edges).toEqual([]);
    expect(result.current.selectedNode).toBeNull();
    expect(result.current.selectedEdge).toBeNull();
    // Verify localStorage was called with the correct key
    expect(localStorageMock.getItem).toHaveBeenCalledWith('/test-path-reactflow-nodes');
  });

  it('should prevent deleting system definition nodes', () => {
    const { result } = renderHook(() => useSystemDesigner(), {
      wrapper: Wrapper,
    });

    // Use void to handle Promise warning
    void act(() => {
      // Try to delete the Whiteboard node (should be prevented)
      const nodeChange: NodeChange = { type: 'remove', id: 'Whiteboard-1' };
      result.current.onNodesChange([nodeChange]);
    });

    // Whiteboard node should still exist
    expect(result.current.nodes.length).toBe(1);
    expect(result.current.nodes[0]?.id).toBe('Whiteboard-1');
  });

  it('should handle node selection', () => {
    const { result } = renderHook(() => useSystemDesigner(), {
      wrapper: Wrapper,
    });

    // Create a properly typed mock node
    const mockNode: Node<WhiteboardNodeDataProps> = {
      id: 'test-node',
      type: 'service',
      position: { x: 100, y: 100 },
      data: {
        name: 'Whiteboard',
        id: 'test-node',
        configs: {},
        targetHandles: [],
        sourceHandles: [],
      },
    };

    // Use void to handle Promise warning
    void act(() => {
      result.current.onSelectNode(mockNode);
    });

    expect(result.current.selectedNode).toBe(mockNode);
  });

  it('should copy and paste nodes', () => {
    const { result } = renderHook(() => useSystemDesigner(), {
      wrapper: Wrapper,
    });

    // Mock a node with proper typing
    const mockNode: Node<SystemComponentNodeDataProps> = {
      id: 'test-node',
      type: 'service',
      position: { x: 100, y: 100 },
      data: { 
        name: 'Server',
        icon: (() => 'IconMock') as unknown as typeof PiIcon,
        id: 'test-node',
        configs: {},
        targetHandles: [],
        sourceHandles: [],
      },
      selected: true,
    };

    // Add a node and select it
    // Use void to handle Promise warning
    void act(() => {
      // Type assertion to Node<SystemComponentNodeDataProps | OtherNodeDataProps>[]
      const newNodes = [...defaultStartingNodes, mockNode] as Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[];
      result.current.setNodes(newNodes);
    });

    // Copy the node
    // Use void to handle Promise warning
    void act(() => {
      result.current.handleCopy();
    });

    // Paste the node
    // Use void to handle Promise warning
    void act(() => {
      // Create a mock event to pass to handlePaste
      // Call handlePaste without arguments as it expects 0 arguments
      result.current.handlePaste();
    });

    // Should have original node plus the pasted one
    expect(result.current.nodes.length).toBe(3);
  });

  it('should update node configuration', () => {
    const { result } = renderHook(() => useSystemDesigner(), {
      wrapper: Wrapper,
    });

    // Add a node with proper typing
    const mockNode: Node<SystemComponentNodeDataProps> = {
      id: 'test-node',
      type: 'service',
      position: { x: 100, y: 100 },
      data: { 
        name: 'Server',
        icon: (() => 'IconMock') as unknown as typeof PiIcon,
        id: 'test-node',
        configs: {},
        targetHandles: [],
        sourceHandles: [],
      },
    };

    // Use void to handle Promise warning
    void act(() => {
      // Type assertion to Node<SystemComponentNodeDataProps | OtherNodeDataProps>[]
      const newNodes = [...defaultStartingNodes, mockNode] as Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[];
      result.current.setNodes(newNodes);
    });

    // Get and update a config value
    const [configValue, setConfigValue] = result.current.useSystemComponentConfigSlice(
      'test-node',
      'testConfig',
      'defaultValue'
    );

    expect(configValue).toBe('defaultValue');

    // Use void to handle Promise warning
    void act(() => {
      setConfigValue('newValue');
    });

    // Check if the node was updated
    const updatedNode = result.current.nodes.find(node => node.id === 'test-node');
    expect(updatedNode?.data.configs?.testConfig).toBe('newValue');
  });

  it('should copy a single node without handles connections', () => {
    const { result } = renderHook(() => useSystemDesigner(), {
      wrapper: Wrapper,
    });

    // Mock a node with connected handles
    const mockNode: Node<SystemComponentNodeDataProps> = {
      id: 'test-node',
      type: 'service',
      position: { x: 100, y: 100 },
      data: { 
        name: 'Server',
        icon: (() => 'IconMock') as unknown as typeof PiIcon,
        id: 'test-node',
        configs: {},
        // Create handles that have isConnected=true to test if they get reset
        targetHandles: [{ id: 'test-target-handle', isConnected: true }],
        sourceHandles: [{ id: 'test-source-handle', isConnected: true }],
      },
      selected: true,
    };

    // Add the node to the board and select it
    void act(() => {
      const newNodes = [...defaultStartingNodes, mockNode] as Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[];
      result.current.setNodes(newNodes);
    });

    // Copy the node
    void act(() => {
      result.current.handleCopy();
    });

    // Paste the node
    void act(() => {
      result.current.handlePaste();
    });

    // Should have original nodes plus the pasted one
    expect(result.current.nodes.length).toBe(3);
    
    // Get the pasted node (should be the last one added)
    const pastedNode = result.current.nodes[2];
    
    // Verify that the handles were reset (not connected)
    expect(pastedNode?.data.targetHandles?.[0]?.isConnected).toBe(false);
    expect(pastedNode?.data.sourceHandles?.[0]?.isConnected).toBe(false);
    
    // Verify that the handles have new IDs
    expect(pastedNode?.data.targetHandles?.[0]?.id).not.toBe('test-target-handle');
    expect(pastedNode?.data.sourceHandles?.[0]?.id).not.toBe('test-source-handle');
  });

  it('should preserve edges between multiple copied nodes', () => {
    const { result } = renderHook(() => useSystemDesigner(), {
      wrapper: Wrapper,
    });

    // Create two nodes with connected handles
    const mockNode1: Node<SystemComponentNodeDataProps> = {
      id: 'client-1',
      type: 'service',
      position: { x: 100, y: 100 },
      data: { 
        name: 'Client',
        icon: (() => 'IconMock') as unknown as typeof PiIcon,
        id: 'client-1',
        configs: {},
        targetHandles: [],
        sourceHandles: [{ id: 'client-source-handle', isConnected: true }],
      },
      selected: true,
    };

    const mockNode2: Node<SystemComponentNodeDataProps> = {
      id: 'server-1',
      type: 'service',
      position: { x: 300, y: 100 },
      data: { 
        name: 'Server',
        icon: (() => 'IconMock') as unknown as typeof PiIcon,
        id: 'server-1',
        configs: {},
        targetHandles: [{ id: 'server-target-handle', isConnected: true }],
        sourceHandles: [],
      },
      selected: true,
    };

    // Create an edge between the nodes
    const mockEdge: Edge = {
      id: 'client-1 -> server-1',
      source: 'client-1',
      target: 'server-1',
      sourceHandle: 'client-source-handle',
      targetHandle: 'server-target-handle',
    };

    // Add the nodes and edge to the board
    void act(() => {
      const newNodes = [...defaultStartingNodes, mockNode1, mockNode2] as Node<SystemComponentNodeDataProps | WhiteboardNodeDataProps>[];
      result.current.setNodes(newNodes);
      result.current.setEdges([mockEdge]);
    });

    // Copy the nodes (both are selected)
    void act(() => {
      result.current.handleCopy();
    });

    // Remember initial counts
    const initialNodesCount = result.current.nodes.length;
    const initialEdgesCount = result.current.edges.length;

    // Paste the nodes
    void act(() => {
      result.current.handlePaste();
    });

    // Should have 2 new nodes and 1 new edge
    expect(result.current.nodes.length).toBe(initialNodesCount + 2);
    expect(result.current.edges.length).toBe(initialEdgesCount + 1);
    
    // Verify that the new nodes have handles marked as connected
    const pastedNodes = result.current.nodes.filter(node => 
      node.id !== 'client-1' && 
      node.id !== 'server-1' && 
      !node.id.includes('Whiteboard')
    );
    
    // Find the client and server nodes in the pasted nodes
    const pastedClient = pastedNodes.find(node => node.data.name === 'Client');
    const pastedServer = pastedNodes.find(node => node.data.name === 'Server');
    
    expect(pastedClient).toBeDefined();
    expect(pastedServer).toBeDefined();
    
    // At least one handle in the client node should be connected
    const clientHasConnectedHandle = pastedClient?.data.sourceHandles?.some(
      handle => handle.isConnected
    );
    expect(clientHasConnectedHandle).toBe(true);
    
    // At least one handle in the server node should be connected
    const serverHasConnectedHandle = pastedServer?.data.targetHandles?.some(
      handle => handle.isConnected
    );
    expect(serverHasConnectedHandle).toBe(true);
  });

  describe('Linking functionality', () => {
    it('should start linking mode and clear selections', () => {
      const { result } = renderHook(() => useSystemDesigner(), {
        wrapper: Wrapper,
      });

      // Add some nodes with selections
      const selectedNode: Node<SystemComponentNodeDataProps> = {
        id: 'test-node',
        type: 'service',
        position: { x: 100, y: 100 },
        selected: true,
        data: { 
          name: 'Server',
          icon: (() => 'IconMock') as unknown as typeof PiIcon,
          id: 'test-node',
          configs: {},
          targetHandles: [],
          sourceHandles: [],
        },
      };

      const selectedEdge: Edge = {
        id: 'test-edge',
        source: 'node1',
        target: 'node2',
        selected: true,
      };

      // Set up initial state with selected items
      void act(() => {
        result.current.setNodes([...defaultStartingNodes, selectedNode]);
        result.current.setEdges([selectedEdge]);
      });

      // Verify initial state
      expect(result.current.isLinkingMode).toBe(false);
      expect(result.current.linkingTextAreaId).toBeNull();

      // Start linking
      void act(() => {
        result.current.startLinking('test-textarea-id');
      });

      // Verify linking mode is active
      expect(result.current.isLinkingMode).toBe(true);
      expect(result.current.linkingTextAreaId).toBe('test-textarea-id');

      // Verify all selections were cleared
      const nodeWithSelection = result.current.nodes.find(node => node.selected);
      const edgeWithSelection = result.current.edges.find(edge => edge.selected);
      
      expect(nodeWithSelection).toBeUndefined();
      expect(edgeWithSelection).toBeUndefined();
    });

    it('should stop linking mode and clear linking state', () => {
      const { result } = renderHook(() => useSystemDesigner(), {
        wrapper: Wrapper,
      });

      // Start linking first
      void act(() => {
        result.current.startLinking('test-textarea-id');
      });

      // Verify linking is active
      expect(result.current.isLinkingMode).toBe(true);
      expect(result.current.linkingTextAreaId).toBe('test-textarea-id');

      // Stop linking
      void act(() => {
        result.current.stopLinking();
      });

      // Verify linking mode is inactive
      expect(result.current.isLinkingMode).toBe(false);
      expect(result.current.linkingTextAreaId).toBeNull();
      expect(result.current.linkingSelection.nodes).toEqual([]);
      expect(result.current.linkingSelection.edges).toEqual([]);
    });

    it('should update linking selection when nodes/edges are selected during linking', () => {
      const { result } = renderHook(() => useSystemDesigner(), {
        wrapper: Wrapper,
      });

      // Add some nodes first
      const node1: Node<SystemComponentNodeDataProps> = {
        id: 'node1',
        type: 'service',
        position: { x: 100, y: 100 },
        selected: false,
        data: { 
          name: 'Server',
          icon: (() => 'IconMock') as unknown as typeof PiIcon,
          id: 'node1',
          configs: {},
          targetHandles: [],
          sourceHandles: [],
        },
      };

      const node2: Node<SystemComponentNodeDataProps> = {
        id: 'node2',
        type: 'service',
        position: { x: 200, y: 200 },
        selected: false,
        data: { 
          name: 'Database',
          icon: (() => 'IconMock') as unknown as typeof PiIcon,
          id: 'node2',
          configs: {},
          targetHandles: [],
          sourceHandles: [],
        },
      };

      const edge1: Edge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        selected: false,
      };

      void act(() => {
        result.current.setNodes([...defaultStartingNodes, node1, node2]);
        result.current.setEdges([edge1]);
      });

      // Start linking
      void act(() => {
        result.current.startLinking('test-textarea-id');
      });

      // Select some nodes and edges
      void act(() => {
        const updatedNodes = result.current.nodes.map(node => 
          node.id === 'node1' ? { ...node, selected: true } : node
        );
        const updatedEdges = result.current.edges.map(edge => 
          edge.id === 'edge1' ? { ...edge, selected: true } : edge
        );
        
        result.current.setNodes(updatedNodes);
        result.current.setEdges(updatedEdges);
      });

      // Wait for effect to update linking selection
      // The useEffect should automatically update linkingSelection
      expect(result.current.linkingSelection.nodes).toHaveLength(1);
      expect(result.current.linkingSelection.edges).toHaveLength(1);
      expect(result.current.linkingSelection.nodes[0]?.id).toBe('node1');
      expect(result.current.linkingSelection.edges[0]?.id).toBe('edge1');
    });

    it('should not update linking selection when not in linking mode', () => {
      const { result } = renderHook(() => useSystemDesigner(), {
        wrapper: Wrapper,
      });

      // Add some nodes without starting linking
      const selectedNode: Node<SystemComponentNodeDataProps> = {
        id: 'test-node',
        type: 'service',
        position: { x: 100, y: 100 },
        selected: true,
        data: { 
          name: 'Server',
          icon: (() => 'IconMock') as unknown as typeof PiIcon,
          id: 'test-node',
          configs: {},
          targetHandles: [],
          sourceHandles: [],
        },
      };

      void act(() => {
        result.current.setNodes([...defaultStartingNodes, selectedNode]);
      });

      // Verify linking selection remains empty when not in linking mode
      expect(result.current.linkingSelection.nodes).toEqual([]);
      expect(result.current.linkingSelection.edges).toEqual([]);
    });

    it('should handle multiple linking sessions', () => {
      const { result } = renderHook(() => useSystemDesigner(), {
        wrapper: Wrapper,
      });

      // Start first linking session
      void act(() => {
        result.current.startLinking('textarea-1');
      });

      expect(result.current.linkingTextAreaId).toBe('textarea-1');

      // Start second linking session (should clear previous)
      void act(() => {
        result.current.startLinking('textarea-2');
      });

      expect(result.current.linkingTextAreaId).toBe('textarea-2');
      expect(result.current.linkingSelection.nodes).toEqual([]);
      expect(result.current.linkingSelection.edges).toEqual([]);

      // Stop linking
      void act(() => {
        result.current.stopLinking();
      });

      expect(result.current.isLinkingMode).toBe(false);
      expect(result.current.linkingTextAreaId).toBeNull();
    });
  });
}); 