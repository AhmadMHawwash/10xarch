import type { FC } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "reactflow";

export const CustomEdge: FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  return <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />;
};
