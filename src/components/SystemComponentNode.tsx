import { memo, type FC } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { SystemComponent } from "./Gallery";
import { type MobileIcon } from "@/lib/icons/mobile";

export type SystemComponentNodeDataProps = {
  icon?: typeof MobileIcon;
  name: SystemComponent["name"];
  withTargetHandle?: boolean;
};

export const SystemComponentNode: FC<
  NodeProps<SystemComponentNodeDataProps>
> = ({ data: { icon: Icon, name, withTargetHandle } }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: withTargetHandle ? "#555" : "#aaa" }}
      />
      <div className="flex flex-col items-center justify-center rounded-sm border border-gray-400 p-2">
        {Icon && <Icon height="20px" width="20px" fill="#000" />}
        <div>{name}</div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: withTargetHandle ? "#555" : "#aaa" }}
      />
    </>
  );
};

SystemComponentNode.displayName = "SystemComponentNode";

export default memo(SystemComponentNode);
