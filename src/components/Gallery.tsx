import { cache } from "@/content/cache";
import { cdn } from "@/content/cdn";
import { client } from "@/content/client";
import { database } from "@/content/database";
import { loadBalancer } from "@/content/load-balancer";
import { messageQueue } from "@/content/message-queue";
import { server } from "@/content/server";
import { type SystemComponent, type SystemComponentType } from "@/lib/levels/type";
import {
  Database,
  DatabaseZap,
  Globe,
  HardDriveDownload,
  MonitorSmartphone,
  Network,
  Search,
  Server,
  Box,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import type { DragEvent } from "react";
import { useState } from "react";
import { Lead } from "./ui/typography";
import { cn } from "@/lib/utils";

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
  "Custom Component": {
    name: "Custom Component",
    description:
      "A custom component that can be configured to represent any system component you need.",
    icon: Box,
    content: "# Custom Component\nA configurable component that can represent any system element you need in your architecture.",
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
  "Custom Components": ["Custom Component"],
};

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const onDragStart = (event: DragEvent, nodeType: SystemComponentType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const filteredComponents = Object.entries(components).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={cn(
      "transition-all duration-300 ease-in-out m-2 w-48 flex flex-col rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 bg-opacity-70",
      collapsed ? "h-10" : "h-fit"
    )}>
      <div 
        className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onClick={toggleCollapsed}
      >
        <Lead className={cn(
          "h-fit text-gray-800 dark:text-gray-200 text-sm",
          collapsed ? "" : "mb-0" 
        )}>Components</Lead>
        {collapsed ? (
          <ChevronDown className="text-gray-700 dark:text-gray-300" size={16} />
        ) : (
          <ChevronUp className="text-gray-700 dark:text-gray-300" size={16} />
        )}
      </div>
      <div className={cn(
        "transition-all duration-300 overflow-hidden px-2 pb-2",
        collapsed ? "h-0 opacity-0" : "opacity-100"
      )}>
        <div className="relative mb-2 component-search">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md pr-6"
          />
          <Search className="absolute right-1 top-1 text-gray-600 dark:text-gray-400" size={14} />
        </div>
        <div className="max-h-64 overflow-y-auto component-list">
          {filteredComponents.map(([name, { icon: Icon, description }]) => (
            <div
              key={name}
              className="component-item my-1 flex cursor-grab items-center rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 bg-opacity-70 p-1 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
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
    </div>
  );
};

export default Gallery;

export const getSystemComponent = (type: SystemComponentType) => {
  return components[type];
};
