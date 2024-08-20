import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { cn } from "@/lib/utils";
import { useRef, useState, type FC } from "react";
import {
  getBezierPath,
  type EdgeProps
} from "reactflow";
import { Textarea } from "./ui/textarea";

export const CustomEdge: FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  id,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const ref = useRef<HTMLTextAreaElement>(null);
  const { isApiRequestFlowMode } = useSystemDesigner();
  console.log(ref.current);
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
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
      {isApiRequestFlowMode && (
        <foreignObject
          style={{
            transform: `translate(${isFocused ? "-100px" : "-40px"}, ${isFocused ? "-50px" : "-15px"})`,
          }}
          width={isFocused ? 200 : 80}
          height={isFocused ? 100 : 30}
          x={labelX}
          y={labelY}
          className="edgebutton-foreignobject transition-all"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div
            className="
               flex
               w-fit
               items-center
               justify-center
             "
          >
            <Textarea
              ref={ref}
              value={content}
              rows={isFocused ? 4 : 1}
              onChange={(e) => setContent(e.target.value)}
              className="select-none transition-all resize-none nodrag nowheel"
              placeholder="How they interact with each other"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              // onChange={
              //   (v) => {}
              //   // onEdgeDataChange(id, { ...relationship, name: v })
              // }
              // onBlur={() => setNameLength(relationship?.name?.length)}
              // value={data?.name}
              // hasError={!!error}
            />
          </div>
        </foreignObject>
      )}
    </>
  );
};
