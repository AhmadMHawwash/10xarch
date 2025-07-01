import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Palette, Github, BookTemplate, ArrowRight } from "lucide-react";

interface CreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromScratch: () => void;
  onCreateFromGitHub: () => void;
  isCreating: boolean;
}

export function CreationModal({
  isOpen,
  onClose,
  onCreateFromScratch,
  onCreateFromGitHub,
  isCreating
}: CreationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            How would you like to start?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {/* Start from Scratch Option */}
          <div 
            className="group relative cursor-pointer rounded-lg border-2 border-gray-200 p-6 transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-400"
            onClick={onCreateFromScratch}
          >
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Palette className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Start from Scratch</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Design your system from the ground up using our visual components
                </p>
                <div className="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400">
                  Get started immediately <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Import from GitHub Option */}
          <div 
            className="group relative cursor-pointer rounded-lg border-2 border-gray-200 p-6 transition-all hover:border-green-500 hover:shadow-md dark:border-gray-700 dark:hover:border-green-400"
            onClick={onCreateFromGitHub}
          >
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <Github className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Import from GitHub</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyze a repository and auto-generate system architecture
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Node.js</Badge>
                  <Badge variant="secondary" className="text-xs">Python</Badge>
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                  Supports public & private repos <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Future: Template Option */}
          <div className="group relative rounded-lg border-2 border-gray-200 p-6 opacity-50 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <BookTemplate className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-500">Start from Template</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Use a pre-built template for common architectures
                </p>
                <Badge variant="outline" className="mt-3 text-xs">Coming Soon</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 