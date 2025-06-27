"use client";

import { useEffect, useState } from "react";
import { FileSystemBrowser, FileViewer } from "./components";
import { useFileSystemOperations } from "./hooks/useFileSystemOperations";
import {
  type DocsFileSystemProps,
  type FileSystemItem,
  type BreadcrumbSegment,
} from "./types";

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
  const [showArchived, setShowArchived] = useState(false);

  const fileSystemOps = useFileSystemOperations(data, onDataChange, canEdit);

  // Update selectedFile when data changes to ensure it's always current
  useEffect(() => {
    if (selectedFile) {
      const updatedFile = fileSystemOps.findFileById(selectedFile.id);
      if (updatedFile && updatedFile !== selectedFile) {
        setSelectedFile(updatedFile);
      }
    }
  }, [data, selectedFile, fileSystemOps]);

  // Update data when path changes
  useEffect(() => {
    if (data.currentPath !== currentPath) {
      onDataChange({ ...data, currentPath });
    }
  }, [currentPath, data, onDataChange]);

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
  };

  // Close file
  const closeFile = () => {
    setSelectedFile(null);
  };

  // Toggle archived view
  const toggleArchived = () => {
    setShowArchived(!showArchived);
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
  const getBreadcrumbSegments = (): BreadcrumbSegment[] => {
    return currentPath.map((pathId) => ({
      id: pathId,
      name: getFolderName(pathId),
    }));
  };

  if (selectedFile) {
    return (
      <FileViewer
        selectedFile={selectedFile}
        data={data}
        onDataChange={onDataChange}
        canEdit={canEdit}
        currentPath={currentPath}
        breadcrumbSegments={getBreadcrumbSegments()}
        linkingTextAreaId={linkingTextAreaId}
        currentSelection={currentSelection}
        onNavigateToRoot={goToRoot}
        onNavigateToPath={navigateToPath}
        onCloseFile={closeFile}
        onStartLinking={onStartLinking}
        onStopLinking={onStopLinking}
        onSaveLinking={onSaveLinking}
        onSelectLinkedElements={onSelectLinkedElements}
      />
    );
  }

  return (
    <FileSystemBrowser
      data={data}
      onDataChange={onDataChange}
      canEdit={canEdit}
      currentPath={currentPath}
      breadcrumbSegments={getBreadcrumbSegments()}
      showArchived={showArchived}
      onNavigateToRoot={goToRoot}
      onNavigateToPath={navigateToPath}
      onNavigateToFolder={navigateToFolder}
      onSelectFile={selectFile}
      onToggleArchived={toggleArchived}
    />
  );
};

export default DocsFileSystem;

// Re-export types for backward compatibility
export type {
  DocsFileSystemData,
  FileSystemItem,
  DocsFileSystemProps,
} from "./types"; 