'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/trpc/react';
import { type Playground } from '@/server/db/schema';
import { formatDistanceToNow } from '@/lib/utils';

interface PlaygroundsClientProps {
  initialPlaygrounds: Playground[];
}

export default function PlaygroundsClient({ initialPlaygrounds }: PlaygroundsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [newPlaygroundTitle, setNewPlaygroundTitle] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [playgroundToDelete, setPlaygroundToDelete] = useState<string | null>(null);

  const { data, isLoading, refetch } = api.playgrounds.getAll.useQuery(undefined, {
    initialData: { playgrounds: initialPlaygrounds },
    refetchOnWindowFocus: true,
  });

  const createPlaygroundMutation = api.playgrounds.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Playground created successfully',
      });
      setNewPlaygroundTitle('');
      setIsCreateDialogOpen(false);
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
    if (!newPlaygroundTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a playground title',
        variant: 'destructive',
      });
      return;
    }

    createPlaygroundMutation.mutate({
      title: newPlaygroundTitle,
      jsonBlob: {}, // Initialize with empty diagram
      ownerType: 'user',
      // ownerId will be set to the current user on the server
    });
  };

  const handleDeletePlayground = async (id: string) => {
    deletePlaygroundMutation.mutate(id);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Playgrounds</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Playground
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new playground</DialogTitle>
              <DialogDescription>
                Give your playground a name to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My System Design"
                value={newPlaygroundTitle}
                onChange={(e) => setNewPlaygroundTitle(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreatePlayground} disabled={createPlaygroundMutation.isPending}>
                {createPlaygroundMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.playgrounds.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium text-muted-foreground">No playgrounds found</h3>
              <p className="mt-2 text-muted-foreground">
                Create your first playground to get started with system design.
              </p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Playground
              </Button>
            </div>
          ) : (
            data.playgrounds.map((playground) => (
              <Card key={playground.id}>
                <CardHeader>
                  <CardTitle className="truncate">{playground.title}</CardTitle>
                  <CardDescription>
                    Updated {formatDistanceToNow(new Date(playground.updatedAt))} ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground truncate">
                    {playground.description ?? 'No description provided'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex space-x-2">
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
            ))
          )}
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
    </div>
  );
} 