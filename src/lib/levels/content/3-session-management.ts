import { type Level } from "../type";
import { componentsNumberingStore } from "../utils";

const componentsNumberingStoreInstance = componentsNumberingStore.getState();

export const databaseReplicationLevelMaker = () => {
  const client1 = componentsNumberingStoreInstance.getNextId("Client");
  const loadbalancer1 =
    componentsNumberingStoreInstance.getNextId("Load Balancer");
  const server1 = componentsNumberingStoreInstance.getNextId("Server");
  const server2 = componentsNumberingStoreInstance.getNextId("Server");
  const database1 = componentsNumberingStoreInstance.getNextId("Database");

  const databaseReplication: Level = {
    id: "session-management",
    name: "Session Management",
    title: "Implement Session management for user experience consistency",
    description:
      "After adding more servers, user state is distributed across multiple servers, which introduces users' consistent experience. Implement session management to provide a consistent experience to users.",
    preConnectedComponents: [
      {
        type: "Client",
        id: client1,
      },
      {
        type: "Load Balancer",
        id: loadbalancer1,
      },
      {
        type: "Server",
        id: server1,
      },
      {
        type: "Server",
        id: server2,
      },
      {
        type: "Database",
        id: database1,
      },
    ],
    preConnectedConnections: [
      {
        source: { id: client1 },
        target: { id: loadbalancer1 },
      },
      {
        source: { id: loadbalancer1 },
        target: { id: server1 },
      },
      {
        source: { id: loadbalancer1 },
        target: { id: server2 },
      },
      {
        source: { id: server1 },
        target: { id: database1 },
      },
      {
        source: { id: server2 },
        target: { id: database1 },
      },
    ],
    criteria: [
      "At least 1 client",
      "At least 2 server",
      "At least 1 load balancer for servers",
      "At least 1 database",
      "At least 1 cache for session management",
    ],
  };

  return databaseReplication;
};
