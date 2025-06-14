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
  const { user } = useUser();
  const userId = user?.id;

  if (!playground) {
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