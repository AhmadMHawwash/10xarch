"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import BreadcrumbNavigation from "./BreadcrumbNavigation";
import {
  Archive,
  ArchiveRestore,
  Check,
  Eye,
  File,
  FileText,
  Folder,
  Link,
  Pencil,
  Plus,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

// Types for the file system
export interface FileSystemItem {
  id: string;
  name: string;
  type: "folder" | "file";
  content?: string; // For files - kept for backward compatibility
  contentSections?: {
    id: string;
    content: string;
    linkedElements?: Array<{ id: string; type: "node" | "edge"; name: string }>;
  }[]; // New: multiple content sections
  children?: FileSystemItem[]; // For folders
  parentId?: string;
  archived?: boolean; // For archiving instead of deleting
}

export interface DocsFileSystemData {
  items: FileSystemItem[];
  currentPath: string[];
}

// Types for selected elements
interface SelectedNode {
  id: string;
  data?: {
    title?: string;
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface SelectedEdge {
  id: string;
  data?: {
    label?: string;
    [key: string]: any;
  };
  source?: string;
  target?: string;
  [key: string]: any;
}

interface DocsFileSystemProps {
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

const DocsFileSystem = ({
  data,
  onDataChange,
  canEdit,
  linkingTextAreaId,
  onStartLinking,
  onStopLinking,
  currentSelection,
  onSaveLinking,
  onSelectLinkedElements,
}: DocsFileSystemProps) => {
  const [currentPath, setCurrentPath] = useState<string[]>(
    data.currentPath || [],
  );
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [confirmingDeleteSection, setConfirmingDeleteSection] = useState<
    string | null
  >(null);

  // Update data when path changes
  useEffect(() => {
    if (data.currentPath !== currentPath) {
      onDataChange({ ...data, currentPath });
    }
  }, [currentPath, data, onDataChange]);

  // Helper function to get content sections for a file
  const getContentSections = (file: FileSystemItem) => {
    // If file has contentSections, use them; otherwise migrate from old content format
    if (file.contentSections) {
      return file.contentSections;
    } else if (file.content) {
      return [{ id: `section_${Date.now()}`, content: file.content }];
    } else {
      return [{ id: `section_${Date.now()}`, content: "" }];
    }
  };

  // Helper function to update content sections for a file
  const updateContentSections = (
    fileId: string,
    sections: {
      id: string;
      content: string;
      linkedElements?: Array<{
        id: string;
        type: "node" | "edge";
        name: string;
      }>;
    }[],
  ) => {
    if (!canEdit) return;

    const updateItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map((item) => {
        if (item.id === fileId) {
          return { ...item, contentSections: sections, content: undefined }; // Clear old content format
        }
        if (item.children) {
          return {
            ...item,
            children: updateItems(item.children),
          };
        }
        return item;
      });
    };

    const newData = {
      ...data,
      items: updateItems(data.items),
    };
    onDataChange(newData);
  };

  // Add new content section to a file
  const addContentSection = (fileId: string) => {
    if (!canEdit) return;

    const file = findFileById(fileId);
    if (!file) return;

    const currentSections = getContentSections(file);
    const newSection = { id: `section_${Date.now()}`, content: "" };
    const updatedSections = [...currentSections, newSection];

    updateContentSections(fileId, updatedSections);

    // If this file is currently selected, update the selected file state
    if (selectedFile?.id === fileId) {
      setSelectedFile({ ...file, contentSections: updatedSections });
    }
  };

  // Remove content section from a file
  const removeContentSection = (fileId: string, sectionId: string) => {
    if (!canEdit) return;

    const file = findFileById(fileId);
    if (!file) return;

    const currentSections = getContentSections(file);
    if (currentSections.length <= 1) return; // Don't remove the last section

    const updatedSections = currentSections.filter(
      (section) => section.id !== sectionId,
    );
    updateContentSections(fileId, updatedSections);

    // If this file is currently selected, update the selected file state
    if (selectedFile?.id === fileId) {
      setSelectedFile({ ...file, contentSections: updatedSections });
    }

    // Clear confirmation state
    setConfirmingDeleteSection(null);
  };

  // Start confirming section deletion
  const startConfirmingDeleteSection = (sectionId: string) => {
    setConfirmingDeleteSection(sectionId);
  };

  // Cancel section deletion
  const cancelDeleteSection = () => {
    setConfirmingDeleteSection(null);
  };

  // Update specific content section
  const updateContentSection = (
    fileId: string,
    sectionId: string,
    content: string,
  ) => {
    if (!canEdit) return;

    const file = findFileById(fileId);
    if (!file) return;

    const currentSections = getContentSections(file);
    const updatedSections = currentSections.map((section) =>
      section.id === sectionId ? { ...section, content } : section,
    );

    updateContentSections(fileId, updatedSections);

    // If this file is currently selected, update the selected file state
    if (selectedFile?.id === fileId) {
      setSelectedFile({ ...file, contentSections: updatedSections });
    }
  };

  // Helper function to find a file by ID
  const findFileById = (fileId: string): FileSystemItem | null => {
    const searchItems = (items: FileSystemItem[]): FileSystemItem | null => {
      for (const item of items) {
        if (item.id === fileId) {
          return item;
        }
        if (item.children) {
          const found = searchItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return searchItems(data.items);
  };

  // Get current folder items
  const getCurrentFolderItems = (): FileSystemItem[] => {
    let current = data.items;
    for (const pathSegment of currentPath) {
      const folder = current.find(
        (item) => item.id === pathSegment && item.type === "folder",
      );
      if (folder?.children) {
        current = folder.children;
      } else {
        return [];
      }
    }
    // Filter based on archived status
    if (showArchived) {
      return current.filter((item) => item.archived === true);
    } else {
      return current.filter((item) => !item.archived);
    }
  };

  // Add new item
  const addItem = (type: "folder" | "file") => {
    if (!canEdit) return;

    const newItem: FileSystemItem = {
      id: `${type}_${Date.now()}`,
      name: `New ${type}`,
      type,
      content: undefined, // Use contentSections instead
      contentSections:
        type === "file"
          ? [{ id: `section_${Date.now()}`, content: "" }]
          : undefined,
      children: type === "folder" ? [] : undefined,
      parentId: currentPath[currentPath.length - 1] ?? undefined,
    };

    const newData = { ...data };

    // Add to current location
    if (currentPath.length === 0) {
      newData.items = [...newData.items, newItem];
    } else {
      // Find the parent folder and add the item
      const updateItems = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map((item) => {
          if (
            item.id === currentPath[currentPath.length - 1] &&
            item.type === "folder"
          ) {
            return {
              ...item,
              children: [...(item.children ?? []), newItem],
            };
          }
          if (item.children) {
            return {
              ...item,
              children: updateItems(item.children),
            };
          }
          return item;
        });
      };
      newData.items = updateItems(newData.items);
    }

    onDataChange(newData);
    setEditingItemId(newItem.id);
    setEditingName(newItem.name);
  };

  // Update item name
  const updateItemName = (itemId: string, newName: string) => {
    if (!canEdit || !newName.trim()) return;

    const updateItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return { ...item, name: newName.trim() };
        }
        if (item.children) {
          return {
            ...item,
            children: updateItems(item.children),
          };
        }
        return item;
      });
    };

    const newData = {
      ...data,
      items: updateItems(data.items),
    };
    onDataChange(newData);
  };

  // Archive item and all its descendants
  const archiveItem = (itemId: string) => {
    if (!canEdit) return;

    if (
      !confirm(
        "Are you sure you want to archive this item? You can restore it later from the archived items.",
      )
    ) {
      return;
    }

    // Recursively archive an item and all its children
    const archiveItemRecursively = (item: FileSystemItem): FileSystemItem => {
      const archivedItem = { ...item, archived: true };

      // If it's a folder, archive all children recursively
      if (archivedItem.children) {
        archivedItem.children = archivedItem.children.map((child) =>
          archiveItemRecursively(child),
        );
      }

      return archivedItem;
    };

    const archiveInItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return archiveItemRecursively(item);
        }
        if (item.children) {
          return {
            ...item,
            children: archiveInItems(item.children),
          };
        }
        return item;
      });
    };

    const newData = {
      ...data,
      items: archiveInItems(data.items),
    };
    onDataChange(newData);

    // If the archived item was selected, clear selection
    if (selectedFile?.id === itemId) {
      setSelectedFile(null);
    }
  };

  // Restore item and all its descendants
  const restoreItem = (itemId: string) => {
    if (!canEdit) return;

    // Recursively restore an item and all its children
    const restoreItemRecursively = (item: FileSystemItem): FileSystemItem => {
      const restoredItem = { ...item, archived: false };

      // If it's a folder, restore all children recursively
      if (restoredItem.children) {
        restoredItem.children = restoredItem.children.map((child) =>
          restoreItemRecursively(child),
        );
      }

      return restoredItem;
    };

    const restoreInItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return restoreItemRecursively(item);
        }
        if (item.children) {
          return {
            ...item,
            children: restoreInItems(item.children),
          };
        }
        return item;
      });
    };

    const newData = {
      ...data,
      items: restoreInItems(data.items),
    };
    onDataChange(newData);
  };

  // Permanently delete item and all its descendants
  const deleteItem = (itemId: string) => {
    if (!canEdit) return;

    if (
      !confirm(
        "Are you sure you want to permanently delete this item? This action cannot be undone.",
      )
    ) {
      return;
    }

    const deleteFromItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items
        .filter((item) => {
          if (item.id === itemId) {
            return false; // Remove this item
          }
          if (item.children) {
            return {
              ...item,
              children: deleteFromItems(item.children),
            };
          }
          return true;
        })
        .map((item) => {
          if (item.children) {
            return {
              ...item,
              children: deleteFromItems(item.children),
            };
          }
          return item;
        });
    };

    const newData = {
      ...data,
      items: deleteFromItems(data.items),
    };
    onDataChange(newData);

    // If the deleted item was selected, clear selection
    if (selectedFile?.id === itemId) {
      setSelectedFile(null);
    }
  };

  // Navigate to folder
  const navigateToFolder = (folderId: string) => {
    setCurrentPath([...currentPath, folderId]);
    setSelectedFile(null);
  };

  // Navigate to path
  const navigateToPath = (pathIndex: number) => {
    const newPath = currentPath.slice(0, pathIndex + 1);
    setCurrentPath(newPath);
    setSelectedFile(null);
  };

  // Go to root
  const goToRoot = () => {
    setCurrentPath([]);
    setSelectedFile(null);
  };

  // Select file
  const selectFile = (file: FileSystemItem) => {
    setSelectedFile(file);
    setIsPreviewMode(true);
  };

  // Start editing item name
  const startEditingName = (item: FileSystemItem) => {
    if (!canEdit) return;
    setEditingItemId(item.id);
    setEditingName(item.name);
  };

  // Save name edit
  const saveNameEdit = () => {
    if (editingItemId) {
      updateItemName(editingItemId, editingName);
    }
    setEditingItemId(null);
    setEditingName("");
  };

  // Cancel name edit
  const cancelNameEdit = () => {
    setEditingItemId(null);
    setEditingName("");
  };

  // Select linked elements for a section
  const handleSelectLinkedElements = (sectionId: string) => {
    if (!onSelectLinkedElements || !selectedFile) return;
    
    const section = getContentSections(selectedFile).find(s => s.id === sectionId);
    if (!section?.linkedElements) {
      // Clear selections if no linked elements
      onSelectLinkedElements([], []);
      return;
    }
    
    const nodeIds = section.linkedElements
      .filter(element => element.type === 'node')
      .map(element => element.id);
    
    const edgeIds = section.linkedElements
      .filter(element => element.type === 'edge')
      .map(element => element.id);
    
    onSelectLinkedElements(nodeIds, edgeIds);
  };

  // Clear selections
  const handleClearSelections = () => {
    if (onSelectLinkedElements) {
      onSelectLinkedElements([], []);
    }
  };

  // Get folder name by ID
  const getFolderName = (folderId: string): string => {
    const findFolder = (items: FileSystemItem[]): string | null => {
      for (const item of items) {
        if (item.id === folderId && item.type === "folder") {
          return item.name;
        }
        if (item.children) {
          const found = findFolder(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findFolder(data.items) ?? folderId;
  };

  // Create breadcrumb segments for the navigation component
  const getBreadcrumbSegments = () => {
    return currentPath.map((pathId) => ({
      id: pathId,
      name: getFolderName(pathId),
    }));
  };

  // Render current selection during linking
  const renderCurrentSelection = (sectionId: string) => {
    const expectedLinkingId = `${selectedFile?.id}_${sectionId}`;
    const isActiveLinkingSection = linkingTextAreaId === expectedLinkingId;

    if (!isActiveLinkingSection || !currentSelection) {
      return null;
    }

    const { nodes: selectedNodes, edges: selectedEdges } = currentSelection;
    const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

    if (!hasSelection) {
      return (
        <div className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2">
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Ctrl/Cmd + click elements to select them for linking
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-3 rounded-md border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Selected for Linking ({selectedNodes.length + selectedEdges.length}{" "}
            items)
          </span>
          <Button
            variant="default"
            size="sm"
            onClick={() => onSaveLinking?.()}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            Save Links
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {selectedNodes.map((node: SelectedNode) => (
            <span
              key={node.id}
              className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-200"
            >
              ⬡ {node.data?.title ?? node.data?.name ?? node.id}
            </span>
          ))}
          {selectedEdges.map((edge: SelectedEdge) => (
            <span
              key={edge.id}
              className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/20 dark:text-purple-200"
            >
              → {edge.data?.label ?? `${edge.source} → ${edge.target}`}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Render linked elements
  const renderLinkedElements = (
    linkedElements?: Array<{ id: string; type: "node" | "edge"; name: string }>,
  ) => {
    if (!linkedElements || linkedElements.length === 0) {
      return null;
    }

    return (
      <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="mb-2 flex items-center gap-2">
          <Link className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Linked Elements
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {linkedElements.map((element) => (
            <span
              key={element.id}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                element.type === "node"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                  : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200"
              }`}
            >
              {element.type === "node" ? "⬡" : "→"} {element.name}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Render markdown
  const renderMarkdown = (content: string) => {
    // Simple markdown rendering - you can replace this with a proper markdown library
    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="mb-2 text-2xl font-bold">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="mb-2 text-xl font-semibold">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="mb-2 text-lg font-medium">
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
        return (
          <p key={index} className="mb-1 font-bold">
            {line.slice(2, -2)}
          </p>
        );
      }
      if (line.startsWith("*") && line.endsWith("*") && line.length > 2) {
        return (
          <p key={index} className="mb-1 italic">
            {line.slice(1, -1)}
          </p>
        );
      }
      return (
        <p key={index} className="mb-1">
          {line ?? <br />}
        </p>
      );
    });
  };

  if (selectedFile) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-shrink-0 p-1">
          {/* Breadcrumb navigation */}
          <BreadcrumbNavigation
            currentPath={currentPath}
            segments={getBreadcrumbSegments()}
            onNavigateToRoot={goToRoot}
            onNavigateToPath={navigateToPath}
            currentFileName={selectedFile.name}
          />
        </div>

        {/* File viewer/editor - scrollable */}
        <div className="flex-1 overflow-y-auto p-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{selectedFile.name}</Label>
              <div className="flex items-center space-x-2">
                {canEdit && (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant={isPreviewMode ? "ghost" : "default"}
                      size="sm"
                      onClick={() => setIsPreviewMode(false)}
                      className="h-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={isPreviewMode ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setIsPreviewMode(true)}
                      className="h-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="h-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isPreviewMode ? (
              <div className="space-y-4">
                {getContentSections(selectedFile).map((section, index) => (
                  <div
                    key={section.id}
                    className="min-h-[200px] w-full rounded-md border bg-gray-50 p-4 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSelectLinkedElements(section.id)}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Section {index + 1}
                      </Label>
                    </div>
                    {renderCurrentSelection(section.id)}
                    {renderLinkedElements(section.linkedElements)}
                    {section.content ? (
                      <div className="prose max-w-none dark:prose-invert">
                        {renderMarkdown(section.content)}
                      </div>
                    ) : (
                      <p className="italic text-gray-500 dark:text-gray-400">
                        No content yet. Click edit to add content.
                      </p>
                    )}
                  </div>
                ))}
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addContentSection(selectedFile.id)}
                    className="w-full gap-2 border-dashed"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Section
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {getContentSections(selectedFile).map((section, index) => (
                  <div key={section.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Section {index + 1}
                      </Label>
                      <div className="flex items-center space-x-1">
                        {canEdit && onStartLinking && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const textAreaId = `${selectedFile.id}_${section.id}`;
                              if (
                                linkingTextAreaId === textAreaId &&
                                onStopLinking
                              ) {
                                onStopLinking();
                              } else {
                                onStartLinking(textAreaId);
                              }
                            }}
                            className={`h-6 w-6 p-0 ${
                              linkingTextAreaId ===
                              `${selectedFile.id}_${section.id}`
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20"
                                : "text-blue-500 hover:text-blue-700"
                            }`}
                            title={
                              linkingTextAreaId ===
                              `${selectedFile.id}_${section.id}`
                                ? "Stop linking"
                                : "Link to elements"
                            }
                          >
                            <Link className="h-3 w-3" />
                          </Button>
                        )}
                        {canEdit &&
                          getContentSections(selectedFile).length > 1 &&
                          (confirmingDeleteSection === section.id ? (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-red-500">
                                delete item?
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeContentSection(
                                    selectedFile.id,
                                    section.id,
                                  )
                                }
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                title="Confirm delete"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelDeleteSection}
                                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                                title="Cancel delete"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                startConfirmingDeleteSection(section.id)
                              }
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              title="Remove section"
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          ))}
                      </div>
                    </div>
                    {renderCurrentSelection(section.id)}
                    {renderLinkedElements(section.linkedElements)}
                    <Textarea
                      value={section.content}
                      onChange={(e) =>
                        updateContentSection(
                          selectedFile.id,
                          section.id,
                          e.target.value,
                        )
                      }
                      onClick={() => handleSelectLinkedElements(section.id)}
                      onFocus={() => handleSelectLinkedElements(section.id)}
                      onBlur={handleClearSelections}
                      placeholder="Enter markdown content..."
                      className="min-h-[200px] w-full font-mono text-sm"
                      readOnly={!canEdit}
                    />
                  </div>
                ))}
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addContentSection(selectedFile.id)}
                    className="w-full gap-2 border-dashed"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Section
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentItems = getCurrentFolderItems();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 space-y-4 p-1">
        {/* Breadcrumb navigation */}
        <BreadcrumbNavigation
          currentPath={currentPath}
          segments={getBreadcrumbSegments()}
          onNavigateToRoot={goToRoot}
          onNavigateToPath={navigateToPath}
        />

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          {canEdit && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addItem("folder")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Folder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addItem("file")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New File
              </Button>
            </div>
          )}

          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="gap-2"
          >
            <Archive className="h-4 w-4" />
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>
        </div>
      </div>

      {/* File/folder list - scrollable */}
      <div className="flex-1 overflow-y-auto p-1">
        <div className="space-y-1">
          {currentItems.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              {showArchived ? (
                <>
                  <Archive className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No archived items</p>
                  <p className="text-sm">Items you archive will appear here</p>
                </>
              ) : (
                <>
                  <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No items in this folder</p>
                  {canEdit && (
                    <p className="text-sm">
                      Click &quot;New Folder&quot; or &quot;New File&quot; to
                      get started
                    </p>
                  )}
                </>
              )}
            </div>
          ) : (
            currentItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group flex items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                  "cursor-pointer",
                )}
              >
                <div
                  className="flex flex-1 items-center space-x-2"
                  onClick={() => {
                    if (item.type === "folder") {
                      navigateToFolder(item.id);
                    } else {
                      selectFile(item);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (canEdit) {
                      startEditingName(item);
                    }
                  }}
                >
                  {item.type === "folder" ? (
                    <Folder className="h-4 w-4 text-blue-500" />
                  ) : (
                    <File className="h-4 w-4 text-gray-500" />
                  )}
                  {editingItemId === item.id ? (
                    <div className="flex flex-1 items-center space-x-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveNameEdit();
                          } else if (e.key === "Escape") {
                            cancelNameEdit();
                          }
                        }}
                        autoFocus
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveNameEdit();
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelNameEdit();
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </div>
                {!editingItemId && canEdit && (
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingName(item);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {showArchived ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            restoreItem(item.id);
                          }}
                          className="h-8 w-8 p-0 text-green-500 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                          data-testid={`restore-${item.id}`}
                          title={`Restore ${item.name}`}
                        >
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                          data-testid={`delete-${item.id}`}
                          title={`Permanently delete ${item.name}`}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveItem(item.id);
                        }}
                        className="h-8 w-8 p-0 text-orange-500 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-900/20"
                        data-testid={`archive-${item.id}`}
                        title={`Archive ${item.name}`}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DocsFileSystem;
