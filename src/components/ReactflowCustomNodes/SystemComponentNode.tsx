import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import {
  type SystemComponentType,
  type SystemComponent,
} from "@/lib/levels/type";
import { cn } from "@/lib/utils";
import { InfoIcon, type PiIcon } from "lucide-react";
import { memo, type FC } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { getSystemComponent } from "../Gallery";
import { Cache } from "../SystemComponents/Cache";
import { CacheCluster } from "../SystemComponents/Clusters/Cache";
import { DatabaseCluster } from "../SystemComponents/Clusters/Database";
import { ServerCluster } from "../SystemComponents/Clusters/Server";
import { Database } from "../SystemComponents/Database";
import { Whiteboard } from "../SystemComponents/Whiteboard";
import { WithMarkdownDetails } from "../SystemComponents/Wrappers/WithMarkdownDetails";
import { Small } from "../ui/typography";

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { icon: ComponentIcon, content } = getSystemComponent(name);
  return (
    <>
      {withoutTargetHandle.includes(name) ? null : (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: "#aaa", width: "10px", height: "10px" }}
          className="transition-all"
        />
      )}
      <div
        className={cn(
          "group flex flex-col items-center justify-center rounded-sm border border-gray-400 p-2",
          selected ? "bg-gray-300" : "bg-gray-100",
          isEdgeBeingConnected &&
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            !(withTargetHandle || withSourceHandle) &&
            "opacity-50",
        )}
      >
        <Component name={id} Icon={Icon} />
        {content && (
          <WithMarkdownDetails
            className="absolute left-0 top-[-17px] rounded-full bg-gray-100 opacity-0 transition-all group-hover:opacity-100"
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            Icon={ComponentIcon}
            content={content}
            trigger={<InfoIcon size={16} className="stroke-gray-500" />}
          />
        )}
      </div>

      {withoutSourceHandle.includes(name) ? null : (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: "#aaa", width: "10px", height: "10px" }}
          className="transition-all"
        />
      )}
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
  "Server Cluster": ServerCluster,
  Whiteboard,
};

const DefaultComponent = ({ name, Icon }: ComponentNodeProps) => (
  <>
    {Icon && <Icon height="20px" width="20px" />}
    <Small>{name}</Small>
  </>
);

const withoutTargetHandle: SystemComponentType[] = ["Whiteboard", "Client"];
const withoutSourceHandle: SystemComponentType[] = [
  "Whiteboard",
  "Database",
  "Database Cluster",
];
