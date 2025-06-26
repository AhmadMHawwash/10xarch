// Types for the file system
export interface FileSystemItem {
  id: string;
  name: string;
  type: "folder" | "file";
  content?: string; // For files - kept for backward compatibility
  contentSections?: {
    id: string;
    title?: string; // NEW: Section titles for better UX
    content: string;
    linkedElements?: Array<{ id: string; type: "node" | "edge"; name: string }>;
  }[]; // New: multiple content sections
  children?: FileSystemItem[]; // For folders
  parentId?: string;
  archived?: boolean; // For archiving instead of deleting
  lastModified?: string; // NEW: Track modification time
  fileType?: "markdown" | "text" | "note"; // NEW: File type categorization
}

export interface DocsFileSystemData {
  items: FileSystemItem[];
  currentPath: string[];
}

// Types for selected elements
export interface SelectedNode {
  id: string;
  data?: {
    title?: string;
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface SelectedEdge {
  id: string;
  data?: {
    label?: string;
    [key: string]: any;
  };
  source?: string;
  target?: string;
  [key: string]: any;
}

export interface DocsFileSystemProps {
  data: DocsFileSystemData;
  onDataChange: (data: DocsFileSystemData) => void;
  canEdit: boolean;
  linkingTextAreaId?: string | null;
  onStartLinking?: (textAreaId: string) => void;
  onStopLinking?: () => void;
  currentSelection?: { nodes: SelectedNode[]; edges: SelectedEdge[] };
  onSaveLinking?: () => void;
  onSelectLinkedElements?: (nodeIds: string[], edgeIds: string[]) => void;
}

// Types for content sections
export interface ContentSectionType {
  id: string;
  title?: string;
  content: string;
  linkedElements?: Array<{
    id: string;
    type: "node" | "edge";
    name: string;
  }>;
}

// Breadcrumb segment type
export interface BreadcrumbSegment {
  id: string;
  name: string;
} 