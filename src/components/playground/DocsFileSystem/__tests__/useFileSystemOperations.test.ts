import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileSystemOperations } from '../hooks/useFileSystemOperations';
import { type DocsFileSystemData } from '../types';

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true),
});

describe('useFileSystemOperations', () => {
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
                content: '# Welcome\nThis is a readme file.',
              },
            ],
            parentId: 'folder1'
          }
        ]
      },
      {
        id: 'file2',
        name: 'root-file.md',
        type: 'file',
        contentSections: [
          {
            id: 'section2',
            title: 'Root Content',
            content: 'Root level file'
          }
        ]
      }
    ],
    currentPath: []
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(window.confirm).mockReturnValue(true);
  });

  it('should find file by ID in root level', () => {
    const { result } = renderHook(() => 
      useFileSystemOperations(createMockData(), mockOnDataChange, true)
    );

    const file = result.current.findFileById('file2');
    expect(file).toBeDefined();
    expect(file?.name).toBe('root-file.md');
  });

  it('should add new file to root level', () => {
    const { result } = renderHook(() => 
      useFileSystemOperations(createMockData(), mockOnDataChange, true)
    );

    act(() => {
      result.current.addItem('file', []);
    });

    expect(mockOnDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            type: 'file',
            name: 'New file',
            contentSections: expect.arrayContaining([
              expect.objectContaining({
                title: 'Introduction',
                content: ''
              })
            ])
          })
        ])
      })
    );
  });

  it('should update item name', () => {
    const { result } = renderHook(() => 
      useFileSystemOperations(createMockData(), mockOnDataChange, true)
    );

    act(() => {
      result.current.updateItemName('file2', 'renamed-file.md');
    });

    expect(mockOnDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: 'file2',
            name: 'renamed-file.md'
          })
        ])
      })
    );
  });

  it('should not update when canEdit is false', () => {
    const { result } = renderHook(() => 
      useFileSystemOperations(createMockData(), mockOnDataChange, false)
    );

    act(() => {
      result.current.updateItemName('file2', 'new-name');
    });

    expect(mockOnDataChange).not.toHaveBeenCalled();
  });

  describe('findFileById', () => {
    it('should find file by ID in nested structure', () => {
      const { result } = renderHook(() => 
        useFileSystemOperations(createMockData(), mockOnDataChange, true)
      );

      const file = result.current.findFileById('file1');
      expect(file).toBeDefined();
      expect(file!.name).toBe('readme.md');
    });

    it('should return null for non-existent file', () => {
      const { result } = renderHook(() => 
        useFileSystemOperations(createMockData(), mockOnDataChange, true)
      );

      const file = result.current.findFileById('nonexistent');
      expect(file).toBeNull();
    });
  });

  describe('getContentSections', () => {
    it('should return existing contentSections', () => {
      const { result } = renderHook(() => 
        useFileSystemOperations(createMockData(), mockOnDataChange, true)
      );

      const file = result.current.findFileById('file1')!;
      const sections = result.current.getContentSections(file);
      
      expect(sections).toHaveLength(1);
      expect(sections[0]!.title).toBe('Introduction');
      expect(sections[0]!.content).toBe('# Welcome\nThis is a readme file.');
    });

    it('should migrate from old content format', () => {
      const data: DocsFileSystemData = {
        items: [
          {
            id: 'oldFile',
            name: 'old.md',
            type: 'file',
            content: 'Old content format'
          }
        ],
        currentPath: []
      };

      const { result } = renderHook(() => 
        useFileSystemOperations(data, mockOnDataChange, true)
      );

      const file = result.current.findFileById('oldFile')!;
      const sections = result.current.getContentSections(file);
      
      expect(sections).toHaveLength(1);
      expect(sections[0]!.title).toBe('Content');
      expect(sections[0]!.content).toBe('Old content format');
    });

    it('should create default section for empty file', () => {
      const data: DocsFileSystemData = {
        items: [
          {
            id: 'emptyFile',
            name: 'empty.md',
            type: 'file'
          }
        ],
        currentPath: []
      };

      const { result } = renderHook(() => 
        useFileSystemOperations(data, mockOnDataChange, true)
      );

      const file = result.current.findFileById('emptyFile')!;
      const sections = result.current.getContentSections(file);
      
      expect(sections).toHaveLength(1);
      expect(sections[0]!.title).toBe('Introduction');
      expect(sections[0]!.content).toBe('');
    });
  });

  describe('addItem', () => {
    it('should add new folder to nested path', () => {
      const { result } = renderHook(() => 
        useFileSystemOperations(createMockData(), mockOnDataChange, true)
      );

      act(() => {
        result.current.addItem('folder', ['folder1']);
      });

      expect(mockOnDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              id: 'folder1',
              children: expect.arrayContaining([
                expect.objectContaining({
                  type: 'folder',
                  name: 'New folder',
                  children: []
                })
              ])
            })
          ])
        })
      );
    });

    it('should not add item when canEdit is false', () => {
      const { result } = renderHook(() => 
        useFileSystemOperations(createMockData(), mockOnDataChange, false)
      );

      act(() => {
        result.current.addItem('file', []);
      });

      expect(mockOnDataChange).not.toHaveBeenCalled();
    });
  });

  describe('archiveItem', () => {
    it('should archive item and its children', () => {
      const { result } = renderHook(() => 
        useFileSystemOperations(createMockData(), mockOnDataChange, true)
      );

      act(() => {
        result.current.archiveItem('folder1');
      });

      expect(mockOnDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              id: 'folder1',
              archived: true,
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

    it('should not archive when user cancels confirmation', () => {
      vi.mocked(window.confirm).mockReturnValue(false);
      
      const { result } = renderHook(() => 
        useFileSystemOperations(createMockData(), mockOnDataChange, true)
      );

      act(() => {
        result.current.archiveItem('folder1');
      });

      expect(mockOnDataChange).not.toHaveBeenCalled();
    });
  });

  describe('restoreItem', () => {
    it('should restore archived item and its children', () => {
      const archivedData: DocsFileSystemData = {
        items: [
          {
            id: 'folder1',
            name: 'Documents',
            type: 'folder',
            archived: true,
            children: [
              {
                id: 'file1',
                name: 'readme.md',
                type: 'file',
                archived: true,
                parentId: 'folder1'
              }
            ]
          }
        ],
        currentPath: []
      };

      const { result } = renderHook(() => 
        useFileSystemOperations(archivedData, mockOnDataChange, true)
      );

      act(() => {
        result.current.restoreItem('folder1');
      });

      expect(mockOnDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              id: 'folder1',
              archived: false,
              children: expect.arrayContaining([
                expect.objectContaining({
                  id: 'file1',
                  archived: false
                })
              ])
            })
          ])
        })
      );
    });
  });

  describe('deleteItem', () => {
    it('should permanently delete item', () => {
      const { result } = renderHook(() => 
        useFileSystemOperations(createMockData(), mockOnDataChange, true)
      );

      act(() => {
        result.current.deleteItem('file2');
      });

      expect(mockOnDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.not.arrayContaining([
            expect.objectContaining({
              id: 'file2'
            })
          ])
        })
      );
    });

    it('should not delete when user cancels confirmation', () => {
      vi.mocked(window.confirm).mockReturnValue(false);
      
      const { result } = renderHook(() => 
        useFileSystemOperations(createMockData(), mockOnDataChange, true)
      );

      act(() => {
        result.current.deleteItem('file2');
      });

      expect(mockOnDataChange).not.toHaveBeenCalled();
    });
  });

  describe('Content section operations', () => {
    describe('addContentSection', () => {
      it('should add new content section to file', () => {
        const { result } = renderHook(() => 
          useFileSystemOperations(createMockData(), mockOnDataChange, true)
        );

        act(() => {
          result.current.addContentSection('file1');
        });

        expect(mockOnDataChange).toHaveBeenCalledWith(
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                id: 'folder1',
                children: expect.arrayContaining([
                  expect.objectContaining({
                    id: 'file1',
                    contentSections: expect.arrayContaining([
                      expect.objectContaining({
                        title: 'Introduction'
                      }),
                      expect.objectContaining({
                        title: 'Section 2',
                        content: ''
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

    describe('removeContentSection', () => {
      it('should remove content section from file', () => {
        const dataWithMultipleSections: DocsFileSystemData = {
          items: [
            {
              id: 'file1',
              name: 'test.md',
              type: 'file',
              contentSections: [
                {
                  id: 'section1',
                  title: 'First',
                  content: 'First content'
                },
                {
                  id: 'section2',
                  title: 'Second',
                  content: 'Second content'
                }
              ]
            }
          ],
          currentPath: []
        };

        const { result } = renderHook(() => 
          useFileSystemOperations(dataWithMultipleSections, mockOnDataChange, true)
        );

        act(() => {
          result.current.removeContentSection('file1', 'section2');
        });

        expect(mockOnDataChange).toHaveBeenCalledWith(
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                id: 'file1',
                contentSections: expect.arrayContaining([
                  expect.objectContaining({
                    id: 'section1'
                  })
                ])
              })
            ])
          })
        );
      });

      it('should not remove last content section', () => {
        const { result } = renderHook(() => 
          useFileSystemOperations(createMockData(), mockOnDataChange, true)
        );

        act(() => {
          result.current.removeContentSection('file1', 'section1');
        });

        expect(mockOnDataChange).not.toHaveBeenCalled();
      });
    });

    describe('updateContentSection', () => {
      it('should update content section content', () => {
        const { result } = renderHook(() => 
          useFileSystemOperations(createMockData(), mockOnDataChange, true)
        );

        act(() => {
          result.current.updateContentSection('file1', 'section1', 'Updated content');
        });

        expect(mockOnDataChange).toHaveBeenCalledWith(
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                id: 'folder1',
                children: expect.arrayContaining([
                  expect.objectContaining({
                    id: 'file1',
                    contentSections: expect.arrayContaining([
                      expect.objectContaining({
                        id: 'section1',
                        content: 'Updated content'
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

    describe('updateSectionTitle', () => {
      it('should update section title', () => {
        const { result } = renderHook(() => 
          useFileSystemOperations(createMockData(), mockOnDataChange, true)
        );

        act(() => {
          result.current.updateSectionTitle('file1', 'section1', 'New Title');
        });

        expect(mockOnDataChange).toHaveBeenCalledWith(
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                id: 'folder1',
                children: expect.arrayContaining([
                  expect.objectContaining({
                    id: 'file1',
                    contentSections: expect.arrayContaining([
                      expect.objectContaining({
                        id: 'section1',
                        title: 'New Title'
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

    describe('removeLinkFromSection', () => {
      it('should remove linked element from section', () => {
        const dataWithLinks: DocsFileSystemData = {
          items: [
            {
              id: 'file1',
              name: 'test.md',
              type: 'file',
              contentSections: [
                {
                  id: 'section1',
                  title: 'Test',
                  content: 'Test content',
                  linkedElements: [
                    { id: 'node1', type: 'node', name: 'Database' },
                    { id: 'edge1', type: 'edge', name: 'Connection' }
                  ]
                }
              ]
            }
          ],
          currentPath: []
        };

        const { result } = renderHook(() => 
          useFileSystemOperations(dataWithLinks, mockOnDataChange, true)
        );

        act(() => {
          result.current.removeLinkFromSection('file1', 'section1', 'node1');
        });

        expect(mockOnDataChange).toHaveBeenCalledWith(
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                id: 'file1',
                contentSections: expect.arrayContaining([
                  expect.objectContaining({
                    id: 'section1',
                    linkedElements: expect.arrayContaining([
                      expect.objectContaining({
                        id: 'edge1'
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
  });
}); 