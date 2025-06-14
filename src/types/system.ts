import { type RefObject } from "react";
import { type Edge } from "reactflow";

/**
 * Interface for node settings dialog control
 */
export interface NodeSettingsRef {
  open: () => void;
  close: () => void;
}

/**
 * Type for ref object that controls node settings dialogs
 */
export type NodeSettingsRefObject = RefObject<NodeSettingsRef>;

/**
 * Specific data structure for custom edges
 */
export interface CustomEdgeData {
  apiDefinition?: string;
  requestFlow?: string;
  label?: string;
  [key: string]: unknown;
}

/**
 * Type for custom edge with specific data
 */
export type CustomEdge = Edge<CustomEdgeData>;

/**
 * Handle information for ReactFlow nodes
 */
export interface NodeHandle {
  id: string;
  isConnected: boolean;
}
