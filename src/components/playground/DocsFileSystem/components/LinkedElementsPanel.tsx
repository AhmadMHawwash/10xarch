import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, Plus, Check, X } from "lucide-react";
import { type SelectedNode, type SelectedEdge } from "../types";

interface LinkedElementsPanelProps {
  linkedElements?: Array<{ id: string; type: "node" | "edge"; name: string }>;
  sectionId?: string;
  fileId?: string;
  canEdit: boolean;
  hideAllLinkedElements: boolean;
  linkingTextAreaId?: string | null;
  currentSelection?: { nodes: SelectedNode[]; edges: SelectedEdge[] };
  onStartLinking?: (textAreaId: string) => void;
  onStopLinking?: () => void;
  onSaveLinking?: () => void;
  onSelectLinkedElements?: (nodeIds: string[], edgeIds: string[]) => void;
  onRemoveLinkFromSection?: (sectionId: string, elementId: string) => void;
}

export const LinkedElementsPanel: React.FC<LinkedElementsPanelProps> = ({
  linkedElements,
  sectionId,
  fileId,
  canEdit,
  hideAllLinkedElements,
  linkingTextAreaId,
  currentSelection,
  onStartLinking,
  onStopLinking,
  onSaveLinking,
  onSelectLinkedElements,
  onRemoveLinkFromSection,
}) => {
  // Always show the section if editing is enabled and linking is available
  if (!canEdit || !onStartLinking || !sectionId) {
    // Only show if there are actual linked elements when not editable
    if (!linkedElements || linkedElements.length === 0) {
      return null;
    }
  }

  const hasLinkedElements = linkedElements && linkedElements.length > 0;
  const isLinkingActive = sectionId
    ? linkingTextAreaId === `${fileId}_${sectionId}`
    : false;
  
  // Get current selection if this section is actively linking
  const currentSelectionForSection = isLinkingActive && currentSelection 
    ? currentSelection 
    : null;
  const hasCurrentSelection = currentSelectionForSection && 
    (currentSelectionForSection.nodes.length > 0 || currentSelectionForSection.edges.length > 0);
  
  if (hideAllLinkedElements) {
    return null;
  }

  // Select linked elements for a section
  const handleSelectLinkedElements = (sectionId: string) => {
    if (!onSelectLinkedElements || !linkedElements) {
      // Clear selections if no linked elements
      onSelectLinkedElements?.([], []);
      return;
    }

    const nodeIds = linkedElements
      .filter((element) => element.type === "node")
      .map((element) => element.id);

    const edgeIds = linkedElements
      .filter((element) => element.type === "edge")
      .map((element) => element.id);

    onSelectLinkedElements(nodeIds, edgeIds);
  };

  return (
    <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
      <div className="mb-2 flex items-center gap-2">
        <Link className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Linked Elements
        </span>
        {hasLinkedElements && (
          <span className="text-xs text-blue-600 dark:text-blue-400">
            ({linkedElements.length})
          </span>
        )}
        {hasCurrentSelection && (
          <span className="text-xs text-orange-600 dark:text-orange-400">
            (+{currentSelectionForSection.nodes.length + currentSelectionForSection.edges.length} selected)
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Only show existing linked elements when NOT in linking mode */}
        {!isLinkingActive && hasLinkedElements &&
          linkedElements.map((element) => (
            <div
              key={element.id}
              className="group relative inline-flex items-center"
            >
              <span
                className={`inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-all hover:scale-105 ${
                  element.type === "node"
                    ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-200 dark:hover:bg-green-900/30"
                    : "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-200 dark:hover:bg-purple-900/30"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  // Select the linked element in the SystemDesigner
                  if (element.type === "node") {
                    onSelectLinkedElements?.([element.id], []);
                  } else {
                    onSelectLinkedElements?.([], [element.id]);
                  }
                }}
                title={`Click to select ${element.name} in diagram`}
              >
                {element.type === "node" ? "⬡" : "→"} {element.name}
              </span>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    sectionId && onRemoveLinkFromSection?.(sectionId, element.id);
                  }}
                  className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-gray-400 p-0 text-white opacity-0 transition-opacity hover:bg-gray-500 group-hover:opacity-100 dark:bg-gray-600 dark:hover:bg-gray-700"
                  title={`Remove ${element.name} link`}
                >
                  <X className="h-2 w-2" />
                </Button>
              )}
            </div>
          ))}

        {/* Show currently selected elements when linking is active */}
        {hasCurrentSelection && currentSelectionForSection && (
          <>
            {currentSelectionForSection.nodes.map((node: SelectedNode) => (
              <div
                key={`selected-${node.id}`}
                className="inline-flex items-center"
              >
                <span
                  className="inline-flex cursor-pointer items-center gap-1 rounded border-2 border-dashed border-orange-300 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-800 transition-all hover:scale-105 hover:bg-orange-100 dark:border-orange-600 dark:bg-orange-900/20 dark:text-orange-200 dark:hover:bg-orange-900/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLinkedElements?.([node.id], []);
                  }}
                  title={`Click to select ${node.data?.title ?? node.data?.name ?? node.id} in diagram`}
                >
                  ⬡ {node.data?.title ?? node.data?.name ?? node.id}
                </span>
              </div>
            ))}
            {currentSelectionForSection.edges.map((edge: SelectedEdge) => (
              <div
                key={`selected-${edge.id}`}
                className="inline-flex items-center"
              >
                <span
                  className="inline-flex cursor-pointer items-center gap-1 rounded border-2 border-dashed border-orange-300 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-800 transition-all hover:scale-105 hover:bg-orange-100 dark:border-orange-600 dark:bg-orange-900/20 dark:text-orange-200 dark:hover:bg-orange-900/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLinkedElements?.([], [edge.id]);
                  }}
                  title={`Click to select ${edge.data?.label ?? `${edge.source} → ${edge.target}`} in diagram`}
                >
                  → {edge.data?.label ?? `${edge.source} → ${edge.target}`}
                </span>
              </div>
            ))}
          </>
        )}

        {canEdit && onStartLinking && sectionId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              const textAreaId = `${fileId}_${sectionId}`;
              if (isLinkingActive) {
                // Save and stop linking
                onSaveLinking?.();
                onStopLinking?.();
              } else {
                // Select all currently linked elements for this section
                handleSelectLinkedElements(sectionId);
                // Start linking mode
                onStartLinking(textAreaId);
              }
            }}
            className={cn(
              "flex items-center gap-1 px-3 py-1 text-xs font-medium transition-all duration-200",
              "rounded-md border-[1px] border-dashed",
              isLinkingActive
                ? "border-blue-300 bg-blue-50/50 text-blue-600 hover:border-blue-400 hover:bg-blue-100/50 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                : hasLinkedElements
                  ? "h-6 w-6 border-blue-300 p-0 text-blue-500 hover:border-blue-400 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-600 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                  : "border-blue-300 bg-blue-50 text-blue-600 hover:border-blue-400 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/50",
            )}
            title={
              isLinkingActive
                ? "Finish linking"
                : hasLinkedElements
                  ? "Add more linked elements"
                  : "Link elements from the diagram"
            }
          >
            {isLinkingActive ? (
              <>
                <Check className="h-3 w-3" />
                <span>Finish</span>
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" />
                {!hasLinkedElements && <span>Link Elements</span>}
              </>
            )}
          </Button>
        )}

        {!hasLinkedElements && (!canEdit || !onStartLinking) && (
          <span className="text-xs italic text-gray-500 dark:text-gray-400">
            No linked elements yet
          </span>
        )}
      </div>
    </div>
  );
}; 