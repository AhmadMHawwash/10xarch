import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import BreadcrumbNavigation from "../../BreadcrumbNavigation";
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
  Trash,
  X,
} from "lucide-react";
import { useFileSystemOperations } from "../hooks/useFileSystemOperations";
import {
  type FileSystemItem,
  type DocsFileSystemData,
  type BreadcrumbSegment,
} from "../types";

interface FileSystemBrowserProps {
  data: DocsFileSystemData;
  onDataChange: (data: DocsFileSystemData) => void;
  canEdit: boolean;
  currentPath: string[];
  breadcrumbSegments: BreadcrumbSegment[];
  showArchived: boolean;
  onNavigateToRoot: () => void;
  onNavigateToPath: (pathIndex: number) => void;
  onNavigateToFolder: (folderId: string) => void;
  onSelectFile: (file: FileSystemItem) => void;
  onToggleArchived: () => void;
}

export const FileSystemBrowser: React.FC<FileSystemBrowserProps> = ({
  data,
  onDataChange,
  canEdit,
  currentPath,
  breadcrumbSegments,
  showArchived,
  onNavigateToRoot,
  onNavigateToPath,
  onNavigateToFolder,
  onSelectFile,
  onToggleArchived,
}) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fileSystemOps = useFileSystemOperations(data, onDataChange, canEdit);

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

  // Start editing item name
  const startEditingName = (item: FileSystemItem) => {
    if (!canEdit) return;
    setEditingItemId(item.id);
    setEditingName(item.name);
  };

  // Save name edit
  const saveNameEdit = () => {
    if (editingItemId) {
      fileSystemOps.updateItemName(editingItemId, editingName);
    }
    setEditingItemId(null);
    setEditingName("");
  };

  // Cancel name edit
  const cancelNameEdit = () => {
    setEditingItemId(null);
    setEditingName("");
  };

  const currentItems = getCurrentFolderItems();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 space-y-4 p-1">
        {/* Breadcrumb navigation */}
        <BreadcrumbNavigation
          currentPath={currentPath}
          segments={breadcrumbSegments}
          onNavigateToRoot={onNavigateToRoot}
          onNavigateToPath={onNavigateToPath}
        />

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          {canEdit && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileSystemOps.addItem("folder", currentPath)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Folder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileSystemOps.addItem("file", currentPath)}
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
            onClick={onToggleArchived}
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
                      onNavigateToFolder(item.id);
                    } else {
                      onSelectFile(item);
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
                            fileSystemOps.restoreItem(item.id);
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
                            fileSystemOps.deleteItem(item.id);
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
                          fileSystemOps.archiveItem(item.id);
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