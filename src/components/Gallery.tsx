import { CacheIcon } from "@/lib/icons/cache";
import { CDNIcon } from "@/lib/icons/cdn";
import { DatabaseIcon } from "@/lib/icons/database";
import { LoadBalancerIcon } from "@/lib/icons/load-balancer";
import { MobileIcon } from "@/lib/icons/mobile";
import { ServerIcon } from "@/lib/icons/server";
import type { DragEvent } from "react";
import { Lead } from "./ui/typography";
import { Separator } from "./ui/separator";

type NodeType =
  | "Client"
  | "Server"
  | "Load Balancer"
  | "Cache"
  | "CDN"
  | "Database";

export type SystemComponent = {
  name: NodeType;
  description: string;
  icon?: typeof MobileIcon;
};

const components: SystemComponent[] = [
  {
    name: "Client",
    description:
      "A client is a device that connects to the server and requests data from it.",
    icon: MobileIcon,
  },
  {
    name: "Server",
    description:
      "A server is a device that receives requests from clients and sends data back to them.",
    icon: ServerIcon,
  },
  {
    name: "Load Balancer",
    description:
      "A load balancer is a device that distributes incoming network traffic across multiple servers.",
    icon: LoadBalancerIcon,
  },
  {
    name: "Cache",
    description: "A cache is a device that stores data for future use.",
    icon: CacheIcon,
  },
  {
    name: "CDN",
    description: "A cache is a device that stores data for future use.",
    icon: CDNIcon,
  },
  {
    name: "Database",
    description: "A database is a device that stores data for future use.",
    icon: DatabaseIcon,
  },
];

const Gallery = () => {
  const onDragStart = (event: DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="absolute left-0 top-0 m-2 h-fit w-fit flex-col rounded-md border border-gray-200 bg-gray-50 bg-opacity-70 p-2">
      <Lead className="h-fit">Components</Lead>
      {components.map(({ name, icon: Icon }) => (
        <div
          key={name}
          className="my-1 flex cursor-grab items-center rounded-md border border-gray-200 bg-gray-50 bg-opacity-70 p-2"
          onDragStart={(event) => onDragStart(event, name)}
          draggable
        >
          {Icon && <Icon height="20px" width="20px" fill="#000" />}
          <div className="ml-2">{name}</div>
        </div>
      ))}
    </div>
  );
};

export default Gallery;

export const getSystemComponent = (name: SystemComponent["name"]) => {
  const ComponentDetails = components.find(
    (component) => component.name === name,
  );

  return ComponentDetails;
};
