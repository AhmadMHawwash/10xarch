import { describe, test, expect } from "vitest";
import {
  deepCompare,
  getImportantDetails,
  hasPlaygroundChanges,
  type PlaygroundState,
} from "../playground-utils";
import type { Node, Edge } from "reactflow";
import type { SystemComponentNodeDataProps, WhiteboardNodeDataProps } from "@/components/ReactflowCustomNodes/SystemComponentNode";

describe("playground-utils", () => {
  describe("deepCompare", () => {
    test("should return true for identical primitives", () => {
      expect(deepCompare(1, 1)).toBe(true);
      expect(deepCompare("test", "test")).toBe(true);
      expect(deepCompare(true, true)).toBe(true);
      expect(deepCompare(null, null)).toBe(true);
      expect(deepCompare(undefined, undefined)).toBe(true);
    });

    test("should return false for different primitives", () => {
      expect(deepCompare(1, 2)).toBe(false);
      expect(deepCompare("test", "other")).toBe(false);
      expect(deepCompare(true, false)).toBe(false);
      expect(deepCompare(null, undefined)).toBe(false);
    });

    test("should return true for identical arrays", () => {
      expect(deepCompare([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepCompare([], [])).toBe(true);
      expect(deepCompare([{ a: 1 }], [{ a: 1 }])).toBe(true);
    });

    test("should return false for different arrays", () => {
      expect(deepCompare([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(deepCompare([1, 2, 3], [1, 2])).toBe(false);
      expect(deepCompare([{ a: 1 }], [{ a: 2 }])).toBe(false);
    });

    test("should return true for identical objects", () => {
      expect(deepCompare({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(deepCompare({}, {})).toBe(true);
      expect(deepCompare({ nested: { a: 1 } }, { nested: { a: 1 } })).toBe(true);
    });

    test("should return false for different objects", () => {
      expect(deepCompare({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
      expect(deepCompare({ a: 1 }, { a: 1, b: 2 })).toBe(false);
      expect(deepCompare({ nested: { a: 1 } }, { nested: { a: 2 } })).toBe(false);
    });

    test("should return false for mixed types", () => {
      expect(deepCompare([1, 2, 3], { 0: 1, 1: 2, 2: 3 })).toBe(false);
      expect(deepCompare("1", 1)).toBe(false);
      expect(deepCompare(null, 0)).toBe(false);
    });
  });

  describe("getImportantDetails", () => {
    const createMockNode = (id: string, overrides?: Partial<Node<SystemComponentNodeDataProps>>): Node<SystemComponentNodeDataProps> => ({
      id,
      type: "SystemComponent",
      position: { x: 100, y: 100 },
      data: {
        name: "Server",
        id,
        configs: {},
        targetHandles: [],
        sourceHandles: [],
        title: "Test Server",
        subtitle: "Test Subtitle",
      },
      width: 120,
      height: 80,
      selected: true,
      dragging: true,
      ...overrides,
    });

    const createMockEdge = (id: string, overrides?: Partial<Edge>): Edge => ({
      id,
      source: "node1",
      target: "node2",
      type: "default",
      ...overrides,
    });

    test("should extract important details from playground state", () => {
      const nodes = [createMockNode("node1")];
      const edges = [createMockEdge("edge1")];
      const state: PlaygroundState = {
        title: "Test Playground",
        description: "Test Description",
        nodes,
        edges,
        docsData: { items: [], currentPath: [] },
      };

      const result = getImportantDetails(state);

      expect(result.title).toBe("Test Playground");
      expect(result.description).toBe("Test Description");
      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(1);

      // Check that volatile properties are normalized
      expect(result.nodes[0]!.selected).toBe(false);
      expect(result.nodes[0]!.dragging).toBe(false);
    });

    test("should preserve important node properties", () => {
      const node = createMockNode("node1", {
        position: { x: 200, y: 300 },
        width: 150,
        height: 100,
      });
      const state: PlaygroundState = {
        title: "Test",
        description: "Test",
        nodes: [node],
        edges: [],
        docsData: { items: [], currentPath: [] },
      };

      const result = getImportantDetails(state);
      const resultNode = result.nodes[0]!;

      expect(resultNode.id).toBe("node1");
      expect(resultNode.position).toEqual({ x: 200, y: 300 });
      expect(resultNode.width).toBe(150);
      expect(resultNode.height).toBe(100);
      expect(resultNode.data.name).toBe("Server");
      expect(resultNode.data.title).toBe("Test Server");
      expect(resultNode.data.subtitle).toBe("Test Subtitle");
    });

    test("should preserve important edge properties", () => {
      const edge = createMockEdge("edge1", {
        source: "source1",
        target: "target1",
        type: "custom",
      });
      const state: PlaygroundState = {
        title: "Test",
        description: "Test",
        nodes: [],
        edges: [edge],
        docsData: { items: [], currentPath: [] },
      };

      const result = getImportantDetails(state);
      const resultEdge = result.edges[0]!;

      expect(resultEdge.id).toBe("edge1");
      expect(resultEdge.source).toBe("source1");
      expect(resultEdge.target).toBe("target1");
      expect(resultEdge.type).toBe("custom");
    });
  });

  describe("hasPlaygroundChanges", () => {
    const createTestState = (overrides?: Partial<PlaygroundState>): PlaygroundState => ({
      title: "Test Playground",
      description: "Test Description",
      nodes: [],
      edges: [],
      docsData: { items: [], currentPath: [] },
      ...overrides,
    });

    test("should return false when lastSavedState is null", () => {
      const currentState = createTestState();
      expect(hasPlaygroundChanges(currentState, null)).toBe(false);
    });

    test("should return false when states are identical", () => {
      const state = createTestState();
      expect(hasPlaygroundChanges(state, state)).toBe(false);
    });

    test("should return true when title changes", () => {
      const savedState = createTestState({ title: "Original Title" });
      const currentState = createTestState({ title: "Changed Title" });
      expect(hasPlaygroundChanges(currentState, savedState)).toBe(true);
    });

    test("should return true when description changes", () => {
      const savedState = createTestState({ description: "Original Description" });
      const currentState = createTestState({ description: "Changed Description" });
      expect(hasPlaygroundChanges(currentState, savedState)).toBe(true);
    });

    test("should return true when nodes change", () => {
      const node: Node<SystemComponentNodeDataProps> = {
        id: "node1",
        type: "SystemComponent",
        position: { x: 100, y: 100 },
        data: {
          name: "Server",
          id: "node1",
          configs: {},
          targetHandles: [],
          sourceHandles: [],
        },
      };

      const savedState = createTestState({ nodes: [] });
      const currentState = createTestState({ nodes: [node] });
      expect(hasPlaygroundChanges(currentState, savedState)).toBe(true);
    });

    test("should return true when edges change", () => {
      const edge: Edge = {
        id: "edge1",
        source: "node1",
        target: "node2",
      };

      const savedState = createTestState({ edges: [] });
      const currentState = createTestState({ edges: [edge] });
      expect(hasPlaygroundChanges(currentState, savedState)).toBe(true);
    });

    test("should ignore volatile node properties like selected and dragging", () => {
      const baseNode: Node<SystemComponentNodeDataProps> = {
        id: "node1",
        type: "SystemComponent",
        position: { x: 100, y: 100 },
        data: {
          name: "Server",
          id: "node1",
          configs: {},
          targetHandles: [],
          sourceHandles: [],
        },
      };

      const savedState = createTestState({
        nodes: [{ ...baseNode, selected: false, dragging: false }],
      });
      const currentState = createTestState({
        nodes: [{ ...baseNode, selected: true, dragging: true }],
      });

      expect(hasPlaygroundChanges(currentState, savedState)).toBe(false);
    });
  });
}); 