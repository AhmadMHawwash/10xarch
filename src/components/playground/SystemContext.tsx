"use client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";

const SystemContext = ({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
}: {
  title?: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => {
  return (
    <div className="space-y-4 p-1">
      <div>
        <Label htmlFor="playground-title" className="text-sm font-medium">
          Playground Title
        </Label>
        <Input
          id="playground-title"
          className="mt-1 w-full"
          placeholder="Enter playground title"
          value={title ?? ""}
          onChange={onTitleChange}
        />
      </div>
      {/* Description input */}
      <div>
        <Label htmlFor="playground-description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="playground-description"
          className="mt-1 w-full"
          placeholder="Enter playground description"
          value={description ?? ""}
          onChange={onDescriptionChange}
          rows={3}
        />
      </div>
    </div>
  );
};

export default SystemContext;
