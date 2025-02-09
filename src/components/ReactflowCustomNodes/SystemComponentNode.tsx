import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import {
  type SystemComponent,
  type SystemComponentType,
} from "@/lib/levels/type";
import { cn } from "@/lib/utils";
import { InfoIcon, type PiIcon } from "lucide-react";
import { Handle, Position, type NodeProps } from "reactflow";
import { getSystemComponent } from "../Gallery";
import { Cache } from "../SystemComponents/Cache";
import { CacheCluster } from "../SystemComponents/Clusters/Cache";
import { DatabaseCluster } from "../SystemComponents/Clusters/Database";
import { ServerCluster } from "../SystemComponents/Clusters/Server";
import { Database } from "../SystemComponents/Database";
import { WithMarkdownDetails } from "../SystemComponents/Wrappers/WithMarkdownDetails";
import { Small } from "../ui/typography";
import { Client } from "../SystemComponents/Client";
import { Server } from "../SystemComponents/Server";
import { LoadBalancer } from "../SystemComponents/LoadBalancer";
import { CDN } from "../SystemComponents/CDN";
import { MessageQueue } from "../SystemComponents/MessageQueue";

export type SystemComponentNodeDataProps = {
  icon?: typeof PiIcon;
  id: string;
  name: SystemComponent["name"];
  withTargetHandle?: boolean;
  withSourceHandle?: boolean;
  configs: Record<string, unknown>;
  displayName?: string;
};

export type OtherNodeDataProps = {
  icon?: typeof PiIcon;
  id: string;
  name: "Whiteboard" | "Group" | "APIs List";
  withTargetHandle?: boolean;
  withSourceHandle?: boolean;
  configs: Record<string, unknown>;
  displayName?: string;
};

export default function SystemComponentNode({
  data,
  selected,
}: NodeProps<SystemComponentNodeDataProps>) {
  const { isEdgeBeingConnected } = useSystemDesigner();

  const Component = components[data.name] ?? DefaultComponent;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { icon: ComponentIcon, content } = getSystemComponent(data.name);
  const displayName = data.configs["display name"] as string;
  return (
    <>
      {!withoutTargetHandle.includes(data.name) && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: "#aaa", width: "10px", height: "10px" }}
          className="transition-all"
        />
      )}
      <div
        className={cn(
          "group flex max-w-[200px] flex-col items-center justify-center rounded-sm border border-gray-300 p-2 dark:border-gray-600",
          selected
            ? "bg-gray-200 dark:bg-gray-700"
            : "bg-gray-100 dark:bg-gray-800",
          isEdgeBeingConnected &&
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            !(data.withTargetHandle || data.withSourceHandle) &&
            "opacity-50",
        )}
      >
        <Component name={displayName || data.id} Icon={data.icon} />
        {content && (
          <WithMarkdownDetails
            className="absolute left-0 top-[-17px] rounded-full bg-gray-200 opacity-0 transition-all group-hover:opacity-100 dark:bg-gray-700"
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            Icon={ComponentIcon}
            content={content}
            trigger={
              <InfoIcon
                size={16}
                className="stroke-gray-700 dark:stroke-gray-300"
              />
            }
          />
        )}
      </div>

      {!withoutSourceHandle.includes(data.name) && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: "#aaa", width: "10px", height: "10px" }}
          className="transition-all"
        />
      )}
    </>
  );
}

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
  Client,
  Server,
  Database,
  Cache,
  CDN,
  "Message Queue": MessageQueue,
  "Load Balancer": LoadBalancer,
  "Database Cluster": DatabaseCluster,
  "Cache Cluster": CacheCluster,
  "Server Cluster": ServerCluster,
};

const DefaultComponent = ({ name, Icon }: ComponentNodeProps) => (
  <>
    {Icon && (
      <Icon
        height="20px"
        width="20px"
        className="text-gray-700 dark:text-gray-300"
      />
    )}
    <Small className="text-gray-700 dark:text-gray-300">{name}</Small>
  </>
);

const withoutTargetHandle: SystemComponentType[] = ["Client"];
const withoutSourceHandle: SystemComponentType[] = [
  "Database",
  "Database Cluster",
];
