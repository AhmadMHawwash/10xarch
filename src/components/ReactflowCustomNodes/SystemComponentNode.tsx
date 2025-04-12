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
import { CDN } from "../SystemComponents/CDN";
import { Client } from "../SystemComponents/Client";
import { CustomComponent } from "../SystemComponents/CustomComponent";
import { Database } from "../SystemComponents/Database";
import { LoadBalancer } from "../SystemComponents/LoadBalancer";
import { MessageQueue } from "../SystemComponents/MessageQueue";
import { Server } from "../SystemComponents/Server";
import { WithMarkdownDetails } from "../SystemComponents/Wrappers/WithMarkdownDetails";
import { Muted, Small } from "../ui/typography";
import { useRef } from "react";
import {
  type NodeSettingsRefObject,
  type NodeSettingsRef,
} from "@/types/system";

export type SystemComponentNodeDataProps = {
  icon?: typeof PiIcon;
  id: string;
  name: SystemComponent["name"];
  withTargetHandle?: boolean;
  withSourceHandle?: boolean;
  configs: Record<string, unknown>;
  displayName?: string;
  subtitle?: string;
  title?: string;
  targetHandles?: Array<{ id: string; isConnected: boolean }>;
  sourceHandles?: Array<{ id: string; isConnected: boolean }>;
};

export type OtherNodeDataProps = {
  icon?: typeof PiIcon;
  id: string;
  name: "Whiteboard" | "Group" | "APIs List";
  withTargetHandle?: boolean;
  withSourceHandle?: boolean;
  configs: Record<string, unknown>;
  displayName?: string;
  subtitle?: string;
  title?: string;
  targetHandles?: Array<{ id: string; isConnected: boolean }>;
  sourceHandles?: Array<{ id: string; isConnected: boolean }>;
};

export default function SystemComponentNode({
  data,
  selected,
}: NodeProps<SystemComponentNodeDataProps>) {
  const { isEdgeBeingConnected } = useSystemDesigner();
  const nodeSettingsRef = useRef<NodeSettingsRef>(null);

  const Component = components[data.name] ?? DefaultComponent;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { icon: ComponentIcon, content } = getSystemComponent(data.name);
  const displayName =
    data.name === "Custom Component"
      ? (data.configs.title as string) || "Custom Component"
      : (data.configs.title as string);

  // Calculate positions for target handles
  const targetHandles = data.targetHandles ?? [];
  const sourceHandles = data.sourceHandles ?? [];
  const handleSpacing = 30; // pixels between handles
  const targetTotalHeight = (targetHandles.length - 1) * handleSpacing;
  const sourceTotalHeight = (sourceHandles.length - 1) * handleSpacing;

  return (
    <>
      {!withoutTargetHandle.includes(data.name) &&
        targetHandles.map((handle, index) => {
          const yOffset = -targetTotalHeight / 2 + index * handleSpacing;
          return (
            <Handle
              key={handle.id}
              type="target"
              position={Position.Left}
              id={handle.id}
              isConnectable={!handle.isConnected}
              style={{
                background: handle.isConnected ? "#4CAF50" : "#aaa",
                width: "10px",
                height: "10px",
                top: `calc(50% + ${yOffset}px)`,
                cursor: handle.isConnected ? "not-allowed" : "pointer",
                zIndex: 5,
              }}
              className={cn(
                "transition-all",
                handle.isConnected && "opacity-50",
              )}
            />
          );
        })}
      <div
        className={cn(
          "group relative flex max-w-[200px] flex-col items-center justify-center rounded-sm border border-gray-300 p-4 dark:border-gray-600",
          selected
            ? "bg-gray-200 dark:bg-gray-700"
            : "bg-gray-100 dark:bg-gray-800",
          isEdgeBeingConnected &&
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            !(data.withTargetHandle || data.withSourceHandle) &&
            "opacity-50",
        )}
        style={{
          height: `${Math.max(targetTotalHeight, sourceTotalHeight) + (data.configs.subtitle ? 80 : 60)}px`,
        }}
      >
        <Component
          name={displayName ?? data.id}
          nodeId={data.id}
          Icon={data.icon}
          nodeSettingsRef={nodeSettingsRef}
          subtitle={data.configs.subtitle as string}
        />
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

      {!withoutSourceHandle.includes(data.name) &&
        sourceHandles.map((handle, index) => {
          const yOffset = -sourceTotalHeight / 2 + index * handleSpacing;
          return (
            <Handle
              key={handle.id}
              type="source"
              position={Position.Right}
              id={handle.id}
              isConnectable={!handle.isConnected}
              style={{
                background: handle.isConnected ? "#4CAF50" : "#aaa",
                width: "10px",
                height: "10px",
                top: `calc(50% + ${yOffset}px)`,
                cursor: handle.isConnected ? "not-allowed" : "pointer",
              }}
              className={cn(
                "transition-all",
                handle.isConnected && "opacity-50",
              )}
            />
          );
        })}
    </>
  );
}

export type ComponentNodeProps = {
  name: string;
  nodeId?: string;
  Icon?: SystemComponentNodeDataProps["icon"];
  nodeSettingsRef?: NodeSettingsRefObject;
  subtitle?: string;
};

const DefaultComponent = ({ name, Icon, subtitle }: ComponentNodeProps) => (
  <>
    {Icon && (
      <Icon
        height="20px"
        width="20px"
        className="text-gray-700 dark:text-gray-300"
      />
    )}
    <Small className="text-gray-700 dark:text-gray-300">{name}</Small>
    {subtitle && subtitle !== name && <Muted>{subtitle}</Muted>}
  </>
);

const components: Partial<
  Record<
    SystemComponent["name"],
    ({
      name,
      Icon,
      nodeSettingsRef,
      subtitle,
    }: ComponentNodeProps) => React.ReactElement
  >
> = {
  Client: DefaultComponent,
  Server: DefaultComponent,
  Database: DefaultComponent,
  Cache: DefaultComponent,
  CDN: DefaultComponent,
  "Message Queue": DefaultComponent,
  "Load Balancer": DefaultComponent,
  "Custom Component": CustomComponent,
};

const withoutTargetHandle: SystemComponentType[] = ["Client"];
const withoutSourceHandle: SystemComponentType[] = ["Database"];
