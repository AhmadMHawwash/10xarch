import { memo, type FC } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { SystemComponent } from "./Gallery";
import { type MobileIcon } from "@/lib/icons/mobile";
import { cn } from "@/lib/utils";
import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";

export type SystemComponentNodeDataProps = {
  icon?: typeof MobileIcon;
  name: SystemComponent["name"];
  withTargetHandle?: boolean;
};

export const SystemComponentNode: FC<
  NodeProps<SystemComponentNodeDataProps>
> = ({ data: { icon: Icon, name, withTargetHandle }, selected }) => {
  const { isEdgeBeingConnected } = useSystemDesigner();
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={
          withTargetHandle
            ? {
                background: "#555",
                ...(isEdgeBeingConnected && {
                  width: 12,
                  height: 12,
                  left: -6,
                }),
              }
            : { background: "#aaa" }
        }
        className="transition-all"
      />
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-sm border border-gray-400 p-2",
          selected ? "bg-gray-300" : "bg-gray-100",
        )}
      >
        {Icon && <Icon height="20px" width="20px" fill="#000" />}
        <div>{name}</div>
      </div>

      <Handle type="source" position={Position.Right} />
    </>
  );
};

SystemComponentNode.displayName = "SystemComponentNode";

export default memo(SystemComponentNode);
