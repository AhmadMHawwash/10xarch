import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

export const WithSettings = ({
  name,
  children,
  onSave,
}: {
  name: string;
  children?: React.ReactNode;
  onSave: () => void;
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
        <DialogFooter>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
