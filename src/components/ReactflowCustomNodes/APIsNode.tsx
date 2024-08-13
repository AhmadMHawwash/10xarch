import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { type FC } from "react";
import { type NodeProps } from "reactflow";
import { Button } from "../ui/button";

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
    <div className="flex w-32 max-w-32 flex-col gap-1 rounded-sm border bg-slate-50 p-1">
      {apis?.map(([key]) => (
        <Button
          variant="outline"
          onClick={console.log}
          size="sm"
          className="truncate text-ellipsis"
          key={key}
        >
          {key}
        </Button>
      ))}
    </div>
  );
};

export default APIsNode;

export const useWhiteboard = () => {
  const { useSystemComponentConfigSlice } = useChallengeManager();

  const whiteboardId = "Whiteboard-1";
  const [apis, setApis] = useSystemComponentConfigSlice<[string, string][]>(
    whiteboardId,
    "API definitions",
    [["new api", ""]],
  );

  const [functional, setFunctional] = useSystemComponentConfigSlice<string>(
    whiteboardId,
    "functional requirements",
  );
  const [nonfunctional, setNonfunctional] =
    useSystemComponentConfigSlice<string>(
      whiteboardId,
      "non-functional requirements",
    );

  const [capacity, setCapacity] = useSystemComponentConfigSlice<string>(
    whiteboardId,
    "Capacity estimations",
  );

  return {
    apis,
    setApis,
    functional,
    setFunctional,
    nonfunctional,
    setNonfunctional,
    capacity,
    setCapacity,
  };
};
