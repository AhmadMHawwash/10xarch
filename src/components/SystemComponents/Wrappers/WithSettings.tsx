import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Separator } from "../../ui/separator";
import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { useCallback, useState } from "react";

export const WithSettings = ({
  name,
  children,
}: {
  name: string;
  children?: React.ReactNode;
}) => {
  const { onSelectNode } = useSystemDesigner();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Function to handle dialog open/close
  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    
    if (open) {
      // Clear the selected node when opening
      onSelectNode(null);
    }
  }, [onSelectNode]);

  return (
    <Dialog onOpenChange={handleDialogChange} open={isDialogOpen}>
      <DialogTrigger className="absolute -right-1 -top-1 rounded-full bg-gray-200 dark:bg-gray-700">
        <span>
          <Settings size={16} className="stroke-gray-700 dark:stroke-gray-300" />
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-scroll">
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
