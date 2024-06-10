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
  const sessionCache1 = componentsNumberingStoreInstance.getNextId("Cache");

  const databaseReplication: Level = {
    id: "database-replication",
    name: "Database Replication",
    title: "Implement Database Replication for High Availability",
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
        type: "Cache",
        id: sessionCache1,
        configs: {
          type: "User Session",
        }
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
      {
        source: { id: server1 },
        target: { id: sessionCache1 },
      },
      {
        source: { id: server2 },
        target: { id: sessionCache1 },
      },
    ],
    description:
      "The single SQL database becomes a bottleneck. Introduce a primary and secondary SQL database to handle read and write operations separately.",
    criteria: [
      "At least 1 client",
      "At least 2 servers",
      "At least 1 load balancer for servers",
      "At least 1 cache with User Session configuration for session management",
      "There has to be 1 cache that's explicitly configured for session management in the solution provided",
      "At least 1 primary database for writing",
      "At least 1 replica database for reading",
    ],
  };

  return databaseReplication;
};
