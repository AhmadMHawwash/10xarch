import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DocsFileSystem, { type DocsFileSystemData, type FileSystemItem } from '../DocsFileSystem';

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true),
});

describe('DocsFileSystem', () => {
  const mockOnDataChange = vi.fn();
  
  const createMockData = (): DocsFileSystemData => ({
    items: [
      {
        id: 'folder1',
        name: 'Documents',
        type: 'folder',
        children: [
          {
            id: 'file1',
            name: 'readme.md',
            type: 'file',
            content: '# Welcome\nThis is a readme file.',
            parentId: 'folder1'
          },
          {
            id: 'subfolder1',
            name: 'Subfolder',
            type: 'folder',
            parentId: 'folder1',
            children: [
              {
                id: 'file2',
                name: 'nested.md',
                type: 'file',
                content: 'Nested file content',
                parentId: 'subfolder1'
              },
              {
                id: 'deepfolder',
                name: 'Deep Folder',
                type: 'folder',
                parentId: 'subfolder1',
                children: [
                  {
                    id: 'file3',
                    name: 'deep.md',
                    type: 'file',
                    content: 'Deep nested content',
                    parentId: 'deepfolder'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'file4',
        name: 'root-file.md',
        type: 'file',
        content: 'Root level file'
      }
    ],
    currentPath: []
  });

  const defaultProps = {
    data: createMockData(),
    onDataChange: mockOnDataChange,
    canEdit: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the file system with folders and files', () => {
      render(<DocsFileSystem {...defaultProps} />);
      
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('root-file.md')).toBeInTheDocument();
      expect(screen.getByText('New Folder')).toBeInTheDocument();
      expect(screen.getByText('New File')).toBeInTheDocument();
    });

    it('should show archived toggle button', () => {
      render(<DocsFileSystem {...defaultProps} />);
      
      expect(screen.getByText('Show Archived')).toBeInTheDocument();
    });

    it('should not show edit buttons when canEdit is false', () => {
      render(<DocsFileSystem {...defaultProps} canEdit={false} />);
      
      expect(screen.queryByText('New Folder')).not.toBeInTheDocument();
      expect(screen.queryByText('New File')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate into folders', () => {
      render(<DocsFileSystem {...defaultProps} />);
      
      const documentsFolder = screen.getByText('Documents');
      fireEvent.click(documentsFolder);
      
      // Should show contents of Documents folder
      expect(screen.getByText('readme.md')).toBeInTheDocument();
      expect(screen.getByText('Subfolder')).toBeInTheDocument();
    });

    it('should update currentPath when navigating', () => {
      render(<DocsFileSystem {...defaultProps} />);
      
      const documentsFolder = screen.getByText('Documents');
      fireEvent.click(documentsFolder);
      
      // Should call onDataChange with updated path
      expect(mockOnDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          currentPath: ['folder1']
        })
      );
    });
  });

  describe('File Selection and Editing', () => {
    it('should select and display file content', () => {
      render(<DocsFileSystem {...defaultProps} />);
      
      // Navigate to Documents folder first
      fireEvent.click(screen.getByText('Documents'));
      
      // Click on readme.md file
      fireEvent.click(screen.getByText('readme.md'));
      
      // Should show file content
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('This is a readme file.')).toBeInTheDocument();
    });

    it('should show file editing interface when file is selected', () => {
      render(<DocsFileSystem {...defaultProps} />);
      
      // Navigate and select file
      fireEvent.click(screen.getByText('Documents'));
      fireEvent.click(screen.getByText('readme.md'));
      
      // Should show file editing interface (file name appears in multiple places)
      expect(screen.getAllByText('readme.md').length).toBeGreaterThan(0);
      
      // Should show edit/preview toggle buttons
      const buttons = screen.getAllByRole('button');
      const editButton = buttons.find(btn => btn.querySelector('svg.lucide-pencil'));
      const previewButton = buttons.find(btn => btn.querySelector('svg.lucide-eye'));
      
      expect(editButton).toBeInTheDocument();
      expect(previewButton).toBeInTheDocument();
      
      // Should show file content (either in preview or edit mode)
      const hasPreviewContent = screen.queryByText('Welcome') && screen.queryByText('This is a readme file.');
      const hasEditTextarea = screen.queryByRole('textbox');
      
      // Should have either preview content or edit textarea
      expect(hasPreviewContent ?? hasEditTextarea).toBeTruthy();
    });
  });

  describe('Recursive Archiving', () => {
    it('should archive a single file', () => {
      render(<DocsFileSystem {...defaultProps} />);
      
      // Navigate to Documents folder
      fireEvent.click(screen.getByText('Documents'));
      
      // Find and click archive button for readme.md using data-testid
      const archiveButton = screen.getByTestId('archive-file1');
      fireEvent.click(archiveButton);
      
      // Should call onDataChange with archived file
      expect(mockOnDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              id: 'folder1',
              children: expect.arrayContaining([
                expect.objectContaining({
                  id: 'file1',
                  archived: true
                })
              ])
            })
          ])
        })
      );
    });

    it('should recursively archive folder and all descendants', () => {
      render(<DocsFileSystem {...defaultProps} />);
      
      // Find and click archive button for Documents folder using data-testid
      const archiveButton = screen.getByTestId('archive-folder1');
      fireEvent.click(archiveButton);
      
      // Should call onDataChange with recursively archived folder
      expect(mockOnDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              id: 'folder1',
              archived: true,
              children: expect.arrayContaining([
                expect.objectContaining({
                  id: 'file1',
                  archived: true // File should be archived
                }),
                expect.objectContaining({
                  id: 'subfolder1',
                  archived: true, // Subfolder should be archived
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      id: 'file2',
                      archived: true // Nested file should be archived
                    }),
                    expect.objectContaining({
                      id: 'deepfolder',
                      archived: true, // Deep folder should be archived
                      children: expect.arrayContaining([
                        expect.objectContaining({
                          id: 'file3',
                          archived: true // Deep nested file should be archived
                        })
                      ])
                    })
                  ])
                })
              ])
            })
          ])
        })
      );
    });

    it('should not show archived items in normal view', () => {
      const dataWithArchivedItems: DocsFileSystemData = {
        items: [
          {
            id: 'folder1',
            name: 'Documents',
            type: 'folder',
            archived: true,
            children: []
          },
          {
            id: 'file1',
            name: 'visible-file.md',
            type: 'file',
            content: 'Visible content'
          }
        ],
        currentPath: []
      };

      render(<DocsFileSystem {...defaultProps} data={dataWithArchivedItems} />);
      
      // Should not show archived folder
      expect(screen.queryByText('Documents')).not.toBeInTheDocument();
      // Should show non-archived file
      expect(screen.getByText('visible-file.md')).toBeInTheDocument();
    });

    it('should show archived items when "Show Archived" is toggled', () => {
      const dataWithArchivedItems: DocsFileSystemData = {
        items: [
          {
            id: 'folder1',
            name: 'Archived Folder',
            type: 'folder',
            archived: true,
            children: []
          },
          {
            id: 'file1',
            name: 'active-file.md',
            type: 'file',
            content: 'Active content'
          }
        ],
        currentPath: []
      };

      render(<DocsFileSystem {...defaultProps} data={dataWithArchivedItems} />);
      
      // Toggle to show archived
      fireEvent.click(screen.getByText('Show Archived'));
      
      // Should show archived folder
      expect(screen.getByText('Archived Folder')).toBeInTheDocument();
      // Should not show active file in archived view
      expect(screen.queryByText('active-file.md')).not.toBeInTheDocument();
    });
  });

  describe('Recursive Restoring', () => {
    it('should recursively restore folder and all descendants', () => {
      const dataWithArchivedFolder: DocsFileSystemData = {
        items: [
          {
            id: 'folder1',
            name: 'Archived Folder',
            type: 'folder',
            archived: true,
            children: [
              {
                id: 'file1',
                name: 'archived-file.md',
                type: 'file',
                content: 'Archived content',
                archived: true,
                parentId: 'folder1'
              },
              {
                id: 'subfolder1',
                name: 'Archived Subfolder',
                type: 'folder',
                archived: true,
                parentId: 'folder1',
                children: [
                  {
                    id: 'file2',
                    name: 'deep-archived.md',
                    type: 'file',
                    content: 'Deep archived content',
                    archived: true,
                    parentId: 'subfolder1'
                  }
                ]
              }
            ]
          }
        ],
        currentPath: []
      };

      render(<DocsFileSystem {...defaultProps} data={dataWithArchivedFolder} />);
      
      // Toggle to show archived items
      fireEvent.click(screen.getByText('Show Archived'));
      
      // Find and click restore button for archived folder using data-testid
      const restoreButton = screen.getByTestId('restore-folder1');
      fireEvent.click(restoreButton);
      
      // Should call onDataChange with recursively restored folder
      expect(mockOnDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              id: 'folder1',
              archived: false,
              children: expect.arrayContaining([
                expect.objectContaining({
                  id: 'file1',
                  archived: false // File should be restored
                }),
                expect.objectContaining({
                  id: 'subfolder1',
                  archived: false, // Subfolder should be restored
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      id: 'file2',
                      archived: false // Deep file should be restored
                    })
                  ])
                })
              ])
            })
          ])
        })
      );
    });
  });

  describe('Item Creation', () => {
    it('should create new folder', () => {
      render(<DocsFileSystem {...defaultProps} />);
      
      fireEvent.click(screen.getByText('New Folder'));
      
      expect(mockOnDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              type: 'folder',
              name: 'New folder',
              children: []
            })
          ])
        })
      );
    });

    it('should create new file', () => {
      render(<DocsFileSystem {...defaultProps} />);
      
      fireEvent.click(screen.getByText('New File'));
      
      expect(mockOnDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              type: 'file',
              name: 'New file',
              contentSections: expect.arrayContaining([
                expect.objectContaining({
                  content: ''
                })
              ])
            })
          ])
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data gracefully', () => {
      const emptyData: DocsFileSystemData = {
        items: [],
        currentPath: []
      };

      render(<DocsFileSystem {...defaultProps} data={emptyData} />);
      
      expect(screen.getByText('No items in this folder')).toBeInTheDocument();
    });

    it('should handle invalid currentPath gracefully', () => {
      const dataWithInvalidPath: DocsFileSystemData = {
        items: [
          {
            id: 'folder1',
            name: 'Documents',
            type: 'folder',
            children: []
          }
        ],
        currentPath: ['nonexistent-folder']
      };

      render(<DocsFileSystem {...defaultProps} data={dataWithInvalidPath} />);
      
      // Should show empty state when path doesn't exist
      expect(screen.getByText('No items in this folder')).toBeInTheDocument();
    });
  });
}); 