import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CustomEdge } from "../CustomEdge";
import * as useSystemDesignerModule from "@/lib/hooks/_useSystemDesigner";
import type { Node, Edge, EdgeProps, Position } from "reactflow";

// Mock the useSystemDesigner hook
vi.mock("@/lib/hooks/_useSystemDesigner", () => ({
  useSystemDesigner: vi.fn(),
}));

// Mock ReactFlow EdgeLabelRenderer
vi.mock("reactflow", () => ({
  getBezierPath: vi.fn().mockReturnValue(["M0 0 L100 100", 50, 50]),
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="edge-label-renderer">{children}</div>
  ),
  Position: {
    Left: "left" as Position,
    Right: "right" as Position,
    Top: "top" as Position,
    Bottom: "bottom" as Position,
  },
}));

describe("CustomEdge", () => {
  // Mock nodes and edges
  const mockNodes: Node[] = [
    { id: "node-1", position: { x: 0, y: 0 }, data: {}, selected: true },
    { id: "node-2", position: { x: 100, y: 0 }, data: {}, selected: true },
  ];

  // Mock edge props
  const mockEdgeProps: EdgeProps = {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
    sourceX: 10,
    sourceY: 10,
    targetX: 100,
    targetY: 100,
    sourcePosition: "right" as Position,
    targetPosition: "left" as Position,
    data: { label: "Test Connection" },
    selected: false,
    // Add source and target handle IDs from recent updates
    sourceHandleId: "source-handle-1",
    targetHandleId: "target-handle-1",
  };

  // Self-connection edge props
  const mockSelfConnectionEdgeProps: EdgeProps = {
    ...mockEdgeProps,
    id: "self-edge-1",
    source: "node-1",
    target: "node-1", // Same source and target for self-connection
    sourceX: 50,
    sourceY: 50,
    targetX: 60,
    targetY: 60,
    sourcePosition: "right" as Position,
    targetPosition: "bottom" as Position,
    data: { label: "Self Connection" },
  };

  // Selected edge props
  const mockSelectedEdgeProps: EdgeProps = {
    ...mockEdgeProps,
    id: "selected-edge-1",
    selected: true,
    data: { label: "Selected Connection" },
  };

  // Mock hook functions
  const mockSetNodes = vi.fn();
  const mockOnSelectEdge = vi.fn();
  const mockOnSelectNode = vi.fn();
  const mockUpdateEdgeLabel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup the mock implementation for useSystemDesigner with only the needed properties
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(useSystemDesignerModule.useSystemDesigner).mockReturnValue({
      nodes: mockNodes,
      setNodes: mockSetNodes,
      onSelectEdge: mockOnSelectEdge,
      onSelectNode: mockOnSelectNode,
      updateEdgeLabel: mockUpdateEdgeLabel,
      onEdgesChange: vi.fn(),
      // Type assertion to any is acceptable here for test mocks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any);
  });

  it("renders with the provided props", () => {
    const { container } = render(<CustomEdge {...mockEdgeProps} />);

    // Check that the edge paths are rendered
    expect(container.querySelector(".react-flow__edge-path")).not.toBeNull();
    expect(
      container.querySelector(".react-flow__edge-interaction"),
    ).not.toBeNull();

    // Check for the label
    expect(screen.getByText("Test Connection")).toBeInTheDocument();
  });

  it("deselects all nodes when clicking on the edge", () => {
    const { container } = render(<CustomEdge {...mockEdgeProps} />);

    // Find the edge path and click it
    const edgePath = container.querySelector(".react-flow__edge-path");
    if (edgePath) {
      fireEvent.click(edgePath);
    }

    // Verify that setNodes was called with all nodes deselected
    expect(mockSetNodes).toHaveBeenCalledWith([
      { ...mockNodes[0], selected: false },
      { ...mockNodes[1], selected: false },
    ]);

    // Verify onSelectEdge was called with the correct edge data
    expect(mockOnSelectEdge).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        sourceHandle: "source-handle-1",
        targetHandle: "target-handle-1",
      }),
    );

    // Verify onSelectNode was called with null to clear node selection
    expect(mockOnSelectNode).toHaveBeenCalledWith(null);
  });

  it("deselects all nodes when clicking on the edge label", () => {
    render(<CustomEdge {...mockEdgeProps} />);

    // Find the edge label and click it
    const edgeLabel = screen.getByText("Test Connection");
    fireEvent.click(edgeLabel);

    // Verify that setNodes was called with all nodes deselected
    expect(mockSetNodes).toHaveBeenCalledWith([
      { ...mockNodes[0], selected: false },
      { ...mockNodes[1], selected: false },
    ]);

    // Verify onSelectEdge was called with the correct edge data
    expect(mockOnSelectEdge).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        sourceHandle: "source-handle-1",
        targetHandle: "target-handle-1",
      }),
    );

    // Verify onSelectNode was called with null to clear node selection
    expect(mockOnSelectNode).toHaveBeenCalledWith(null);
  });

  // New test for self-connection rendering
  it("renders self-connections with custom path", () => {
    const { container } = render(<CustomEdge {...mockSelfConnectionEdgeProps} />);
    
    // Check that paths are rendered
    expect(container.querySelector(".react-flow__edge-path")).not.toBeNull();
    expect(container.querySelector(".react-flow__edge-interaction")).not.toBeNull();
    
    // Check for the self-connection label
    expect(screen.getByText("Self Connection")).toBeInTheDocument();
  });

  // New test for selected edge styling
  it("applies special styling for selected edges", () => {
    const { container } = render(<CustomEdge {...mockSelectedEdgeProps} />);
    
    const edgePath = container.querySelector(".react-flow__edge-path");
    
    // Check that the selected edge has special styling classes
    expect(edgePath).toHaveClass("!stroke-blue-600");
    expect(edgePath).toHaveClass("selected-edge");
    
    // Check that the label has the ring styling for selected state
    const edgeLabel = screen.getByText("Selected Connection");
    const edgeLabelContainer = edgeLabel.closest("div");
    expect(edgeLabelContainer).toHaveClass("ring-2");
    expect(edgeLabelContainer).toHaveClass("ring-blue-500");
  });

  // Test for edit mode
  it("switches to edit mode on double-click and updates label on enter", () => {
    render(<CustomEdge {...mockEdgeProps} />);

    // Find the label and double click it
    const edgeLabel = screen.getByText("Test Connection");
    fireEvent.doubleClick(edgeLabel);

    // Should now show an input field
    const input = screen.getByDisplayValue("Test Connection");
    expect(input).toBeInTheDocument();

    // Change the input value
    fireEvent.change(input, { target: { value: "Updated Connection" } });
    
    // Press Enter to confirm
    fireEvent.keyDown(input, { key: "Enter" });
    
    // Should call updateEdgeLabel with the new value
    expect(mockUpdateEdgeLabel).toHaveBeenCalledWith("edge-1", "Updated Connection");
    
    // The input should be replaced by the label again
    expect(screen.queryByDisplayValue("Updated Connection")).not.toBeInTheDocument();
  });

  // Test for blur to save edits
  it("saves label edits on blur", () => {
    render(<CustomEdge {...mockEdgeProps} />);

    // Find the label and double click it
    const edgeLabel = screen.getByText("Test Connection");
    fireEvent.doubleClick(edgeLabel);

    // Should now show an input field
    const input = screen.getByDisplayValue("Test Connection");
    
    // Change the input value
    fireEvent.change(input, { target: { value: "Blurred Connection" } });
    
    // Blur the input to confirm
    fireEvent.blur(input);
    
    // Should call updateEdgeLabel with the new value
    expect(mockUpdateEdgeLabel).toHaveBeenCalledWith("edge-1", "Blurred Connection");
  });
});
