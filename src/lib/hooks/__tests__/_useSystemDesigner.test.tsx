import { renderHook, act } from '@testing-library/react-hooks';
import { ReactFlowProvider } from 'reactflow';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SystemDesignerProvider, useSystemDesigner, defaultStartingNodes } from '../_useSystemDesigner';
import { ToastProvider } from '@/components/ui/toast';
import { type Node, type Edge, type NodeChange, type XYPosition, type ReactFlowInstance } from 'reactflow';
import { type SystemComponentNodeDataProps, type OtherNodeDataProps } from '@/components/ReactflowCustomNodes/SystemComponentNode';
import { type PiIcon } from 'lucide-react';

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

// Mock ReactFlow instance
const mockReactFlowInstance: Partial<ReactFlowInstance> = {
  project: vi.fn((position: XYPosition): XYPosition => position),
  toObject: vi.fn(() => ({
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  })),
  getNodes: vi.fn(() => []),
};

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
    const mockNode: Node<OtherNodeDataProps> = {
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
      const newNodes = [...defaultStartingNodes, mockNode] as Node<SystemComponentNodeDataProps | OtherNodeDataProps>[];
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
      const newNodes = [...defaultStartingNodes, mockNode] as Node<SystemComponentNodeDataProps | OtherNodeDataProps>[];
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
}); 