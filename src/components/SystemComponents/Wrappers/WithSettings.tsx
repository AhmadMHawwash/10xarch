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

export const WithSettings = ({
  name,
  children,
}: {
  name: string;
  children?: React.ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger>
        <span className="absolute right-[-14px] top-[-14px] rounded-full bg-gray-200 dark:bg-gray-700">
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
