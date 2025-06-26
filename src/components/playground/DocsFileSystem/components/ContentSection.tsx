import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, X, Trash } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { LinkedElementsPanel } from "./LinkedElementsPanel";
import { type ContentSectionType, type SelectedNode, type SelectedEdge } from "../types";

interface ContentSectionProps {
  section: ContentSectionType;
  index: number;
  totalSections: number;
  fileId: string;
  canEdit: boolean;
  focusedSectionId: string | null;
  confirmingDeleteSection: string | null;
  hideAllLinkedElements: boolean;
  linkingTextAreaId?: string | null;
  currentSelection?: { nodes: SelectedNode[]; edges: SelectedEdge[] };
  onFocusSection: (sectionId: string) => void;
  onBlurSection: () => void;
  onUpdateSectionContent: (content: string) => void;
  onUpdateSectionTitle: (title: string) => void;
  onDeleteSection: () => void;
  onStartConfirmingDelete: () => void;
  onCancelConfirmingDelete: () => void;
  onStartLinking?: (textAreaId: string) => void;
  onStopLinking?: () => void;
  onSaveLinking?: () => void;
  onSelectLinkedElements?: (nodeIds: string[], edgeIds: string[]) => void;
  onRemoveLinkFromSection?: (sectionId: string, elementId: string) => void;
  onSelectLinkedElementsForSection?: (sectionId: string) => void;
  onClearSelections?: () => void;
}

// Helper function to create Notion-like textarea styling
const getNotionStyleTextareaClasses = (isFocused: boolean) => {
  return cn(
    "w-full border-none bg-transparent resize-y outline-none transition-all duration-200",
    "font-sans text-sm leading-relaxed",
    isFocused
      ? "ring-2 ring-blue-500/20 bg-white dark:bg-gray-900 rounded-md p-3 shadow-sm"
      : "p-2 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-md cursor-text",
  );
};

