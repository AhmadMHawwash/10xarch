import { useState } from "react";
import { type SystemComponent, type SystemComponentType } from "@/lib/levels/type";
import {
  Database,
  DatabaseZap,
  Globe,
  HardDriveDownload,
  MonitorSmartphone,
  Network,
  Server,
  Search,
} from "lucide-react";
import type { DragEvent } from "react";
import { Lead } from "./ui/typography";
import { server } from "@/content/server";
import { loadBalancer } from "@/content/load-balancer";
import { cache } from "@/content/cache";
import { database } from "@/content/database";
import { cdn } from "@/content/cdn";
import { messageQueue } from "@/content/message-queue";
import { databaseCluster } from "@/content/database-cluster";
import { cacheCluster } from "@/content/cache-cluster";
import { serverCluster } from "@/content/server-cluster";
import { client } from "@/content/client";

const components: Record<SystemComponentType, SystemComponent> = {
  Client: {
    name: "Client",
    description:
      "A client is a device that connects to the server and requests data from it.",
    icon: MonitorSmartphone,
    content: client,
  },
  Server: {
    name: "Server",
    description:
      "A server is a device that receives requests from clients and sends data back to them.",
    icon: Server,
    content: server,
  },
  "Load Balancer": {
    name: "Load Balancer",
    description:
      "A load balancer is a device that distributes incoming network traffic across multiple servers.",
    icon: Network,
    content: loadBalancer,
  },
  Cache: {
    name: "Cache",
    description: "A cache is a device that stores data for future use.",
    icon: DatabaseZap,
    content: cache,
  },
  CDN: {
    name: "CDN",
    description: "A cache is a device that stores data for future use.",
    icon: Globe,
    content: cdn,
  },
  Database: {
    name: "Database",
    description: "A database is a device that stores data for future use.",
    icon: Database,
    content: database,
  },
  "Message Queue": {
    name: "Message Queue",
    description:
      "A message queue is a device that queues asynchronous messages between system components.",
    icon: HardDriveDownload,
    content: messageQueue,
  },
  "Database Cluster": {
    name: "Database Cluster",
    description:
      "A database cluster is a group of databases that work together to store and serve data.",
    icon: () => (
      <div className="relative h-[16px] w-[16px] mr-1">
        <Database className="absolute -left-0.5 -top-0.5" size={16} />
        <Database
          className="absolute left-0.5 top-0.5 bg-gray-100 dark:bg-gray-900 bg-opacity-60 p-0"
          size={16}
        />
      </div>
    ),
    content: databaseCluster,
  },
  "Cache Cluster": {
    name: "Cache Cluster",
    description:
      "A cache cluster is a group of caches that work together to store and serve data.",
    icon: () => (
      <div className="relative h-[16px] w-[16px] mr-1">
        <DatabaseZap className="absolute -left-0.5 -top-0.5" size={16} />
        <DatabaseZap
          className="absolute left-0.5 top-0.5 bg- dark:bg-gray-900 bg-opacity-60 p-0"
          size={16}
        />
      </div>
    ),
    content: cacheCluster,
  },
  "Server Cluster": {
    name: "Server Cluster",
    description:
      "A server cluster is a group of servers that work together to serve data.",
    icon: () => (
      <div className="relative h-[16px] w-[16px] mr-1">
        <Server className="absolute -left-0.5 -top-0.5" size={16} />
        <Server
          className="absolute left-0.5 top-0.5 bg- dark:bg-gray-900 bg-opacity-60 p-0"
          size={16}
        />
      </div>
    ),
    content: serverCluster,
  },
//   Whiteboard: {
//     description:
//       "Whiteboard is your area to write your notes and thoughts about the system.",
//     name: "Whiteboard",
//     icon: PresentationIcon,
//     content: `# Whiteboard
// Is your digital area where you can write down your notes and thoughts about the system.

// It includes 3 main areas:
// - **Requirements**: where you define functional and non-functional requirements of the system.
// - **System API**: where you define the API endpoints and their expected behavior.
// - **Capacity estimations**: where you define the expected traffic, storage, memory, and bandwidth requirements of the system.

// Defining these 3 areas at the beginning will help you design the system in a thoughtful and considerable way.
//     `,
//   },
};

const componentCategories = {
  "Basic Components": ["Client", "Server", "Database"],
  "Advanced Components": ["Load Balancer", "Cache", "CDN", "Message Queue"],
  "Clustered Components": ["Database Cluster", "Cache Cluster", "Server Cluster"],
};

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const onDragStart = (event: DragEvent, nodeType: SystemComponentType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const filteredComponents = Object.entries(components).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="m-2 h-fit w-48 flex-col rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 bg-opacity-70 p-2">
      <Lead className="h-fit text-gray-800 dark:text-gray-200 mb-2 text-sm">Components</Lead>
      <div className="relative mb-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md pr-6"
        />
        <Search className="absolute right-1 top-1 text-gray-600 dark:text-gray-400" size={14} />
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filteredComponents.map(([name, { icon: Icon, description }]) => (
          <div
            key={name}
            className="my-1 flex cursor-grab items-center rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 bg-opacity-70 p-1 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            onDragStart={(event) => onDragStart(event, name as SystemComponentType)}
            draggable
            title={description}
          >
            {Icon && <Icon size={16} className="text-gray-700 dark:text-gray-300 mr-1" />}
            <div className="text-xs">{name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;

export const getSystemComponent = (type: SystemComponentType) => {
  return components[type];
};
