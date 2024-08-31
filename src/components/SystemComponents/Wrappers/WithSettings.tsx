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
        <span className="absolute right-[-14px] top-[-14px] rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
          <Settings size={16} className="stroke-gray-300" />
        </span>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Configuring {name}</DialogTitle>
          <DialogDescription className="text-gray-300">
            <Separator className="mb-4 mt-2 bg-gray-600" />
            <div className="flex items-center">{children}</div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
