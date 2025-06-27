import { useCallback } from "react";
import { type DocsFileSystemData, type FileSystemItem, type ContentSectionType } from "../types";

export const useFileSystemOperations = (
  data: DocsFileSystemData,
  onDataChange: (data: DocsFileSystemData) => void,
  canEdit: boolean,
) => {
  // Helper function to find a file by ID
  const findFileById = useCallback((fileId: string): FileSystemItem | null => {
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
  }, [data.items]);

  // Helper function to get content sections for a file
  const getContentSections = useCallback((file: FileSystemItem): ContentSectionType[] => {
    // If file has contentSections, use them; otherwise migrate from old content format
    if (file.contentSections) {
      return file.contentSections;
    } else if (file.content) {
      return [
        {
          id: `section_${file.id}_migration`, // Use file ID to ensure consistency
          title: "Content", // DEFAULT title for migrated content
          content: file.content,
        },
      ];
    } else {
      return [
        {
          id: `section_${file.id}_default`, // Use file ID to ensure consistency
          title: "Introduction", // BETTER default title
          content: "",
        },
      ];
    }
  }, []);

  // Helper function to update content sections for a file
  const updateContentSections = useCallback((
    fileId: string,
    sections: ContentSectionType[],
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
  }, [canEdit, data, onDataChange]);

  // Add new item
  const addItem = useCallback((type: "folder" | "file", currentPath: string[]) => {
    if (!canEdit) return;

    const newItem: FileSystemItem = {
      id: `${type}_${Date.now()}`,
      name: `New ${type}`,
      type,
      content: undefined, // Use contentSections instead
      contentSections:
        type === "file"
          ? [
              {
                id: `section_${Date.now()}`,
                title: "Introduction",
                content: "",
              },
            ]
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
    return newItem.id;
  }, [canEdit, data, onDataChange]);

  // Update item name
  const updateItemName = useCallback((itemId: string, newName: string) => {
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
  }, [canEdit, data, onDataChange]);

  // Archive item and all its descendants
  const archiveItem = useCallback((itemId: string) => {
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
  }, [canEdit, data, onDataChange]);

  // Restore item and all its descendants
  const restoreItem = useCallback((itemId: string) => {
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
  }, [canEdit, data, onDataChange]);

  // Permanently delete item and all its descendants
  const deleteItem = useCallback((itemId: string) => {
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
  }, [canEdit, data, onDataChange]);

  // Add new content section to a file
  const addContentSection = useCallback((fileId: string) => {
    if (!canEdit) return;

    const file = findFileById(fileId);
    if (!file) return;

    const currentSections = getContentSections(file);
    const newSection: ContentSectionType = {
      id: `section_${Date.now()}`,
      title: `Section ${currentSections.length + 1}`,
      content: "",
    };
    const updatedSections = [...currentSections, newSection];

    updateContentSections(fileId, updatedSections);
    return newSection.id;
  }, [canEdit, findFileById, getContentSections, updateContentSections]);

  // Remove content section from a file
  const removeContentSection = useCallback((fileId: string, sectionId: string) => {
    if (!canEdit) return;

    const file = findFileById(fileId);
    if (!file) return;

    const currentSections = getContentSections(file);
    if (currentSections.length <= 1) return; // Don't remove the last section

    const updatedSections = currentSections.filter(
      (section) => section.id !== sectionId,
    );
    updateContentSections(fileId, updatedSections);
  }, [canEdit, findFileById, getContentSections, updateContentSections]);

  // Update specific content section
  const updateContentSection = useCallback((
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
  }, [canEdit, findFileById, getContentSections, updateContentSections]);

  // Update section title
  const updateSectionTitle = useCallback((
    fileId: string,
    sectionId: string,
    title: string,
  ) => {
    if (!canEdit) return;

    const file = findFileById(fileId);
    if (!file) return;

    const currentSections = getContentSections(file);
    const updatedSections = currentSections.map((section) =>
      section.id === sectionId ? { ...section, title: title.trim() } : section,
    );

    updateContentSections(fileId, updatedSections);
  }, [canEdit, findFileById, getContentSections, updateContentSections]);

  // Remove a linked element from a section
  const removeLinkFromSection = useCallback((
    fileId: string,
    sectionId: string,
    elementId: string,
  ) => {
    if (!canEdit) return;

    const file = findFileById(fileId);
    if (!file) return;

    const currentSections = getContentSections(file);
    const updatedSections = currentSections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            linkedElements: section.linkedElements?.filter(
              (el) => el.id !== elementId,
            ),
          }
        : section,
    );

    updateContentSections(fileId, updatedSections);
  }, [canEdit, findFileById, getContentSections, updateContentSections]);

  return {
    findFileById,
    getContentSections,
    updateContentSections,
    addItem,
    updateItemName,
    archiveItem,
    restoreItem,
    deleteItem,
    addContentSection,
    removeContentSection,
    updateContentSection,
    updateSectionTitle,
    removeLinkFromSection,
  };
}; 