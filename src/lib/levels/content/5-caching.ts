import { type Level } from "../type";
import { componentsNumberingStore } from "../utils";

const componentsNumberingStoreInstance = componentsNumberingStore.getState();

export const cachingLevelMaker = () => {
  const client1 = componentsNumberingStoreInstance.getNextId("Client");
  const loadbalancer1 =
    componentsNumberingStoreInstance.getNextId("Load Balancer");
  const server1 = componentsNumberingStoreInstance.getNextId("Server");
  const server2 = componentsNumberingStoreInstance.getNextId("Server");
  const database1 = componentsNumberingStoreInstance.getNextId("Database");
  const sessionCache1 = componentsNumberingStoreInstance.getNextId("Cache");
  const cdn1 = componentsNumberingStoreInstance.getNextId("CDN");

  const databaseReplication: Level = {
    id: "caching",
    name: "Caching",
    title: "Implement Caching to Improve Performance",
    description:
      "To reduce database load and improve response time, introduce caching in your architecture.",
    preConnectedComponents: [
      {
        type: "Client",
        id: client1,
      },
      {
        type: "CDN",
        id: cdn1,
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
      {
        type: "Cache",
        id: sessionCache1,
        configs: {
          type: "User Session",
        },
      },
    ],
    preConnectedConnections: [
      {
        source: { id: client1 },
        target: { id: loadbalancer1 },
      },
      {
        source: { id: client1 },
        target: { id: cdn1 },
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
        target: { id: sessionCache1 },
      },
      {
        source: { id: server2 },
        target: { id: sessionCache1 },
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
      "At least 2 servers",
      "At least 1 database",
      "At least 1 load balancer for servers",
      "At least 1 cache with User Session configuration for session management",
      "There has to be 1 cache that's explicitly configured for session management in the solution provided",
      "At least 1 CDN for caching static content",
      "Clients can connect to CDNs and load balancers simultaneously",
      "CDNs shouldn't be directly connected to servers",

      "At least 1 cache has to have Database Read/Write cache configuration",
      "There has to be 1 cache that's explicitly configured as Database Read/Write cache in the solution provided",
    ],
  };

  return databaseReplication;
};
