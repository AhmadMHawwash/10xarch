import { cn } from "@/lib/utils";
import { useState, type FC } from "react";
import { getBezierPath, EdgeLabelRenderer, type EdgeProps } from "reactflow";
import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";

interface EdgeData {
  label?: string;
}

export const CustomEdge: FC<EdgeProps<EdgeData>> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  id,
  data,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { updateEdgeLabel } = useSystemDesigner();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    updateEdgeLabel(id, e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      updateEdgeLabel(id, e.currentTarget.value);
    }
  };

  return (
    <>
      <path
        id={id}
        style={{
          strokeWidth: "3px",
        }}
        className={cn("react-flow__edge-path")}
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditing ? (
            <input
              type="text"
              defaultValue={data?.label ?? ''}
              placeholder="Type edge label"
              className="min-w-[100px] rounded border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              autoFocus
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div
              onDoubleClick={handleDoubleClick}
              className={cn(
                "min-w-[30px] cursor-pointer rounded px-2 py-1 text-center text-sm transition-all",
                data?.label 
                  ? "bg-white/90 shadow-sm hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800" 
                  : isHovered 
                    ? "bg-gray-100/90 dark:bg-gray-700/90"
                    : "bg-gray-100/50 dark:bg-gray-700/50",
                "border border-transparent",
                isHovered && !data?.label && "border-dashed border-gray-400 dark:border-gray-500"
              )}
            >
              {data?.label ?? (isHovered ? 'Add label' : '•••')}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
