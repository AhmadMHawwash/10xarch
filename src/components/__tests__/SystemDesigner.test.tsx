import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SystemBuilder from '../SystemDesigner';
import * as useSystemDesignerModule from '@/lib/hooks/_useSystemDesigner';
import React from 'react';
import type { Node, Edge, OnConnectStartParams, ReactFlowProps } from 'reactflow';

// Create a type for global augmentation
declare global {
  interface Window {
    mockReactFlowProps: ReactFlowProps | null;
  }
}

// Create a simple mock event type for tests
interface MockMouseEvent {
  preventDefault: () => void;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

// Create a partial mock of the state returned by useSystemDesigner
type PartialSystemDesignerState = {
  nodes: Node[];
  edges: Edge[];
  setNodes: ReturnType<typeof vi.fn>;
  onConnectStart: ReturnType<typeof vi.fn>;
  onConnectEnd: ReturnType<typeof vi.fn>;
  onConnect: ReturnType<typeof vi.fn>;
  onSelectNode: ReturnType<typeof vi.fn>;
  onSelectEdge: ReturnType<typeof vi.fn>;
  initInstance: ReturnType<typeof vi.fn>;
  onEdgesChange: ReturnType<typeof vi.fn>;
  onNodesChange: ReturnType<typeof vi.fn>;
  initWrapper: ReturnType<typeof vi.fn>;
  onDragOver: ReturnType<typeof vi.fn>;
  onDrop: ReturnType<typeof vi.fn>;
  updateNodes: ReturnType<typeof vi.fn>;
  updateEdges: ReturnType<typeof vi.fn>;
  updateEdgeLabel: ReturnType<typeof vi.fn>;
  onSave: ReturnType<typeof vi.fn>;
  onRestore: ReturnType<typeof vi.fn>;
  setEdges: ReturnType<typeof vi.fn>; 
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  useSystemComponentConfigSlice: ReturnType<typeof vi.fn>;
  handleCopy: ReturnType<typeof vi.fn>;
  handlePaste: ReturnType<typeof vi.fn>;
  connectionMode: 'loose';
  selectionMode: 'partial';
  panOnScrollMode: 'free';
  instance: null;
};

// Mock the useSystemDesigner hook
vi.mock('@/lib/hooks/_useSystemDesigner', () => ({
  useSystemDesigner: vi.fn(),
}));

// Mock ReactFlow component to avoid complex DOM testing
vi.mock('reactflow', () => ({
  __esModule: true,
  default: (props: ReactFlowProps) => {
    // Store props for testing
    window.mockReactFlowProps = props;
    return <div data-testid="reactflow-mock" />;
  },
  Background: () => <div data-testid="background-mock" />,
  Panel: ({ children }: { children: React.ReactNode }) => <div data-testid="panel-mock">{children}</div>,
  Controls: () => <div data-testid="controls-mock" />,
  BackgroundVariant: { Dots: 'dots' },
  MarkerType: { ArrowClosed: 'arrowclosed' },
  ConnectionMode: { Loose: 'loose' },
  SelectionMode: { Partial: 'partial' },
  PanOnScrollMode: { Free: 'free' },
}));

// Mock the PassedFlowManager component
const MockPassedFlowManager = () => <div data-testid="flow-manager-mock" />;

describe('SystemDesigner', () => {
  // Sample nodes and edges for testing
  const mockNodes: Node[] = [
    { id: 'node-1', type: 'SystemComponentNode', position: { x: 0, y: 0 }, data: {}, selected: true },
    { id: 'node-2', type: 'SystemComponentNode', position: { x: 100, y: 0 }, data: {}, selected: true },
    { id: 'node-3', type: 'Whiteboard', position: { x: 200, y: 0 }, data: {}, selected: false }
  ];
  
  const mockEdges: Edge[] = [
    { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'CustomEdge' }
  ];

  // Setup mock for useSystemDesigner
  const mockSetNodes = vi.fn();
  const mockOnConnectStart = vi.fn();
  const mockOnConnectEnd = vi.fn();
  const mockOnConnect = vi.fn();
  const mockOnSelectNode = vi.fn();
  const mockOnSelectEdge = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.mockReactFlowProps = null;
    
    // Setup the mock implementation for useSystemDesigner with a partial mock
    const mockState: PartialSystemDesignerState = {
      nodes: mockNodes,
      edges: mockEdges,
      setNodes: mockSetNodes,
      onConnectStart: mockOnConnectStart,
      onConnectEnd: mockOnConnectEnd,
      onConnect: mockOnConnect,
      onSelectNode: mockOnSelectNode,
      onSelectEdge: mockOnSelectEdge,
      
      // Add other required properties with mock implementations
      initInstance: vi.fn(),
      onEdgesChange: vi.fn(),
      onNodesChange: vi.fn(),
      initWrapper: vi.fn(),
      onDragOver: vi.fn(),
      onDrop: vi.fn(),
      updateNodes: vi.fn(),
      updateEdges: vi.fn(),
      updateEdgeLabel: vi.fn(),
      onSave: vi.fn(),
      onRestore: vi.fn(),
      setEdges: vi.fn(),
      selectedNode: null,
      selectedEdge: null,
      useSystemComponentConfigSlice: vi.fn(),
      handleCopy: vi.fn(),
      handlePaste: vi.fn(),
      connectionMode: 'loose', 
      selectionMode: 'partial',
      panOnScrollMode: 'free',
      instance: null
    };
    
    vi.mocked(useSystemDesignerModule.useSystemDesigner).mockReturnValue(mockState);
  });

