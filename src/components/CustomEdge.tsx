import { cn } from "@/lib/utils";
import { useState, type FC } from "react";
import { getBezierPath, EdgeLabelRenderer, type EdgeProps, type Edge } from "reactflow";
import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";

interface EdgeData {
  apiDefinition?: string;
  requestFlow?: string;
  label?: string;
  [key: string]: unknown;
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
  selected,
  source,
  target,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { updateEdgeLabel, onSelectEdge, onSelectNode } = useSystemDesigner();
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

  const handleEdgeMouseEnter = () => {
    setIsHovered(true);
  };

  const handleEdgeMouseLeave = () => {
    setIsHovered(false);
  };

  const handleEdgeClick = (e: React.MouseEvent) => {
    // Open the edge settings panel
    e.stopPropagation();
    const edge: Edge<EdgeData> = { 
      id, 
      data: data ?? {}, 
      source: source ?? '', 
      target: target ?? '', 
      // We don't include sourceHandle/targetHandle as they might not be necessary
      // and we're just creating a temporary object for selection
    };
    onSelectEdge(edge);
    onSelectNode(null);
  };

  return (
    <>
      {/* Invisible wider path for easier interaction - 12px width */}
      <path
        id={`${id}-hitbox`}
        d={edgePath}
        className="react-flow__edge-interaction"
        onMouseEnter={handleEdgeMouseEnter}
        onMouseLeave={handleEdgeMouseLeave}
        onClick={handleEdgeClick}
        style={{
          strokeWidth: "12px",
          stroke: "transparent",
          fill: "none",
          cursor: "pointer",
        }}
      />
      
      {/* Actual visible path */}
      <path
        id={id}
        style={{
          strokeWidth: selected ? "6px" : (isHovered ? "4px" : "3px"),
          transition: "stroke-width 0.2s, stroke 0.2s",
          cursor: "pointer",
          filter: selected ? "drop-shadow(0 0 6px rgba(37, 99, 235, 0.8))" : "none",
          stroke: selected ? "#2563eb" : undefined, // Blue-600
        }}
        className={cn(
          "react-flow__edge-path",
          selected ? "!stroke-blue-600 dark:!stroke-blue-400" : "",
          selected && "selected-edge"
        )}
        d={edgePath}
        markerEnd={markerEnd}
        onMouseEnter={handleEdgeMouseEnter}
        onMouseLeave={handleEdgeMouseLeave}
        onClick={handleEdgeClick}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan relative group"
          onMouseEnter={handleEdgeMouseEnter}
          onMouseLeave={handleEdgeMouseLeave}
          onClick={handleEdgeClick}
        >
          {isEditing ? (
            <input
              type="text"
              defaultValue={data?.label ?? ""}
              placeholder="Add connection title"
              className="min-w-[100px] rounded border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              autoFocus
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
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
                isHovered && !data?.label && "border-dashed border-gray-400 dark:border-gray-500",
                selected && "ring-2 ring-blue-500 dark:ring-blue-400 shadow-md"
              )}
            >
              {data?.label ?? (isHovered ? 'Click to configure' : '•••')}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
