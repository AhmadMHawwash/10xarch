'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Users } from 'lucide-react';
import { type Playground } from '@/server/db/schema';
import { PlaygroundSharingPanel } from './PlaygroundSharingPanel';

interface PlaygroundToolbarProps {
  playground: Playground;
  onPlaygroundUpdate?: (playground: Playground) => void;
  className?: string;
}

export function PlaygroundToolbar({ playground, onPlaygroundUpdate, className }: PlaygroundToolbarProps) {
  const [sharingDialogOpen, setSharingDialogOpen] = useState(false);

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

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Dialog open={sharingDialogOpen} onOpenChange={setSharingDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
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
    </div>
  );
} 