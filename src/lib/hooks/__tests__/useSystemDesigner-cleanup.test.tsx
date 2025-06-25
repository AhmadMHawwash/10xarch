import { renderHook, act } from '@testing-library/react-hooks';
import { ReactFlowProvider } from 'reactflow';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SystemDesignerProvider, useSystemDesigner } from '../_useSystemDesigner';
import { ToastProvider } from '@/components/ui/toast';
import { type Node, type Edge } from 'reactflow';
import { type SystemComponentNodeDataProps, type WhiteboardNodeDataProps } from '@/components/ReactflowCustomNodes/SystemComponentNode';
import React from 'react';

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

describe('SystemDesigner Context - Cleanup Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should manage linking selection state internally', () => {
    const { result } = renderHook(() => useSystemDesigner(), {
      wrapper: Wrapper,
    });

    // Add some test nodes
    const mockNode: Node<SystemComponentNodeDataProps> = {
      id: 'test-node',
      type: 'service',
      position: { x: 100, y: 100 },
      selected: false,
      data: { 
        name: 'Server',
        icon: (() => 'IconMock') as any,
        id: 'test-node',
        configs: {},
        targetHandles: [],
        sourceHandles: [],
      },
    };

    const mockEdge: Edge = {
      id: 'test-edge',
      source: 'node1',
      target: 'node2',
      selected: false,
    };

    // Use void to handle Promise warning
    void act(() => {
      result.current.setNodes([...result.current.nodes, mockNode]);
      result.current.setEdges([mockEdge]);
    });

    // Start linking mode
    void act(() => {
      result.current.startLinking('test-textarea');
    });

    expect(result.current.isLinkingMode).toBe(true);
    expect(result.current.linkingTextAreaId).toBe('test-textarea');

    // Select some elements
    void act(() => {
      const updatedNodes = result.current.nodes.map(node => 
        node.id === 'test-node' ? { ...node, selected: true } : node
      );
      const updatedEdges = result.current.edges.map(edge => 
        edge.id === 'test-edge' ? { ...edge, selected: true } : edge
      );
      
      result.current.setNodes(updatedNodes);
      result.current.setEdges(updatedEdges);
    });

    // linkingSelection should be updated automatically via useEffect
    expect(result.current.linkingSelection.nodes).toHaveLength(1);
    expect(result.current.linkingSelection.edges).toHaveLength(1);
    expect(result.current.linkingSelection.nodes[0]?.id).toBe('test-node');
    expect(result.current.linkingSelection.edges[0]?.id).toBe('test-edge');
  });

  it('should clear linking state properly when stopping', () => {
    const { result } = renderHook(() => useSystemDesigner(), {
      wrapper: Wrapper,
    });

    // Start linking
    void act(() => {
      result.current.startLinking('test-textarea');
    });

    expect(result.current.isLinkingMode).toBe(true);

    // Stop linking
    void act(() => {
      result.current.stopLinking();
    });

    expect(result.current.isLinkingMode).toBe(false);
    expect(result.current.linkingTextAreaId).toBeNull();
    expect(result.current.linkingSelection).toEqual({ nodes: [], edges: [] });
  });

  it('should handle interface compatibility after getLinkingSelection removal', () => {
    const { result } = renderHook(() => useSystemDesigner(), {
      wrapper: Wrapper,
    });

    // Verify that components can still access linking selection state
    // without calling a function (which was the old getLinkingSelection approach)
    const linkingSelection = result.current.linkingSelection;
    
    expect(linkingSelection).toBeDefined();
    expect(linkingSelection.nodes).toBeDefined();
    expect(linkingSelection.edges).toBeDefined();
    expect(Array.isArray(linkingSelection.nodes)).toBe(true);
    expect(Array.isArray(linkingSelection.edges)).toBe(true);
  });
}); 