'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, GitCommit } from 'lucide-react';

interface CommitMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: (message: string) => void;
  isCommitting?: boolean;
  playgroundTitle?: string;
}

export function CommitMessageDialog({ 
  isOpen, 
  onClose, 
  onCommit, 
  isCommitting = false,
  playgroundTitle = "Untitled Playground"
}: CommitMessageDialogProps) {
  const [commitMessage, setCommitMessage] = useState('');
  const defaultMessage = `Update ${playgroundTitle}`;

  const handleCommit = () => {
    const message = commitMessage.trim() || defaultMessage;
    onCommit(message);
  };

  const handleClose = () => {
    if (!isCommitting) {
      setCommitMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Commit Changes
          </DialogTitle>
          <DialogDescription>
            Add a commit message to describe your changes. This will be saved in the version history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="commit-message">Commit Message</Label>
            <Textarea
              id="commit-message"
              placeholder={defaultMessage}
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              disabled={isCommitting}
              className="min-h-[80px] resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {commitMessage.length}/200 characters
              {!commitMessage.trim() && ` • Will use default: "${defaultMessage}"`}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCommitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCommit}
            disabled={isCommitting}
          >
            {isCommitting && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Save & Commit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 