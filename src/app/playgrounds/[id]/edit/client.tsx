'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/trpc/react';
import { type Playground } from '@/server/db/schema';
import Link from 'next/link';

interface EditPlaygroundClientProps {
  playground: Playground;
}

export default function EditPlaygroundClient({ playground }: EditPlaygroundClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState(playground.title);
  const [description, setDescription] = useState(playground.description ?? '');
  const [tags, setTags] = useState(playground.tags ?? '');
  const [isPublic, setIsPublic] = useState(playground.isPublic === 1);

  const updatePlaygroundMutation = api.playgrounds.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Playground updated successfully',
      });
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a playground title',
        variant: 'destructive',
      });
      return;
    }

    updatePlaygroundMutation.mutate({
      id: playground.id,
      title,
      description: description || undefined,
      tags: tags || undefined,
      isPublic: isPublic ? 1 : 0,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/playgrounds/${playground.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Playground
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Playground</h1>
        </div>
        <Button onClick={handleSave} disabled={updatePlaygroundMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {updatePlaygroundMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-8">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1"
              placeholder="e.g. e-commerce, microservices, aws"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="isPublic">Make this playground public</Label>
          </div>
        </div>

        {/* This is a placeholder for the actual playground editor component */}
        <div className="border rounded-lg p-4 mt-8">
          <h2 className="text-xl font-semibold mb-4">Playground Editor</h2>
          <p className="text-muted-foreground">
            The actual playground editor component would be integrated here.
          </p>
          <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-sm overflow-auto">
            {JSON.stringify(playground.jsonBlob, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 