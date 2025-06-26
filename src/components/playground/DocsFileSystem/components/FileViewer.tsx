import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Plus, X } from "lucide-react";
import BreadcrumbNavigation from "../../BreadcrumbNavigation";
import { ContentSection } from "./ContentSection";
import { useFileSystemOperations } from "../hooks/useFileSystemOperations";
import {
  type FileSystemItem,
  type DocsFileSystemData,
  type BreadcrumbSegment,
  type SelectedNode,
  type SelectedEdge,
} from "../types";

interface FileViewerProps {
  selectedFile: FileSystemItem;
  data: DocsFileSystemData;
  onDataChange: (data: DocsFileSystemData) => void;
  canEdit: boolean;
  currentPath: string[];
  breadcrumbSegments: BreadcrumbSegment[];
  linkingTextAreaId?: string | null;
  currentSelection?: { nodes: SelectedNode[]; edges: SelectedEdge[] };
  onNavigateToRoot: () => void;
  onNavigateToPath: (pathIndex: number) => void;
  onCloseFile: () => void;
  onStartLinking?: (textAreaId: string) => void;
  onStopLinking?: () => void;
  onSaveLinking?: () => void;
  onSelectLinkedElements?: (nodeIds: string[], edgeIds: string[]) => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({
  selectedFile,
  data,
  onDataChange,
  canEdit,
  currentPath,
  breadcrumbSegments,
  linkingTextAreaId,
  currentSelection,
  onNavigateToRoot,
  onNavigateToPath,
  onCloseFile,
  onStartLinking,
  onStopLinking,
  onSaveLinking,
  onSelectLinkedElements,
}) => {
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);
  const [confirmingDeleteSection, setConfirmingDeleteSection] = useState<
    string | null
  >(null);
  const [hideAllLinkedElements, setHideAllLinkedElements] =
    useState<boolean>(false);

  const fileSystemOps = useFileSystemOperations(data, onDataChange, canEdit);

  const contentSections = fileSystemOps.getContentSections(selectedFile);

  // Select linked elements for a section
  const handleSelectLinkedElements = (sectionId: string) => {
    if (!onSelectLinkedElements) return;

    const section = contentSections.find((s) => s.id === sectionId);
    if (!section?.linkedElements) {
      // Clear selections if no linked elements
      onSelectLinkedElements([], []);
      return;
    }

    const nodeIds = section.linkedElements
      .filter((element) => element.type === "node")
      .map((element) => element.id);

    const edgeIds = section.linkedElements
      .filter((element) => element.type === "edge")
      .map((element) => element.id);

    onSelectLinkedElements(nodeIds, edgeIds);
  };

  // Clear selections
  const handleClearSelections = () => {
    if (onSelectLinkedElements) {
      onSelectLinkedElements([], []);
    }
  };

  // Toggle all linked elements sections visibility
  const toggleAllLinkedElements = () => {
    setHideAllLinkedElements(!hideAllLinkedElements);
  };

  // Start confirming section deletion
  const startConfirmingDeleteSection = (sectionId: string) => {
    setConfirmingDeleteSection(sectionId);
  };

  // Cancel section deletion
  const cancelDeleteSection = () => {
    setConfirmingDeleteSection(null);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 p-1">
        {/* Breadcrumb navigation */}
        <BreadcrumbNavigation
          currentPath={currentPath}
          segments={breadcrumbSegments}
          onNavigateToRoot={onNavigateToRoot}
          onNavigateToPath={onNavigateToPath}
          currentFileName={selectedFile.name}
        />
      </div>

      {/* File viewer/editor - scrollable */}
      <div className="flex-1 overflow-y-auto p-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{selectedFile.name}</Label>
            <div className="flex items-center space-x-2">
              {/* Global linked elements toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllLinkedElements}
                className={`h-8 gap-2 ${
                  hideAllLinkedElements 
                    ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700" 
                    : "bg-white text-blue-500 hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
                }`}
                title={
                  hideAllLinkedElements
                    ? "Show all linked elements"
                    : "Hide all linked elements"
                }
              >
                {hideAllLinkedElements ? (
                  <>
                    <Eye className="h-4 w-4" />
                    <span className="text-xs">Show Links</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span className="text-xs">Hide Links</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCloseFile}
                className="h-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notion-style inline editing */}
          <div className="space-y-4">
            {contentSections.map((section, index) => (
              <ContentSection
                key={section.id}
                section={section}
                index={index}
                totalSections={contentSections.length}
                fileId={selectedFile.id}
                canEdit={canEdit}
                focusedSectionId={focusedSectionId}
                confirmingDeleteSection={confirmingDeleteSection}
                hideAllLinkedElements={hideAllLinkedElements}
                linkingTextAreaId={linkingTextAreaId}
                currentSelection={currentSelection}
                onFocusSection={setFocusedSectionId}
                onBlurSection={() => setFocusedSectionId(null)}
                onUpdateSectionContent={(content) =>
                  fileSystemOps.updateContentSection(
                    selectedFile.id,
                    section.id,
                    content,
                  )
                }
                onUpdateSectionTitle={(title) =>
                  fileSystemOps.updateSectionTitle(
                    selectedFile.id,
                    section.id,
                    title,
                  )
                }
                onDeleteSection={() => {
                  fileSystemOps.removeContentSection(
                    selectedFile.id,
                    section.id,
                  );
                  setConfirmingDeleteSection(null);
                }}
                onStartConfirmingDelete={() =>
                  startConfirmingDeleteSection(section.id)
                }
                onCancelConfirmingDelete={cancelDeleteSection}
                onStartLinking={onStartLinking}
                onStopLinking={onStopLinking}
                onSaveLinking={onSaveLinking}
                onSelectLinkedElements={onSelectLinkedElements}
                onRemoveLinkFromSection={(sectionId, elementId) =>
                  fileSystemOps.removeLinkFromSection(
                    selectedFile.id,
                    sectionId,
                    elementId,
                  )
                }
                onSelectLinkedElementsForSection={handleSelectLinkedElements}
                onClearSelections={handleClearSelections}
              />
            ))}
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileSystemOps.addContentSection(selectedFile.id);
                }}
                className="w-full gap-2 border-dashed"
              >
                <Plus className="h-4 w-4" />
                Add New Section
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 