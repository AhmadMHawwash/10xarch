import { cn } from "@/lib/utils";
import { type FC } from "react";
import { getBezierPath, type EdgeProps } from "reactflow";

export const CustomEdge: FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  id,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  return (
    <path
      id={id}
      style={{
        strokeWidth: "3px",
      }}
      className={cn("react-flow__edge-path")}
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
};
