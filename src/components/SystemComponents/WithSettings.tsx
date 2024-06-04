import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Separator } from "../ui/separator";

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
        <span className="absolute right-[-14px] top-[-14px] rounded-full bg-gray-100">
          <Settings size={16} className="stroke-gray-500" />
        </span>
      </DialogTrigger>
      <DialogContent>
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