export const ContentSection: React.FC<ContentSectionProps> = ({
  section,
  index,
  totalSections,
  fileId,
  canEdit,
  focusedSectionId,
  confirmingDeleteSection,
  hideAllLinkedElements,
  linkingTextAreaId,
  currentSelection,
  onFocusSection,
  onBlurSection,
  onUpdateSectionContent,
  onUpdateSectionTitle,
  onDeleteSection,
  onStartConfirmingDelete,
  onCancelConfirmingDelete,
  onStartLinking,
  onStopLinking,
  onSaveLinking,
  onSelectLinkedElements,
  onRemoveLinkFromSection,
  onSelectLinkedElementsForSection,
  onClearSelections,
}) => {
  const [editingSectionTitle, setEditingSectionTitle] = useState<boolean>(false);
  const [tempSectionTitle, setTempSectionTitle] = useState("");

  const startEditingSectionTitle = () => {
    if (!canEdit) return;
    setEditingSectionTitle(true);
    setTempSectionTitle(section.title ?? `Section ${index + 1}`);
  };

  const saveSectionTitle = () => {
    if (!canEdit) return;
    onUpdateSectionTitle(tempSectionTitle.trim());
    setEditingSectionTitle(false);
    setTempSectionTitle("");
  };

  const cancelSectionTitleEdit = () => {
    setEditingSectionTitle(false);
    setTempSectionTitle("");
  };

  const renderCurrentSelection = () => {
    const expectedLinkingId = `${fileId}_${section.id}`;
    const isActiveLinkingSection = linkingTextAreaId === expectedLinkingId;

    if (!isActiveLinkingSection || !currentSelection) {
      return null;
    }

    const { nodes: selectedNodes, edges: selectedEdges } = currentSelection;
    const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

    if (!hasSelection) {
      return (
        <div className="mb-3 rounded-md border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-700 dark:bg-blue-900/10">
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Click elements to select them for linking
            </span>
          </div>
        </div>
      );
    }

    // Don't show the "Selected for Linking" section - it's removed as requested
    return null;
  };

  return (
    <div 
      className="space-y-3 cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
      onClick={() => onSelectLinkedElementsForSection?.(section.id)}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {editingSectionTitle ? (
            <Input
              value={tempSectionTitle}
              onChange={(e) => setTempSectionTitle(e.target.value)}
              onBlur={saveSectionTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveSectionTitle();
                if (e.key === "Escape") cancelSectionTitleEdit();
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-8 text-sm font-medium border-dashed border-gray-300 bg-gray-50/50 dark:border-gray-600 dark:bg-gray-800/50"
              placeholder="Section title..."
              autoFocus
            />
          ) : (
            <Input
              value={section.title ?? `Section ${index + 1}`}
              onChange={() => undefined} // Read-only display
              onClick={(e) => {
                e.stopPropagation();
                if (canEdit) {
                  startEditingSectionTitle();
                }
              }}
              className="h-8 text-sm font-medium border-dashed border-gray-200 bg-gray-50/30 cursor-text hover:border-gray-300 hover:bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/30 dark:hover:border-gray-600 dark:hover:bg-gray-800/50"
              placeholder="Section title..."
              readOnly
            />
          )}
        </div>
        <div className="flex items-center space-x-1">
          {canEdit &&
            totalSections > 1 &&
            (confirmingDeleteSection === section.id ? (
              <div className="flex items-center space-x-1">
                <span className="text-sm text-red-500">
                  delete section?
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection();
                  }}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  title="Confirm delete"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelConfirmingDelete();
                  }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onStartConfirmingDelete();
                }}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                title="Remove section"
              >
                <Trash className="h-3 w-3" />
              </Button>
            ))}
        </div>
      </div>

      {/* Linking UI */}
      {renderCurrentSelection()}
      <LinkedElementsPanel
        linkedElements={section.linkedElements}
        sectionId={section.id}
        fileId={fileId}
        canEdit={canEdit}
        hideAllLinkedElements={hideAllLinkedElements}
        linkingTextAreaId={linkingTextAreaId}
        currentSelection={currentSelection}
        onStartLinking={onStartLinking}
        onStopLinking={onStopLinking}
        onSaveLinking={onSaveLinking}
        onSelectLinkedElements={onSelectLinkedElements}
        onRemoveLinkFromSection={onRemoveLinkFromSection}
      />

      {/* Content - Notion-style inline editing with markdown preview */}
      <div className="relative">
        {focusedSectionId === section.id ? (
          // Edit mode: Show textarea with markdown hints
          <div className="space-y-2">
            <Textarea
              value={section.content}
              onChange={(e) => onUpdateSectionContent(e.target.value)}
              onFocus={() => {
                onFocusSection(section.id);
                onSelectLinkedElementsForSection?.(section.id);
              }}
              onBlur={() => {
                onBlurSection();
                onClearSelections?.();
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Type your markdown content here..."
              className={getNotionStyleTextareaClasses(true)}
              style={{
                minHeight: "120px",
                height: "auto",
              }}
              readOnly={!canEdit}
              autoFocus
            />
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span>**bold**</span>
                <span>*italic*</span>
                <span># Heading</span>
                <span>`code`</span>
                <span>[link](url)</span>
              </div>
              <span>Click outside to preview</span>
            </div>
          </div>
        ) : (
          // Preview mode: Show rendered markdown
          <div
            className={cn(
              "min-h-[60px] cursor-text transition-all duration-200",
              "rounded-md p-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/50",
              section.content
                ? ""
                : "flex items-center justify-center",
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (canEdit) {
                onFocusSection(section.id);
                onSelectLinkedElementsForSection?.(section.id);
              }
            }}
          >
            {section.content ? (
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:mb-2 prose-headings:mt-4 prose-p:my-2 prose-li:my-1">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // Customize rendering to match the app's design
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-xl font-bold text-gray-900 dark:text-gray-100"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-base font-medium text-gray-900 dark:text-gray-100"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        className="leading-relaxed text-gray-700 dark:text-gray-300"
                        {...props}
                      />
                    ),
                    code: ({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }: any) => {
                      if (inline) {
                        return (
                          <code
                            className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code
                          className="block overflow-x-auto rounded bg-gray-100 p-3 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className="list-inside list-decimal space-y-1 text-gray-700 dark:text-gray-300"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li
                        className="text-gray-700 dark:text-gray-300"
                        {...props}
                      />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="text-blue-600 hover:underline dark:text-blue-400"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto">
                        <table
                          className="min-w-full border border-gray-200 dark:border-gray-700"
                          {...props}
                        />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold dark:border-gray-700 dark:bg-gray-800"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td
                        className="border border-gray-200 px-3 py-2 dark:border-gray-700"
                        {...props}
                      />
                    ),
                  }}
                >
                  {section.content}
                </ReactMarkdown>
              </div>
            ) : (
              <span className="text-sm text-gray-400">
                Click to add content...
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 