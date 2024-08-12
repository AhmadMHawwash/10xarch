import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { type FC } from "react";
import { type NodeProps } from "reactflow";

export type SystemComponentNodeDataProps = {
  id: string;
};

export const APIsNode: FC<NodeProps<SystemComponentNodeDataProps>> = () => {
  const { useSystemComponentConfigSlice } = useChallengeManager();

  const [apis] = useSystemComponentConfigSlice<[string, string][]>(
    "Whiteboard-1",
    "API definitions",
  );

  return (
    <div className="flex w-32 max-w-32 flex-col gap-1 rounded-sm bg-slate-100 border">
      {apis?.map(([key]) => (
        <div className="bg-slate-200 text-ellipsis truncate p-1" key={key}>
          {key}
        </div>
      ))}
    </div>
  );
};

export default APIsNode;
