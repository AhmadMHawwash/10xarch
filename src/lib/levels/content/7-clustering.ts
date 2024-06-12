import { type Level } from "../type";
import { componentsNumberingStore } from "../utils";

const componentsNumberingStoreInstance = componentsNumberingStore.getState();

export const clusteringLevelMaker = () => {
  const client1 = componentsNumberingStoreInstance.getNextId("Client");
  const loadbalancer1 =
    componentsNumberingStoreInstance.getNextId("Load Balancer");
  const server1 = componentsNumberingStoreInstance.getNextId("Server");
  const server2 = componentsNumberingStoreInstance.getNextId("Server");
  const database1 = componentsNumberingStoreInstance.getNextId("Database");
  const database2 = componentsNumberingStoreInstance.getNextId("Database");
  const sessionCache1 = componentsNumberingStoreInstance.getNextId("Cache");
  const cdn1 = componentsNumberingStoreInstance.getNextId("CDN");
  const databaseCache1 = componentsNumberingStoreInstance.getNextId("Cache");

  const clustering: Level = {
    id: "clustering",
    name: "Clustering",
    title: "Implement Clustering for Scalability and High Availability",
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
        configs: {
          type: "Primary (Write)",
        }
      },
      {
        type: "Database",
        id: database2,
        configs: {
          type: `Replica (Read only) of ${database1}`,
        }
      },
      {
        type: "Cache",
        id: sessionCache1,
        configs: {
          type: "User Session",
        },
      },
      {
        type: "Cache",
        id: databaseCache1,
        configs: {
          type: "Database Read/Write",
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
      {
        source: { id: server1 },
        target: { id: database2 },
      },
      {
        source: { id: server2 },
        target: { id: database2 },
      },
      {
        source: { id: server1 },
        target: { id: databaseCache1 },
      },
      {
        source: { id: server2 },
        target: { id: databaseCache1 },
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
      "At least 1 CDN for caching static content",
      "Clients can connect to CDNs and load balancers simultaneously",
      "CDNs shouldn't be directly connected to servers",
      "At least 1 cache has to have Database Read/Write cache configuration",
      "There has to be 1 cache that's explicitly configured as Database Read/Write cache in the solution provided",
      "At least 1 primary database for writing",
      "At least 1 replica database for reading",


    ],
  };

  return clustering;
};
