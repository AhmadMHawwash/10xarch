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
  Pencil,
  Plus,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

// Types for the file system
export interface FileSystemItem {
  id: string;
  name: string;
  type: "folder" | "file";
  content?: string; // For files
  children?: FileSystemItem[]; // For folders
  parentId?: string;
  archived?: boolean; // For archiving instead of deleting
}

export interface DocsFileSystemData {
  items: FileSystemItem[];
  currentPath: string[];
}

interface DocsFileSystemProps {
  data: DocsFileSystemData;
  onDataChange: (data: DocsFileSystemData) => void;
  canEdit: boolean;
}

const DocsFileSystem = ({ data, onDataChange, canEdit }: DocsFileSystemProps) => {
  const [currentPath, setCurrentPath] = useState<string[]>(data.currentPath || []);
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  // Update data when path changes
  useEffect(() => {
    if (data.currentPath !== currentPath) {
      onDataChange({ ...data, currentPath });
    }
  }, [currentPath, data, onDataChange]);



  // Get current folder items
  const getCurrentFolderItems = (): FileSystemItem[] => {
    let current = data.items;
    for (const pathSegment of currentPath) {
      const folder = current.find(item => item.id === pathSegment && item.type === "folder");
      if (folder?.children) {
        current = folder.children;
      } else {
        return [];
      }
    }
    // Filter based on archived status
    if (showArchived) {
      return current.filter(item => item.archived === true);
    } else {
      return current.filter(item => !item.archived);
    }
  };

  // Add new item
  const addItem = (type: "folder" | "file") => {
    if (!canEdit) return;

    const newItem: FileSystemItem = {
      id: `${type}_${Date.now()}`,
      name: `New ${type}`,
      type,
      content: type === "file" ? "" : undefined,
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
        return items.map(item => {
          if (item.id === currentPath[currentPath.length - 1] && item.type === "folder") {
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
      return items.map(item => {
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

  // Update file content
  const updateFileContent = (content: string) => {
    if (!canEdit || !selectedFile) return;

    const updateItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map(item => {
        if (item.id === selectedFile.id) {
          return { ...item, content };
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
    setSelectedFile({ ...selectedFile, content });
  };

  // Archive item and all its descendants
  const archiveItem = (itemId: string) => {
    if (!canEdit) return;

    if (!confirm("Are you sure you want to archive this item? You can restore it later from the archived items.")) {
      return;
    }

    // Recursively archive an item and all its children
    const archiveItemRecursively = (item: FileSystemItem): FileSystemItem => {
      const archivedItem = { ...item, archived: true };
      
      // If it's a folder, archive all children recursively
      if (archivedItem.children) {
        archivedItem.children = archivedItem.children.map(child => 
          archiveItemRecursively(child)
        );
      }
      
      return archivedItem;
    };

    const archiveInItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map(item => {
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
        restoredItem.children = restoredItem.children.map(child => 
          restoreItemRecursively(child)
        );
      }
      
      return restoredItem;
    };

    const restoreInItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map(item => {
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
    return currentPath.map(pathId => ({
      id: pathId,
      name: getFolderName(pathId)
    }));
  };

  // Render markdown
  const renderMarkdown = (content: string) => {
    // Simple markdown rendering - you can replace this with a proper markdown library
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
          return <p key={index} className="font-bold mb-1">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
          return <p key={index} className="italic mb-1">{line.slice(1, -1)}</p>;
        }
        return <p key={index} className="mb-1">{line ?? <br />}</p>;
      });
  };

  if (selectedFile) {
    return (
      <div className="space-y-4 p-1">
        {/* Breadcrumb navigation */}
        <BreadcrumbNavigation
          currentPath={currentPath}
          segments={getBreadcrumbSegments()}
          onNavigateToRoot={goToRoot}
          onNavigateToPath={navigateToPath}
          currentFileName={selectedFile.name}
        />

        {/* File viewer/editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {selectedFile.name}
            </Label>
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
            <div className="min-h-[300px] w-full p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
              {selectedFile.content ? (
                <div className="prose dark:prose-invert max-w-none">
                  {renderMarkdown(selectedFile.content)}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No content yet. Click edit to add content.
                </p>
              )}
            </div>
          ) : (
            <Textarea
              value={selectedFile.content ?? ""}
              onChange={(e) => updateFileContent(e.target.value)}
              placeholder="Enter markdown content..."
              className="min-h-[300px] w-full font-mono text-sm"
              readOnly={!canEdit}
            />
          )}
        </div>
      </div>
    );
  }

  const currentItems = getCurrentFolderItems();

  return (
    <div className="space-y-4 p-1">
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

      {/* File/folder list */}
      <div className="space-y-1">
        {currentItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {showArchived ? (
              <>
                <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No archived items</p>
                <p className="text-sm">Items you archive will appear here</p>
              </>
            ) : (
              <>
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No items in this folder</p>
                {canEdit && (
                  <p className="text-sm">Click &quot;New Folder&quot; or &quot;New File&quot; to get started</p>
                )}
              </>
            )}
          </div>
        ) : (
          currentItems.map((item) => (
                         <div
               key={item.id}
               className={cn(
                 "group flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                 "cursor-pointer"
               )}
             >
                             <div
                 className="flex items-center space-x-2 flex-1"
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
                  <div className="flex items-center space-x-2 flex-1">
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
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={(e) => {
                         e.stopPropagation();
                         restoreItem(item.id);
                       }}
                       className="h-8 w-8 p-0 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                       data-testid={`restore-${item.id}`}
                       title={`Restore ${item.name}`}
                     >
                       <ArchiveRestore className="h-4 w-4" />
                     </Button>
                   ) : (
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={(e) => {
                         e.stopPropagation();
                         archiveItem(item.id);
                       }}
                       className="h-8 w-8 p-0 text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
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
  );
};

export default DocsFileSystem; 