"use client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";

const SystemContext = ({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  canEdit = true,
}: {
  title?: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  canEdit?: boolean;
}) => {
  return (
    <div className="space-y-4 p-1">
      <div>
        <Label htmlFor="playground-title" className="text-sm font-medium">
          Playground Title {!canEdit && <span className="text-xs text-gray-500">(Read Only)</span>}
        </Label>
        <Input
          id="playground-title"
          className="mt-1 w-full"
          placeholder="Enter playground title"
          value={title ?? ""}
          onChange={onTitleChange}
          readOnly={!canEdit}
        />
      </div>
      {/* Description input */}
      <div>
        <Label htmlFor="playground-description" className="text-sm font-medium">
          Description {!canEdit && <span className="text-xs text-gray-500">(Read Only)</span>}
        </Label>
        <Textarea
          id="playground-description"
          className="mt-1 w-full"
          placeholder="Enter playground description"
          value={description ?? ""}
          onChange={onDescriptionChange}
          rows={20}
          readOnly={!canEdit}
        />
      </div>
    </div>
  );
};

export default SystemContext;
