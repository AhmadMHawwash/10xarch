'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type Playground } from '@/server/db/schema';
import { api } from '@/trpc/react';
import { Mail, Search, Users, X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

interface PlaygroundSharingPanelProps {
  playground: Playground;
  onUpdate?: (playground: Playground) => void;
}

interface SharedUser {
  id: string;
  email: string;
  fullName?: string;
  imageUrl?: string;
  permission: 'viewer' | 'editor';
}

export function PlaygroundSharingPanel({ playground, onUpdate }: PlaygroundSharingPanelProps) {
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const utils = api.useUtils();

  // Get all user IDs that need to be fetched
  const allUserIds = useMemo(() => {
    const editorIds = playground.editorIds ?? [];
    const viewerIds = playground.viewerIds ?? [];
    return [...editorIds, ...viewerIds];
  }, [playground.editorIds, playground.viewerIds]);

  // Fetch user details from Clerk
  const { data: usersData, isLoading: isLoadingUsers } = api.playgrounds.getUsersByIds.useQuery(
    { userIds: allUserIds },
    {
      enabled: allUserIds.length > 0,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  // Update shared users when user data is loaded
  useEffect(() => {
    if (usersData?.users) {
      const editorIds = playground.editorIds ?? [];
      
      const sharedUsersWithPermissions = usersData.users.map(user => ({
        ...user,
        permission: editorIds.includes(user.id) ? ('editor' as const) : ('viewer' as const)
      }));
      
      setSharedUsers(sharedUsersWithPermissions);
    } else if (allUserIds.length === 0) {
      setSharedUsers([]);
    }
  }, [usersData, playground.editorIds, playground.viewerIds, allUserIds]);

  const updateSharingMutation = api.playgrounds.updateSharing.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Sharing permissions updated successfully',
      });
      onUpdate?.(data.playground);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSearchUser = async () => {
    if (!searchEmail || searchEmail.trim() === '') {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const result = await utils.playgrounds.searchUsers.fetch({ email: searchEmail.trim() });
      
      if (result.users.length === 0) {
        toast({
          title: 'User not found',
          description: 'No user found with this email address',
          variant: 'destructive',
        });
        return;
      }

      const user = result.users[0];
      if (!user) return;

      // Check if user is already shared with
      if (sharedUsers.some(u => u.id === user.id)) {
        toast({
          title: 'Already shared',
          description: 'This user already has access to the playground',
          variant: 'destructive',
        });
        return;
      }

      // Add user as viewer by default
      const newUser: SharedUser = {
        id: user.id,
        email: user.email,
        permission: 'viewer',
      };

      setSharedUsers(prev => [...prev, newUser]);
      setSearchEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search for user',
        variant: 'destructive',
      });
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSharedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handlePermissionChange = (userId: string, permission: 'viewer' | 'editor') => {
    setSharedUsers(prev => 
      prev.map(u => u.id === userId ? { ...u, permission } : u)
    );
  };

  // Check if there are changes compared to original playground data
  const hasChanges = () => {
    const currentEditorIds = sharedUsers.filter(u => u.permission === 'editor').map(u => u.id).sort();
    const currentViewerIds = sharedUsers.filter(u => u.permission === 'viewer').map(u => u.id).sort();
    const originalEditorIds = [...(playground.editorIds ?? [])].sort();
    const originalViewerIds = [...(playground.viewerIds ?? [])].sort();
    
    return JSON.stringify(currentEditorIds) !== JSON.stringify(originalEditorIds) ||
           JSON.stringify(currentViewerIds) !== JSON.stringify(originalViewerIds);
  };

  const handleSaveChanges = () => {
    const editorIds = sharedUsers.filter(u => u.permission === 'editor').map(u => u.id);
    const viewerIds = sharedUsers.filter(u => u.permission === 'viewer').map(u => u.id);

    updateSharingMutation.mutate({
      playgroundId: playground.id,
      editorIds,
      viewerIds,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Users className="h-4 w-4" />
        <span className="font-medium">Sharing</span>
      </div>

      {/* Search for users */}
      <div className="space-y-2">
        <Label htmlFor="search-email" className="text-sm font-medium">
          Add people
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-email"
              type="email"
              placeholder="Enter email address"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleSearchUser} 
            disabled={isSearching || !searchEmail.trim()}
            size="sm"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current shared users */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Shared with ({isLoadingUsers ? '...' : sharedUsers.length})
        </Label>
        
        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
          </div>
        ) : sharedUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This playground is not shared with anyone yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sharedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.imageUrl} alt={user.fullName ?? user.email} />
                    <AvatarFallback className="bg-primary/10 text-xs">
                      {user.fullName ? 
                        user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) :
                        user.email.slice(0, 2).toUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.fullName ?? user.email}
                    </p>
                    {user.fullName && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={user.permission}
                    onValueChange={(value: 'viewer' | 'editor') => 
                      handlePermissionChange(user.id, value)
                    }
                  >
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">View</SelectItem>
                      <SelectItem value="editor">Edit</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUser(user.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      {hasChanges() && (
        <Button 
          onClick={handleSaveChanges}
          disabled={updateSharingMutation.isPending}
          className="w-full"
        >
          {updateSharingMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      )}
    </div>
  );
} 