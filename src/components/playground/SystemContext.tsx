"use client";
import { Textarea } from "@/components/ui/textarea";

const SystemContext = ({
  context,
  setContext,
}: {
  context: string;
  setContext: (context: string) => void;
}) => {
  return (
    <div className="p-1">
      <Textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className="w-full"
        rows={20}
        placeholder="Describe your system context here..."
      />
    </div>
  );
};

export default SystemContext;
