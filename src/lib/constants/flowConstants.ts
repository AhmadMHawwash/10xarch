/**
 * Constants for React Flow node and edge types
 */

// Node types for the system designer
export enum NodeTypes {
  SERVICE = 'service',
  DATABASE = 'database',
  QUEUE = 'queue',
  CACHE = 'cache',
  LOAD_BALANCER = 'loadBalancer',
  CLIENT = 'client',
  SYSTEM_BOUNDARY = 'systemBoundary',
  SYSTEM_DEFINITION = 'systemDefinition',
  WHITEBOARD = 'Whiteboard',
  MESSAGE_QUEUE = 'Message Queue',
}

// Edge types for connections between nodes
export enum EdgeTypes {
  DEFAULT = 'default',
  CUSTOM_EDGE = 'CustomEdge',
}

// Position constants
export enum Position {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

// System component types from the component gallery
export enum SystemComponentTypes {
  CLIENT = 'Client',
  SERVER = 'Server',
  DATABASE = 'Database',
  LOAD_BALANCER = 'Load Balancer',
  CACHE = 'Cache',
  CDN = 'CDN',
  MESSAGE_QUEUE = 'Message Queue',
  WHITEBOARD = 'Whiteboard',
} 