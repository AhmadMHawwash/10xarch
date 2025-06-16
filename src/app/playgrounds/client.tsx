'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Users, Share2, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/trpc/react';
import { type Playground } from '@/server/db/schema';
import { formatDistanceToNow } from '@/lib/utils';
import { type Edge } from 'reactflow';
import { defaultStartingNodes } from '@/lib/hooks/systemDesignerUtils';
import { Badge } from '@/components/ui/badge';
import { PlaygroundSharingPanel } from '@/components/playground/PlaygroundSharingPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PlaygroundsClientProps {
  initialPlaygrounds: Playground[];
}

type FilterType = 'all' | 'shared_with_me' | 'shared_with_others';

const filterLabels: Record<FilterType, string> = {
  all: 'All Playgrounds',
  shared_with_me: 'Shared with me',
  shared_with_others: 'Shared with others',
};

const filterDescriptions: Record<FilterType, string> = {
  all: 'All your playgrounds and collaborations',
  shared_with_me: 'Playgrounds others have shared with you',
  shared_with_others: 'Playgrounds you\'ve shared with others',
};

export default function PlaygroundsClient({ initialPlaygrounds }: PlaygroundsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [playgroundToDelete, setPlaygroundToDelete] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sharingPlaygroundId, setSharingPlaygroundId] = useState<string | null>(null);

  const { data, isLoading, refetch } = api.playgrounds.getAll.useQuery(
    { filter: activeFilter },
    {
      initialData: { playgrounds: initialPlaygrounds },
      refetchOnWindowFocus: true,
    }
  );

  const createPlaygroundMutation = api.playgrounds.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Playground created successfully',
      });
      // Redirect to the new playground
      router.push(`/playgrounds/${data.playground.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deletePlaygroundMutation = api.playgrounds.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Playground deleted successfully',
      });
      setPlaygroundToDelete(null);
      void refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreatePlayground = async () => {
    createPlaygroundMutation.mutate({
      title: 'Untitled Playground',
      jsonBlob: {
        nodes: defaultStartingNodes,
        edges: [] as Edge[],
      }, // Initialize with empty diagram
      ownerType: 'user',
      // ownerId will be set to the current user on the server
    });
  };

  const handleDeletePlayground = async (id: string) => {
    deletePlaygroundMutation.mutate(id);
  };

  const handleSharingClose = () => {
    setSharingPlaygroundId(null);
    // Refresh the playgrounds list to show updated sharing status
    void refetch();
  };

  const getShareInfo = (playground: Playground) => {
    const editorIds = playground.editorIds ?? [];
    const viewerIds = playground.viewerIds ?? [];
    const totalShared = editorIds.length + viewerIds.length;
    
    return {
      totalShared,
      isShared: totalShared > 0,
      editorCount: editorIds.length,
      viewerCount: viewerIds.length,
    };
  };

  const sharingPlayground = sharingPlaygroundId 
    ? data.playgrounds.find(p => p.id === sharingPlaygroundId)
    : null;

  // Get summary stats for the current filter
  const getSummaryStats = () => {
    const playgrounds = data.playgrounds;
    const sharedCount = playgrounds.filter(p => getShareInfo(p).isShared).length;
    
    switch (activeFilter) {
      case 'shared_with_me':
        return `${playgrounds.length} playground${playgrounds.length !== 1 ? 's' : ''} shared with you`;
      case 'shared_with_others':
        return `${playgrounds.length} playground${playgrounds.length !== 1 ? 's' : ''} you've shared`;
      default:
        return `${playgrounds.length} total, ${sharedCount} shared`;
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Playgrounds</h1>
          <p className="text-muted-foreground mt-1">
            {filterDescriptions[activeFilter]}
          </p>
        </div>
        <Button onClick={handleCreatePlayground} disabled={createPlaygroundMutation.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          {createPlaygroundMutation.isPending ? 'Creating...' : 'New Playground'}
        </Button>
      </div>

      {/* Filter and Summary Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {filterLabels[activeFilter]}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {(Object.entries(filterLabels) as [FilterType, string][]).map(([filter, label]) => (
              <DropdownMenuItem
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex flex-col items-start py-3 px-4 ${
                  activeFilter === filter ? 'bg-accent' : ''
                }`}
              >
                <div className="font-medium">{label}</div>
                <div className="text-sm text-muted-foreground">
                  {filterDescriptions[filter]}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {!isLoading && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {getSummaryStats()}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : data.playgrounds.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-medium text-muted-foreground mb-4">
              {activeFilter === 'all' && 'No playgrounds found'}
              {activeFilter === 'shared_with_me' && 'No playgrounds shared with you'}
              {activeFilter === 'shared_with_others' && 'No playgrounds shared with others'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {activeFilter === 'all' 
                ? 'Create your first playground to get started with system design.'
                : activeFilter === 'shared_with_me'
                  ? 'When others share playgrounds with you, they will appear here.'
                  : 'Share your playgrounds with others to collaborate on system designs.'
              }
            </p>
            {activeFilter === 'all' && (
              <Button onClick={handleCreatePlayground} disabled={createPlaygroundMutation.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                {createPlaygroundMutation.isPending ? 'Creating...' : 'Create Your First Playground'}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.playgrounds.map((playground) => {
            const shareInfo = getShareInfo(playground);
            
            return (
              <Card key={playground.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{playground.title}</CardTitle>
                      <CardDescription>
                        Updated {formatDistanceToNow(new Date(playground.updatedAt))} ago
                      </CardDescription>
                    </div>
                    {shareInfo.isShared && (
                      <div className="ml-2 flex items-center gap-1">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {shareInfo.editorCount > 0 && (
                            <span className="text-xs">
                              {shareInfo.editorCount} editor{shareInfo.editorCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          {shareInfo.viewerCount > 0 && (
                            <span className="text-xs">
                              {shareInfo.editorCount > 0 ? ', ' : ''}
                              {shareInfo.viewerCount} viewer{shareInfo.viewerCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground truncate">
                    {playground.description ?? 'No description provided'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSharingPlaygroundId(playground.id)}
                      className="flex items-center gap-1"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setPlaygroundToDelete(playground.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" asChild>
                      <Link href={`/playgrounds/${playground.id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Open
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!playgroundToDelete}
        onOpenChange={(open) => !open && setPlaygroundToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Playground</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this playground? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlaygroundToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => playgroundToDelete && handleDeletePlayground(playgroundToDelete)}
              disabled={deletePlaygroundMutation.isPending}
            >
              {deletePlaygroundMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sharing Panel Dialog */}
      <Dialog
        open={!!sharingPlaygroundId}
        onOpenChange={(open) => !open && handleSharingClose()}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Playground</DialogTitle>
            <DialogDescription>
              Manage who can view and edit &quot;{sharingPlayground?.title}&quot;
            </DialogDescription>
          </DialogHeader>
          {sharingPlayground && (
            <PlaygroundSharingPanel
              playground={sharingPlayground}
              onUpdate={() => {
                // Refresh the playgrounds list when sharing is updated
                void refetch();
              }}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleSharingClose}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}