import { useUser } from "@clerk/nextjs";
import { type Playground } from "@/server/db/schema";

export interface PlaygroundPermissions {
  canEdit: boolean;
  canView: boolean;
  isOwner: boolean;
  isEditor: boolean;
  isViewer: boolean;
}

export function usePlaygroundPermissions(playground?: Partial<Playground> | null): PlaygroundPermissions {
  const { user, isLoaded: isUserLoaded } = useUser();
  const userId = user?.id;

  // If user authentication is still loading, return restrictive permissions
  // This prevents permission checks from running before auth state is ready
  if (!isUserLoaded) {
    return {
      canEdit: false,
      canView: false,
      isOwner: false,
      isEditor: false,
      isViewer: false,
    };
  }

  if (!playground) {
    return {
      canEdit: false,
      canView: false,
      isOwner: false,
      isEditor: false,
      isViewer: false,
    };
  }

  // Check if we have the minimum required fields for permission checking
  const hasRequiredFields = playground.ownerType !== undefined && 
    playground.ownerId !== undefined;

  if (!hasRequiredFields) {
    // Return restrictive permissions if we don't have complete data
    return {
      canEdit: false,
      canView: false,
      isOwner: false,
      isEditor: false,
      isViewer: false,
    };
  }

  const isPublic = playground.isPublic === 1;
  
  // If user is not authenticated, they can only view public playgrounds
  if (!userId) {
    return {
      canEdit: false,
      canView: isPublic,
      isOwner: false,
      isEditor: false,
      isViewer: false,
    };
  }

  const isOwner = playground.ownerType === "user" && playground.ownerId === userId;
  const isEditor = playground.editorIds?.includes(userId) ?? false;
  const isViewer = playground.viewerIds?.includes(userId) ?? false;

  const canEdit = isOwner || isEditor;
  const canView = canEdit || isViewer || isPublic;

  return {
    canEdit,
    canView,
    isOwner,
    isEditor,
    isViewer,
  };
} 