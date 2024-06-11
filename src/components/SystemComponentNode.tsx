import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { type SystemComponent } from "@/lib/levels/type";
import { cn } from "@/lib/utils";
import { type PiIcon } from "lucide-react";
import { memo, type FC } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Database } from "./SystemComponents/Database";
import { Small } from "./ui/typography";
import { Cache } from "./SystemComponents/Cache";
import { DatabaseCluster } from "./SystemComponents/Clusters/Database";
import { CacheCluster } from "./SystemComponents/Clusters/Cache";

export type SystemComponentNodeDataProps = {
  icon?: typeof PiIcon;
  id: string;
  name: SystemComponent["name"];
  withTargetHandle?: boolean;
  withSourceHandle?: boolean;
  configs: Record<string, unknown>;
};

export const SystemComponentNode: FC<
  NodeProps<SystemComponentNodeDataProps>
> = ({
  data: { icon: Icon, name, id, withTargetHandle, withSourceHandle },
  selected,
}) => {
  const { isEdgeBeingConnected } = useSystemDesigner();

  const Component = components[name] ?? DefaultComponent;
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
            !(withTargetHandle ?? withSourceHandle) &&
            "opacity-50",
        )}
      >
        <Component name={id} Icon={Icon} />
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

export default memo(SystemComponentNode);

export type ComponentNodeProps = {
  name: string;
  Icon: SystemComponentNodeDataProps["icon"];
};

const components: Partial<
  Record<
    SystemComponent["name"],
    ({ name, Icon }: ComponentNodeProps) => React.ReactElement
  >
> = {
  Database,
  Cache,
  "Database Cluster": DatabaseCluster,
  "Cache Cluster": CacheCluster,
};

const DefaultComponent = ({ name, Icon }: ComponentNodeProps) => (
  <>
    {Icon && <Icon height="20px" width="20px" />}
    <Small>{name}</Small>
  </>
);
