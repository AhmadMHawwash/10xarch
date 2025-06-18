"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Playground } from "@/server/db/schema";
import { api } from "@/trpc/react";
import {
  AlertCircle,
  GitCommit,
  History,
  Loader2,
  Share2,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlaygroundSharingPanel } from "./PlaygroundSharingPanel";
import { VersionHistoryPanel } from "./VersionHistoryPanel";

interface PlaygroundToolbarProps {
  playground: Playground;
  onPlaygroundUpdate?: (playground: Playground) => void;
  onPlaygroundRestore?: () => void;
  className?: string;
}

export function PlaygroundToolbar({
  playground,
  onPlaygroundUpdate,
  className,
}: PlaygroundToolbarProps) {
  const [sharingDialogOpen, setSharingDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
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
    router.push("/playgrounds");
  };

  const handlePlaygroundRestore = () => {
    setVersionHistoryOpen(false);
  };

  // Get backup status and commit info
  const getBackupStatus = () => {
    if (!playground.lastBackupCommitSha) {
      return {
        status: "none",
        text: "No backups",
        variant: "secondary" as const,
      };
    }

    switch (playground.backupStatus) {
      case "success":
        return {
          status: "success",
          text: playground.lastBackupCommitSha.substring(0, 7),
          variant: "default" as const,
        };
      case "pending":
        return {
          status: "pending",
          text: "Backing up...",
          variant: "secondary" as const,
        };
      case "failed":
        return {
          status: "failed",
          text: "Backup failed",
          variant: "destructive" as const,
        };
      default:
        return {
          status: "none",
          text: "No backups",
          variant: "secondary" as const,
        };
    }
  };

  const backupStatus = getBackupStatus();

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <div className="flex items-center gap-2 flex-row">
        <Dialog open={sharingDialogOpen} onOpenChange={setSharingDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              {sharedCount > 0 && (
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
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
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
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
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleDeletePlayground()}
              >
                {deletePlaygroundMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <Dialog open={versionHistoryOpen} onOpenChange={setVersionHistoryOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 font-mono text-xs"
              disabled={backupStatus.status === "none"}
            >
              {backupStatus.status === "pending" && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              {backupStatus.status === "success" && (
                <GitCommit className="h-3 w-3" />
              )}
              {backupStatus.status === "failed" && (
                <AlertCircle className="h-3 w-3" />
              )}
              {backupStatus.status === "none" && (
                <History className="h-3 w-3" />
              )}
              <span>{backupStatus.text}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] w-[90vw] max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Version History
              </DialogTitle>
            </DialogHeader>
            <VersionHistoryPanel
              playgroundId={playground.id}
              onRestore={handlePlaygroundRestore}
              lastBackupCommitSha={playground.lastBackupCommitSha}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
