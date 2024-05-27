import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { type MobileIcon } from "@/lib/icons/mobile";
import { cn } from "@/lib/utils";
import { memo, type FC } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { SystemComponent } from "./Gallery";

export type SystemComponentNodeDataProps = {
  icon?: typeof MobileIcon;
  id: number;
  name: SystemComponent["name"];
  withTargetHandle?: boolean;
  withSourceHandle?: boolean;
};

export const SystemComponentNode: FC<
  NodeProps<SystemComponentNodeDataProps>
> = ({
  data: { icon: Icon, name, withTargetHandle, withSourceHandle },
  selected,
}) => {
  const { isEdgeBeingConnected } = useSystemDesigner();

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#aaa" }}
        className="transition-all"
      />
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-sm border border-gray-400 p-2",
          selected ? "bg-gray-300" : "bg-gray-100",
          isEdgeBeingConnected &&
            !(withTargetHandle || withSourceHandle) &&
            "opacity-50",
        )}
      >
        {Icon && <Icon height="20px" width="20px" fill="#000" />}
        <div>{name}</div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#aaa" }}
        className="transition-all"
      />
    </>
  );
};

SystemComponentNode.displayName = "SystemComponentNode";

export default memo(SystemComponentNode);
