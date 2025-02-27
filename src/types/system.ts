import { type RefObject } from "react";

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