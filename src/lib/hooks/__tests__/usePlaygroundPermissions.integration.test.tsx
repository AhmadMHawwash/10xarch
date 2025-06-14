/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useUser } from '@clerk/nextjs';
import { usePlaygroundPermissions } from '../usePlaygroundPermissions';
import type { Playground } from '@/server/db/schema';
import React from 'react';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

// Test component that uses the permissions hook
function TestPlaygroundComponent({ playground }: { playground: Partial<Playground> | null }) {
  const { canEdit, canView, isOwner, isEditor, isViewer } = usePlaygroundPermissions(playground);

  if (!canView) {
    return <div data-testid="access-denied">Access Denied</div>;
  }

  return (
    <div data-testid="playground-content">
      <div data-testid="playground-title">{playground?.title ?? 'Untitled'}</div>
      
      {/* Owner badge */}
      {isOwner && <div data-testid="owner-badge">Owner</div>}
      
      {/* Role indicators */}
      {isEditor && <div data-testid="editor-badge">Editor</div>}
      {isViewer && <div data-testid="viewer-badge">Viewer</div>}
      
      {/* Edit controls - only show if can edit */}
      {canEdit && (
        <div data-testid="edit-controls">
          <button data-testid="edit-button">Edit Playground</button>
          <button data-testid="save-button">Save Changes</button>
        </div>
      )}
      
      {/* Read-only indicator */}
      {!canEdit && (
        <div data-testid="readonly-indicator">
          This playground is read-only for you
        </div>
      )}
      
      {/* Always visible view controls */}
      <div data-testid="view-controls">
        <button data-testid="view-button">View Details</button>
        <button data-testid="share-button">Share</button>
      </div>
    </div>
  );
}

// Component that simulates a settings panel with permissions
function TestSettingsComponent({ 
  playground, 
  showSettings = true 
}: { 
  playground: Partial<Playground> | null;
  showSettings?: boolean;
}) {
  const { canEdit } = usePlaygroundPermissions(playground);

  if (!showSettings) return null;

  return (
    <div data-testid="settings-panel">
      <h3>Settings</h3>
      {canEdit ? (
        <div data-testid="editable-settings">
                     <input 
             data-testid="title-input" 
             placeholder="Enter title"
             defaultValue={playground?.title ?? ''}
           />
           <textarea 
             data-testid="description-input"
             placeholder="Enter description"
             defaultValue={playground?.description ?? ''}
           />
          <button data-testid="update-settings">Update Settings</button>
        </div>
      ) : (
                 <div data-testid="readonly-settings">
           <div data-testid="readonly-title">{playground?.title ?? 'Untitled'}</div>
           <div data-testid="readonly-description">{playground?.description ?? 'No description'}</div>
           <div data-testid="readonly-notice">Settings are read-only</div>
         </div>
      )}
    </div>
  );
}