  it('passes correct handlers to ReactFlow', () => {
    render(<SystemBuilder PassedFlowManager={MockPassedFlowManager} />);
    
    const props = window.mockReactFlowProps;
    expect(props).toBeDefined();
    expect(typeof props?.onConnectStart).toBe('function');
    expect(typeof props?.onConnectEnd).toBe('function');
    
    // The SystemDesigner implementation uses onNodeClick instead of onEdgeClick
    // Let's test for the handlers that are actually implemented
    expect(typeof props?.onNodeClick).toBe('function');
    expect(typeof props?.onPaneClick).toBe('function');
  });

  it('deselects all nodes when onConnectStart is called', () => {
    render(<SystemBuilder PassedFlowManager={MockPassedFlowManager} />);
    
    const props = window.mockReactFlowProps;
    // Create a simple mock event with just the methods we need
    const mockEvent: MockMouseEvent = { preventDefault: vi.fn() };
    // Complete OnConnectStartParams implementation with required properties
    const mockParams: OnConnectStartParams = { 
      nodeId: 'node-1',
      handleId: 'handle-1',
      handleType: 'source'
    };
    
    // Directly call the onConnectStart handler with type assertion
    if (props?.onConnectStart) {
      // @ts-expect-error - Simplified mock event for testing
      props.onConnectStart(mockEvent, mockParams);
    }
    
    // Verify that setNodes was called with all nodes deselected
    expect(mockSetNodes).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'node-1', selected: false }),
        expect.objectContaining({ id: 'node-2', selected: false }),
        expect.objectContaining({ id: 'node-3', selected: false })
      ])
    );
    
    // Verify the original onConnectStart was called
    expect(mockOnConnectStart).toHaveBeenCalledWith(mockEvent, mockParams);
  });

  it('deselects all nodes when onConnectEnd is called', () => {
    render(<SystemBuilder PassedFlowManager={MockPassedFlowManager} />);
    
    const props = window.mockReactFlowProps;
    // Create a simple mock event with just the methods we need
    const mockEvent: MockMouseEvent = { preventDefault: vi.fn() };
    
    // Directly call the onConnectEnd handler with type assertion
    if (props?.onConnectEnd) {
      // @ts-expect-error - Simplified mock event for testing
      props.onConnectEnd(mockEvent);
    }
    
    // Verify that setNodes was called with all nodes deselected
    expect(mockSetNodes).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'node-1', selected: false }),
        expect.objectContaining({ id: 'node-2', selected: false }),
        expect.objectContaining({ id: 'node-3', selected: false })
      ])
    );
    
    // Verify the original onConnectEnd was called
    expect(mockOnConnectEnd).toHaveBeenCalledWith(mockEvent);
  });

  it('selects node when onNodeClick is called', () => {
    render(<SystemBuilder PassedFlowManager={MockPassedFlowManager} />);
    
    const props = window.mockReactFlowProps;
    // Create a simple mock event with just the methods we need
    const mockEvent: MockMouseEvent = { preventDefault: vi.fn() };
    const mockNode = mockNodes[0];
    
    // Directly call the onNodeClick handler with type assertion
    if (props?.onNodeClick && mockNode) {
      // @ts-expect-error - Simplified mock event for testing
      props.onNodeClick(mockEvent, mockNode);
    }
    
    // Verify onSelectNode was called with the node
    expect(mockOnSelectNode).toHaveBeenCalledWith(mockNode);
  });

  it('selects whiteboard node when clicking on pane', () => {
    render(<SystemBuilder PassedFlowManager={MockPassedFlowManager} />);
    
    const props = window.mockReactFlowProps;
    // Create a simple mock event with just the methods we need
    const mockEvent: MockMouseEvent = { preventDefault: vi.fn() };
    
    // Directly call the onPaneClick handler with type assertion
    if (props?.onPaneClick) {
      // @ts-expect-error - Simplified mock event for testing
      props.onPaneClick(mockEvent);
    }
    
    // Verify onSelectNode was called with whiteboard
    // We know mockNodes[2] is the whiteboard node based on the test setup
    expect(mockOnSelectNode).toHaveBeenCalledWith(mockNodes[2]);
  });
});