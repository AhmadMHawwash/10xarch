'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Share2, Trash2, Users } from 'lucide-react';
import { type Playground } from '@/server/db/schema';
import { PlaygroundSharingPanel } from './PlaygroundSharingPanel';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';

interface PlaygroundToolbarProps {
  playground: Playground;
  onPlaygroundUpdate?: (playground: Playground) => void;
  className?: string;
}

export function PlaygroundToolbar({ playground, onPlaygroundUpdate, className }: PlaygroundToolbarProps) {
  const [sharingDialogOpen, setSharingDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deletePlaygroundMutation = api.playgrounds.delete.useMutation();
  const router = useRouter();

  const handlePlaygroundUpdate = (updatedPlayground: Playground) => {
    setSharingDialogOpen(false);
    onPlaygroundUpdate?.(updatedPlayground);
  };

  const getSharedCount = () => {
    const editorIds = playground.editorIds ?? [];
    const viewerIds = playground.viewerIds ?? [];
    return editorIds.length + viewerIds.length;
  };

  const sharedCount = getSharedCount();

  const handleDeletePlayground = async () => {
    deletePlaygroundMutation.mutate(playground.id);
    router.push('/playgrounds');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Dialog open={sharingDialogOpen} onOpenChange={setSharingDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            {sharedCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                {sharedCount}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Share Playground
            </DialogTitle>
          </DialogHeader>
          <PlaygroundSharingPanel 
            playground={playground} 
            onUpdate={handlePlaygroundUpdate}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Playground</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this playground?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" className="flex items-center gap-2" onClick={() => handleDeletePlayground()}>
              {deletePlaygroundMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 