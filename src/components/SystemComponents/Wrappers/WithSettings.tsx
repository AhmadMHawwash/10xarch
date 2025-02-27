import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Separator } from "../../ui/separator";
import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { useCallback, useImperativeHandle, useState } from "react";
import React from "react";
import { type NodeSettingsRefObject } from "@/types/system";

export const WithSettings = ({
  name,
  children,
  nodeSettingsRef,
}: {
  name: string;
  children?: React.ReactNode;
  nodeSettingsRef: NodeSettingsRefObject;
}) => {
  const { onSelectNode } = useSystemDesigner();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to handle dialog open/close
  const handleDialogChange = useCallback(
    (open: boolean) => {
      setIsDialogOpen(open);

      if (open) {
        // Clear the selected node when opening
        onSelectNode(null);
      }
    },
    [onSelectNode],
  );

  useImperativeHandle(nodeSettingsRef, () => {
    return {
      open: () => setIsDialogOpen(true),
      close: () => setIsDialogOpen(false),
    };
  });

  return (
    <Dialog onOpenChange={handleDialogChange} open={isDialogOpen}>
      <DialogTrigger className="absolute -right-1 -top-1 rounded-full bg-gray-200 dark:bg-gray-700">
        <span>
          <Settings
            size={16}
            className="stroke-gray-700 dark:stroke-gray-300"
          />
        </span>
      </DialogTrigger>
      <DialogContent className="h-[90vh] max-w-4xl overflow-scroll bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle>Configuring {name}</DialogTitle>
          <DialogDescription>
            <Separator className="mb-4 mt-2" />
            <div className="flex items-center">{children}</div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
