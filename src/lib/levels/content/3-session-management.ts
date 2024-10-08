import { type Stage } from "../type";
import { componentsNumberingStore } from "../utils";

const componentsNumberingStoreInstance = componentsNumberingStore.getState();

export const sessionManagementStageMaker = () => {
  const client1 = componentsNumberingStoreInstance.getNextId("Client");
  const loadbalancer1 =
    componentsNumberingStoreInstance.getNextId("Load Balancer");
  const server1 = componentsNumberingStoreInstance.getNextId("Server");
  const server2 = componentsNumberingStoreInstance.getNextId("Server");
  const database1 = componentsNumberingStoreInstance.getNextId("Database");

  const sessionManagement: Stage = {
    id: "session-management",
    name: "Session Management",
    title: "Implement Session management for user experience consistency",
    description:
      "After adding more servers, user state is distributed across multiple servers, which introduces users' consistent experience. Implement session management to provide a consistent experience to users.",
    preConnectedComponents: [
      {
        type: "Client",
        id: client1,
        targets: [loadbalancer1],
      },
      {
        type: "Load Balancer",
        id: loadbalancer1,
        targets: [server1, server2],
      },
      {
        type: "Server",
        id: server1,
        targets: [database1],
      },
      {
        type: "Server",
        id: server2,
        targets: [database1],
      },
      {
        type: "Database",
        id: database1,
        targets: [],
      },
    ],
    criteria: [
      "At least 1 client",
      "At least 2 server",
      "At least 1 database",
      "At least 1 load balancer for servers",
      "Servers connected to load balancer should connect to the database.",

      "At least 1 cache with User Session configuration for session management",
      "If the cache is not explicitly configured for session management, the solution will not be accepted.",
      "There has to be 1 cache that's explicitly configured for session management in the solution provided, otherwise the solution will not be accepted.",
    ],
  };

  return sessionManagement;
};