describe('usePlaygroundPermissions Integration Tests', () => {
  const mockUserId = 'user_123';
  const mockUser = {
    id: mockUserId,
    firstName: 'John',
    lastName: 'Doe',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Playground Access Control', () => {
         it('should deny access to private playground when user has no permissions', () => {
       mockUseUser.mockReturnValue({
         user: mockUser,
         isLoaded: true,
         isSignedIn: true,
       } as any);

      const playground: Partial<Playground> = {
        id: 'playground_1',
        title: 'Private Playground',
        ownerType: 'user',
        ownerId: 'other_user',
        isPublic: 0,
      };

      render(<TestPlaygroundComponent playground={playground} />);

      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.queryByTestId('playground-content')).not.toBeInTheDocument();
    });

    it('should allow access to public playground', () => {
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      const playground: Partial<Playground> = {
        id: 'playground_1',
        title: 'Public Playground',
        ownerType: 'user',
        ownerId: 'other_user',
        isPublic: 1,
      };

      render(<TestPlaygroundComponent playground={playground} />);

      expect(screen.getByTestId('playground-content')).toBeInTheDocument();
      expect(screen.getByTestId('playground-title')).toHaveTextContent('Public Playground');
      expect(screen.queryByTestId('access-denied')).not.toBeInTheDocument();
    });
  });

  describe('Owner Permissions', () => {
    it('should grant full access to playground owner', () => {
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      const playground: Partial<Playground> = {
        id: 'playground_1',
        title: 'My Playground',
        ownerType: 'user',
        ownerId: mockUserId,
        isPublic: 0,
      };

      render(<TestPlaygroundComponent playground={playground} />);

      expect(screen.getByTestId('playground-content')).toBeInTheDocument();
      expect(screen.getByTestId('owner-badge')).toBeInTheDocument();
      expect(screen.getByTestId('edit-controls')).toBeInTheDocument();
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      expect(screen.queryByTestId('readonly-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Editor Permissions', () => {
    it('should grant edit access to editors', () => {
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      const playground: Partial<Playground> = {
        id: 'playground_1',
        title: 'Shared Playground',
        ownerType: 'user',
        ownerId: 'other_user',
        editorIds: [mockUserId],
        isPublic: 0,
      };

      render(<TestPlaygroundComponent playground={playground} />);

      expect(screen.getByTestId('playground-content')).toBeInTheDocument();
      expect(screen.getByTestId('editor-badge')).toBeInTheDocument();
      expect(screen.getByTestId('edit-controls')).toBeInTheDocument();
      expect(screen.queryByTestId('owner-badge')).not.toBeInTheDocument();
      expect(screen.queryByTestId('readonly-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Viewer Permissions', () => {
    it('should grant read-only access to viewers', () => {
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      const playground: Partial<Playground> = {
        id: 'playground_1',
        title: 'Shared Playground',
        ownerType: 'user',
        ownerId: 'other_user',
        viewerIds: [mockUserId],
        isPublic: 0,
      };

      render(<TestPlaygroundComponent playground={playground} />);

      expect(screen.getByTestId('playground-content')).toBeInTheDocument();
             expect(screen.getByTestId('viewer-badge')).toBeInTheDocument();
       expect(screen.getByTestId('readonly-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('view-controls')).toBeInTheDocument();
      expect(screen.queryByTestId('edit-controls')).not.toBeInTheDocument();
      expect(screen.queryByTestId('owner-badge')).not.toBeInTheDocument();
    });

    it('should show read-only message for public playground viewers', () => {
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      const playground: Partial<Playground> = {
        id: 'playground_1',
        title: 'Public Playground',
        ownerType: 'user',
        ownerId: 'other_user',
        isPublic: 1,
      };

      render(<TestPlaygroundComponent playground={playground} />);

      expect(screen.getByTestId('playground-content')).toBeInTheDocument();
      expect(screen.getByTestId('readonly-indicator')).toBeInTheDocument();
      expect(screen.queryByTestId('edit-controls')).not.toBeInTheDocument();
      expect(screen.queryByTestId('owner-badge')).not.toBeInTheDocument();
      expect(screen.queryByTestId('editor-badge')).not.toBeInTheDocument();
      expect(screen.queryByTestId('viewer-badge')).not.toBeInTheDocument();
    });
  });

  describe('Settings Panel Integration', () => {
    it('should show editable settings for owners', () => {
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      const playground: Partial<Playground> = {
        id: 'playground_1',
        title: 'My Playground',
        description: 'My playground description',
        ownerType: 'user',
        ownerId: mockUserId,
        isPublic: 0,
      };

      render(<TestSettingsComponent playground={playground} />);

      expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
      expect(screen.getByTestId('editable-settings')).toBeInTheDocument();
      expect(screen.getByTestId('title-input')).toHaveValue('My Playground');
      expect(screen.getByTestId('description-input')).toHaveValue('My playground description');
      expect(screen.getByTestId('update-settings')).toBeInTheDocument();
      expect(screen.queryByTestId('readonly-settings')).not.toBeInTheDocument();
    });

    it('should show read-only settings for viewers', () => {
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      const playground: Partial<Playground> = {
        id: 'playground_1',
        title: 'Shared Playground',
        description: 'Shared playground description',
        ownerType: 'user',
        ownerId: 'other_user',
        viewerIds: [mockUserId],
        isPublic: 0,
      };

      render(<TestSettingsComponent playground={playground} />);

      expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
      expect(screen.getByTestId('readonly-settings')).toBeInTheDocument();
      expect(screen.getByTestId('readonly-title')).toHaveTextContent('Shared Playground');
      expect(screen.getByTestId('readonly-description')).toHaveTextContent('Shared playground description');
      expect(screen.getByTestId('readonly-notice')).toHaveTextContent('Settings are read-only');
      expect(screen.queryByTestId('editable-settings')).not.toBeInTheDocument();
    });

    it('should handle empty playground data gracefully', () => {
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      const playground: Partial<Playground> = {
        id: 'playground_1',
        ownerType: 'user',
        ownerId: 'other_user',
        viewerIds: [mockUserId],
        isPublic: 0,
      };

      render(<TestSettingsComponent playground={playground} />);

      expect(screen.getByTestId('readonly-title')).toHaveTextContent('Untitled');
      expect(screen.getByTestId('readonly-description')).toHaveTextContent('No description');
    });
  });

  describe('Dynamic Permission Changes', () => {
    it('should update UI when permissions change', () => {
      const { rerender } = render(<TestPlaygroundComponent playground={null} />);

      // Initially no access
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();

      // Simulate user login
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      const playground: Partial<Playground> = {
        id: 'playground_1',
        title: 'Public Playground',
        ownerType: 'user',
        ownerId: 'other_user',
        isPublic: 1,
      };

      rerender(<TestPlaygroundComponent playground={playground} />);

      expect(screen.queryByTestId('access-denied')).not.toBeInTheDocument();
      expect(screen.getByTestId('playground-content')).toBeInTheDocument();
    });

    it('should handle user logout gracefully', () => {
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      const playground: Partial<Playground> = {
        id: 'playground_1',
        title: 'My Playground',
        ownerType: 'user',
        ownerId: mockUserId,
        isPublic: 0,
      };

      const { rerender } = render(<TestPlaygroundComponent playground={playground} />);

      expect(screen.getByTestId('owner-badge')).toBeInTheDocument();
      expect(screen.getByTestId('edit-controls')).toBeInTheDocument();

      // Simulate user logout
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      } as any);

      rerender(<TestPlaygroundComponent playground={playground} />);

      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.queryByTestId('playground-content')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated User Behavior', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      } as any);
    });

    it('should allow access to public playgrounds for unauthenticated users', () => {
      const playground: Partial<Playground> = {
        id: 'playground_1',
        title: 'Public Playground',
        ownerType: 'user',
        ownerId: 'some_user',
        isPublic: 1,
      };

      render(<TestPlaygroundComponent playground={playground} />);

      expect(screen.getByTestId('playground-content')).toBeInTheDocument();
      expect(screen.getByTestId('readonly-indicator')).toBeInTheDocument();
      expect(screen.queryByTestId('edit-controls')).not.toBeInTheDocument();
    });

    it('should deny access to private playgrounds for unauthenticated users', () => {
      const playground: Partial<Playground> = {
        id: 'playground_1',
        title: 'Private Playground',
        ownerType: 'user',
        ownerId: 'some_user',
        isPublic: 0,
      };

      render(<TestPlaygroundComponent playground={playground} />);

      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.queryByTestId('playground-content')).not.toBeInTheDocument();
    });
  });
}); 