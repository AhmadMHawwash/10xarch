import {
  type SystemComponent,
  type SystemComponentType,
} from "@/lib/levels/type";
import {
  Database,
  DatabaseZap,
  Globe,
  HardDriveDownload,
  MonitorSmartphone,
  Network,
  Server,
} from "lucide-react";
import type { DragEvent } from "react";
import { Lead } from "./ui/typography";

const components: Record<SystemComponentType, SystemComponent> = {
  Client: {
    name: "Client",
    description:
      "A client is a device that connects to the server and requests data from it.",
    icon: MonitorSmartphone,
  },
  Server: {
    name: "Server",
    description:
      "A server is a device that receives requests from clients and sends data back to them.",
    icon: Server,
  },
  "Load Balancer": {
    name: "Load Balancer",
    description:
      "A load balancer is a device that distributes incoming network traffic across multiple servers.",
    icon: Network,
  },
  Cache: {
    name: "Cache",
    description: "A cache is a device that stores data for future use.",
    icon: DatabaseZap,
  },
  CDN: {
    name: "CDN",
    description: "A cache is a device that stores data for future use.",
    icon: Globe,
  },
  Database: {
    name: "Database",
    description: "A database is a device that stores data for future use.",
    icon: Database,
  },
  "Message Queue": {
    name: "Message Queue",
    description:
      "A message queue is a device that queues asynchronous messages between system components.",
    icon: HardDriveDownload,
  },
  "Database Cluster": {
    name: "Database Cluster",
    description:
      "A database cluster is a group of databases that work together to store and serve data.",
    icon: () => (
      <div className="relative h-[20px] w-[20px]">
        <Database className="absolute -left-1 -top-1" size={20} />
        <Database
          className="absolute left-0 top-0 bg-gray-50 bg-opacity-60 p-0"
          size={20}
        />
      </div>
    ),
  },
  "Cache Cluster": {
    name: "Cache Cluster",
    description:
      "A cache cluster is a group of caches that work together to store and serve data.",
    icon: () => (
      <div className="relative h-[20px] w-[20px]">
        <DatabaseZap className="absolute -left-1 -top-1" size={20} />
        <DatabaseZap
          className="absolute left-0 top-0 bg-gray-50 bg-opacity-60 p-0"
          size={20}
        />
      </div>
    ),
  },
  "Server Cluster": {
    name: "Server Cluster",
    description:
      "A server cluster is a group of servers that work together to serve data.",
    icon: () => (
      <div className="relative h-[20px] w-[20px]">
        <Server className="absolute -left-1 -top-1" size={20} />
        <Server
          className="absolute left-0 top-0 bg-gray-50 bg-opacity-60 p-0"
          size={20}
        />
      </div>
    ),
  },
};

const Gallery = () => {
  const onDragStart = (event: DragEvent, nodeType: SystemComponentType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="m-2 h-fit w-fit flex-col rounded-md border border-gray-200 bg-gray-50 bg-opacity-70 p-2">
      <Lead className="h-fit">Components</Lead>
      {Object.values(components).map(({ name, icon: Icon }) => (
        <div
          key={name}
          className="my-1 flex cursor-grab items-center rounded-md border border-gray-200 bg-gray-50 bg-opacity-70 p-2"
          onDragStart={(event) => onDragStart(event, name)}
          draggable
        >
          {Icon && <Icon size={20} />}
          <div className="ml-2">{name}</div>
        </div>
      ))}
    </div>
  );
};

export default Gallery;

export const getSystemComponent = (type: SystemComponentType) => {
  return components[type];
};
