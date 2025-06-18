'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, ExternalLink, RotateCcw } from 'lucide-react';
import { api } from '@/trpc/react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryPanelProps {
  playgroundId: string;
  onRestore?: () => void;
  lastBackupCommitSha: string | null;
}

export function VersionHistoryPanel({ playgroundId, onRestore, lastBackupCommitSha }: VersionHistoryPanelProps) {
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const { toast } = useToast();
  const utils = api.useUtils();

  // Fetch version history
  const { data: versionData, isLoading: loadingVersions, refetch } = api.playgrounds.getVersionHistory.useQuery({
    playgroundId,
    limit: 20,
  });

  // Restore mutation
  const restoreVersionMutation = api.playgrounds.restoreVersion.useMutation({
    onSuccess: async () => {
      toast({
        title: "Version Restored",
        description: "The playground has been restored to the selected version.",
      });
      setRestoreDialogOpen(false);
      setSelectedCommit(null);
      
      // Invalidate and refetch the playground data to force a refresh
      await utils.playgrounds.getById.invalidate(playgroundId);
      
      onRestore?.();
    },
    onError: (error) => {
      toast({
        title: "Restore Failed",
        description: error.message || "Failed to restore version",
        variant: "destructive",
      });
      setRestoreDialogOpen(false);
    },
  });

  const handleRestoreClick = (commitSha: string) => {
    setSelectedCommit(commitSha);
    setRestoreDialogOpen(true);
  };

  const handleConfirmRestore = () => {
    if (selectedCommit) {
      restoreVersionMutation.mutate({
        playgroundId,
        commitSha: selectedCommit,
      });
    }
  };

  const versions = versionData?.versions ?? [];

  if (loadingVersions) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading version history...</span>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No Version History</p>
        <p className="text-sm">
          Version history will appear here after your first backup.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <p className="text-sm text-muted-foreground">
          Browse and restore previous versions of this playground
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {versions.map((version, index) => {
          const isCurrent = lastBackupCommitSha === version.commitSha;
          const commitDate = new Date(version.date);
          const shortSha = version.commitSha.substring(0, 7);

          return (
            <div
              key={version.commitSha}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded shrink-0">
                    {shortSha}
                  </code>
                  {isCurrent && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      Current
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm font-medium text-foreground">
                  {version.message}
                </p>
                
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="truncate">by {version.author}</span>
                  <span className="shrink-0">{formatDistanceToNow(commitDate, { addSuffix: true })}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 w-8 p-0"
                >
                  <a
                    href={version.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on GitHub"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>

                {!isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreClick(version.commitSha)}
                    disabled={restoreVersionMutation.isPending}
                    className="h-8"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore to this version? This will overwrite the current playground content.
            </DialogDescription>
          </DialogHeader>

          {selectedCommit && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm">
                <span className="font-medium">Commit:</span>{' '}
                <code className="bg-background px-1 py-0.5 rounded text-xs">
                  {selectedCommit.substring(0, 7)}
                </code>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreDialogOpen(false)}
              disabled={restoreVersionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRestore}
              disabled={restoreVersionMutation.isPending}
            >
              {restoreVersionMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Restore Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 