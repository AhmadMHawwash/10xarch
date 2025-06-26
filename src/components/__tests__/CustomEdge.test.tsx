import * as useSystemDesignerModule from "@/lib/hooks/_useSystemDesigner";
import { fireEvent, render, screen } from "@testing-library/react";
import type { EdgeProps, Node, Position } from "reactflow";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CustomEdgeComponent } from "../CustomEdge";

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

describe("CustomEdgeComponent", () => {
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
    const { container } = render(<CustomEdgeComponent {...mockEdgeProps} />);

    // Check that the edge paths are rendered
    expect(container.querySelector(".react-flow__edge-path")).not.toBeNull();
    expect(
      container.querySelector(".react-flow__edge-interaction"),
    ).not.toBeNull();

    // Check for the label
    expect(screen.getByText("Test Connection")).toBeInTheDocument();
  });

  it("selects the edge when clicking on it without modifier keys", () => {
    const { container } = render(<CustomEdgeComponent {...mockEdgeProps} />);

    // Find the edge path and click it (without modifier keys)
    const edgePath = container.querySelector(".react-flow__edge-path");
    if (edgePath) {
      fireEvent.click(edgePath, { ctrlKey: false, metaKey: false });
    }

    // Verify that setNodes was NOT called (no manual node deselection)
    expect(mockSetNodes).not.toHaveBeenCalled();

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

    // Verify onSelectNode was NOT called (don't clear node selection for mixed selections)
    expect(mockOnSelectNode).not.toHaveBeenCalled();
  });

  it("selects the edge when clicking on the edge label without modifier keys", () => {
    render(<CustomEdgeComponent {...mockEdgeProps} />);

    // Find the edge label and click it (without modifier keys)
    const edgeLabel = screen.getByText("Test Connection");
    fireEvent.click(edgeLabel, { ctrlKey: false, metaKey: false });

    // Verify that setNodes was NOT called (no manual node deselection)
    expect(mockSetNodes).not.toHaveBeenCalled();

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

    // Verify onSelectNode was NOT called (don't clear node selection for mixed selections)
    expect(mockOnSelectNode).not.toHaveBeenCalled();
  });

  // New test for self-connection rendering
  it("renders self-connections with custom path", () => {
    const { container } = render(<CustomEdgeComponent {...mockSelfConnectionEdgeProps} />);
    
    // Check that paths are rendered
    expect(container.querySelector(".react-flow__edge-path")).not.toBeNull();
    expect(container.querySelector(".react-flow__edge-interaction")).not.toBeNull();
    
    // Check for the self-connection label
    expect(screen.getByText("Self Connection")).toBeInTheDocument();
  });

  // New test for selected edge styling
  it("applies special styling for selected edges", () => {
    const { container } = render(<CustomEdgeComponent {...mockSelectedEdgeProps} />);
    
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
    render(<CustomEdgeComponent {...mockEdgeProps} />);

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
    render(<CustomEdgeComponent {...mockEdgeProps} />);

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

  it("does not trigger selection handlers when clicking with modifier keys (for multi-selection)", () => {
    const { container } = render(<CustomEdgeComponent {...mockEdgeProps} />);

    // Find the edge path and click it with Ctrl key (simulating multi-selection)
    const edgePath = container.querySelector(".react-flow__edge-path");
    if (edgePath) {
      fireEvent.click(edgePath, { ctrlKey: true });
    }

    // Verify that selection handlers were NOT called (allowing ReactFlow's multi-selection)
    expect(mockOnSelectEdge).not.toHaveBeenCalled();
    expect(mockOnSelectNode).not.toHaveBeenCalled();

    // Test with Meta key as well (for macOS)
    if (edgePath) {
      fireEvent.click(edgePath, { metaKey: true });
    }

    // Verify that selection handlers were still NOT called
    expect(mockOnSelectEdge).not.toHaveBeenCalled();
    expect(mockOnSelectNode).not.toHaveBeenCalled();
  });
});
