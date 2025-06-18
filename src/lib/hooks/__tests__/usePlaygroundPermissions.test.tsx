/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePlaygroundPermissions } from '../usePlaygroundPermissions';
import { useUser } from '@clerk/nextjs';
import type { Playground } from '@/server/db/schema';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

describe('usePlaygroundPermissions', () => {
  const mockUserId = 'user_123';
  const mockUser = {
    id: mockUserId,
    firstName: 'John',
    lastName: 'Doe',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      } as any);
    });

    it('should return no permissions for authenticated user', () => {
      const playground: Partial<Playground> = {
        id: 'playground_1',
        ownerType: 'user',
        ownerId: 'other_user',
        isPublic: 0,
      };

      const { result } = renderHook(() => usePlaygroundPermissions(playground));

      expect(result.current).toEqual({
        canEdit: false,
        canView: false,
        isOwner: false,
        isEditor: false,
        isViewer: false,
      });
    });

    it('should return view permissions for public playground', () => {
      const playground: Partial<Playground> = {
        id: 'playground_1',
        ownerType: 'user',
        ownerId: 'other_user',
        isPublic: 1,
      };

      const { result } = renderHook(() => usePlaygroundPermissions(playground));

      expect(result.current).toEqual({
        canEdit: false,
        canView: true,
        isOwner: false,
        isEditor: false,
        isViewer: false,
      });
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);
    });

    describe('when playground is null or undefined', () => {
      it('should return no permissions when playground is null', () => {
        const { result } = renderHook(() => usePlaygroundPermissions(null));

        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });

      it('should return no permissions when playground is undefined', () => {
        const { result } = renderHook(() => usePlaygroundPermissions(undefined));

        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });
    });

    describe('owner permissions', () => {
      it('should grant full permissions to owner', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: mockUserId,
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: true,
          canView: true,
          isOwner: true,
          isEditor: false,
          isViewer: false,
        });
      });

      it('should not grant owner permissions when ownerType is not user', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'org',
          ownerId: mockUserId,
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });

      it('should not grant owner permissions when ownerId does not match', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });
    });

    describe('editor permissions', () => {
      it('should grant edit permissions to editor', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          editorIds: [mockUserId, 'other_editor'],
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: true,
          canView: true,
          isOwner: false,
          isEditor: true,
          isViewer: false,
        });
      });

      it('should not grant editor permissions when user is not in editorIds', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          editorIds: ['other_editor'],
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });

      it('should handle empty editorIds array', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          editorIds: [],
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });

      it('should handle undefined editorIds', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          editorIds: undefined,
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });
    });

    describe('viewer permissions', () => {
      it('should grant view permissions to viewer', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          viewerIds: [mockUserId, 'other_viewer'],
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: true,
          isOwner: false,
          isEditor: false,
          isViewer: true,
        });
      });

      it('should not grant viewer permissions when user is not in viewerIds', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          viewerIds: ['other_viewer'],
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });

      it('should handle empty viewerIds array', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          viewerIds: [],
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });

      it('should handle undefined viewerIds', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          viewerIds: undefined,
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });
    });

    describe('public playground permissions', () => {
      it('should grant view permissions for public playground', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          isPublic: 1,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: true,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });

      it('should not grant view permissions for non-public playground', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });
    });

    describe('combined permissions', () => {
      it('should handle user being both editor and viewer', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          editorIds: [mockUserId],
          viewerIds: [mockUserId],
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: true,
          canView: true,
          isOwner: false,
          isEditor: true,
          isViewer: true,
        });
      });

      it('should prioritize owner permissions over editor/viewer', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: mockUserId,
          editorIds: [mockUserId],
          viewerIds: [mockUserId],
          isPublic: 0,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: true,
          canView: true,
          isOwner: true,
          isEditor: true,
          isViewer: true,
        });
      });

      it('should grant view access to public playground even if user is not in any permission lists', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          editorIds: ['other_editor'],
          viewerIds: ['other_viewer'],
          isPublic: 1,
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: true,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });
    });

    describe('edge cases', () => {
      it('should handle playground with missing fields', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
        };

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });

      it('should update permissions when playground changes', () => {
        const initialPlayground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: 'other_user',
          isPublic: 0,
        };

        const { result, rerender } = renderHook(
          ({ playground }) => usePlaygroundPermissions(playground),
          { initialProps: { playground: initialPlayground } }
        );

        expect(result.current.canView).toBe(false);

        // Update to public playground
        const updatedPlayground: Partial<Playground> = {
          ...initialPlayground,
          isPublic: 1,
        };

        rerender({ playground: updatedPlayground });

        expect(result.current.canView).toBe(true);
      });

      it('should update permissions when user changes', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: mockUserId,
          isPublic: 0,
        };

        const { result, rerender } = renderHook(() => usePlaygroundPermissions(playground));

        expect(result.current.isOwner).toBe(true);

        // Simulate user logout
        mockUseUser.mockReturnValue({
          user: null,
          isLoaded: true,
          isSignedIn: false,
        } as any);

        rerender();

        expect(result.current.isOwner).toBe(false);
        expect(result.current.canEdit).toBe(false);
        expect(result.current.canView).toBe(false);
      });

      it('should return restrictive permissions when user auth is loading', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: mockUserId,
          isPublic: 0,
        };

        // Simulate authentication still loading (initial page load/refresh scenario)
        mockUseUser.mockReturnValue({
          user: null,
          isLoaded: false,
          isSignedIn: false,
        } as any);

        const { result } = renderHook(() => usePlaygroundPermissions(playground));

        // Should return restrictive permissions while auth is loading
        expect(result.current).toEqual({
          canEdit: false,
          canView: false,
          isOwner: false,
          isEditor: false,
          isViewer: false,
        });
      });

      it('should update permissions once user auth is loaded', () => {
        const playground: Partial<Playground> = {
          id: 'playground_1',
          ownerType: 'user',
          ownerId: mockUserId,
          isPublic: 0,
        };

        // Start with loading state
        mockUseUser.mockReturnValue({
          user: null,
          isLoaded: false,
          isSignedIn: false,
        } as any);

        const { result, rerender } = renderHook(() => usePlaygroundPermissions(playground));

        // Should be restrictive while loading
        expect(result.current.canView).toBe(false);
        expect(result.current.isOwner).toBe(false);

        // Simulate auth loaded with user
        mockUseUser.mockReturnValue({
          user: mockUser,
          isLoaded: true,
          isSignedIn: true,
        } as any);

        rerender();

        // Should now have proper permissions
        expect(result.current.canView).toBe(true);
        expect(result.current.isOwner).toBe(true);
      });
    });
  });
}); 