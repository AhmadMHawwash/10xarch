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
        targets: [loadbalancer1, cdn1],
      },
      {
        type: "CDN",
        id: cdn1,
        targets: [],
      },
      {
        type: "Load Balancer",
        id: loadbalancer1,
        targets: [server1, server2],
      },
      {
        type: "Server",
        id: server1,
        targets: [sessionCache1, database1, databaseCache1],
      },
      {
        type: "Server",
        id: server2,
        targets: [sessionCache1, database1, databaseCache1],
      },
      {
        type: "Server",
        id: server1,
        targets: [sessionCache1, database2, databaseCache1],
      },
      {
        type: "Server",
        id: server2,
        targets: [sessionCache1, database2, databaseCache1],
      },
      {
        type: "Database",
        id: database1,
        configs: {
          type: "Read/Write",
        },
        targets: [],
      },
      {
        type: "Database",
        id: database2,
        configs: {
          type: `Replica (Read only) of ${database1}`,
        },
        targets: [],
      },
      {
        type: "Cache",
        id: sessionCache1,
        configs: {
          type: "User Session",
        },
        targets: [],
      },
      {
        type: "Cache",
        id: databaseCache1,
        configs: {
          type: "Database Read/Write",
        },
        targets: [],
      },
    ],
    description:
      "The single SQL database becomes a bottleneck. Introduce a primary and secondary SQL database to handle read and write operations separately.",
    criteria: [
      "At least 1 client",
      "At least 2 servers",
      "At least 1 load balancer for servers",
      "Servers connected to load balancer should connect to the database.",
      "At least 1 cache with User Session configuration for session management",
      "There has to be 1 cache that's explicitly configured for session management in the solution provided",
      "At least 1 CDN for caching static content",
      "Clients can connect to CDNs and load balancers simultaneously",
      "At least 1 cache has to have Database Read/Write cache configuration",
      "There has to be 1 cache that's explicitly configured as Database Read/Write cache in the solution provided",
      "At least 1 primary database for writing",
      "At least 1 replica database for reading",
    ],
  };

  return clustering;
};
