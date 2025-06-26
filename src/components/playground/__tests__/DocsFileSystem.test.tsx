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
            contentSections: [
              {
                id: 'section1',
                title: 'Introduction',
                content: '# Welcome\nThis is a readme file.'
              }
            ],
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
                contentSections: [
                  {
                    id: 'section2',
                    title: 'Nested',
                    content: 'Nested file content'
                  }
                ],
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
                    contentSections: [
                      {
                        id: 'section3',
                        title: 'Deep',
                        content: 'Deep nested content'
                      }
                    ],
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
        contentSections: [
          {
            id: 'section4',
            title: 'Root',
            content: 'Root level file'
          }
        ]
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

    it('should select and display file content', () => {
      render(<DocsFileSystem {...defaultProps} />);
      
      const rootFile = screen.getByText('root-file.md');
      fireEvent.click(rootFile);
      
      // Should show file content
      expect(screen.getByDisplayValue('Root')).toBeInTheDocument();
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