import { type Stage } from "../type";
import { componentsNumberingStore } from "../utils";

const componentsNumberingStoreInstance = componentsNumberingStore.getState();

export const cdnStageMaker = () => {
  const client1 = componentsNumberingStoreInstance.getNextId("Client");
  const loadbalancer1 =
    componentsNumberingStoreInstance.getNextId("Load Balancer");
  const server1 = componentsNumberingStoreInstance.getNextId("Server");
  const server2 = componentsNumberingStoreInstance.getNextId("Server");
  const database1 = componentsNumberingStoreInstance.getNextId("Database");
  const sessionCache1 = componentsNumberingStoreInstance.getNextId("Cache");

  const databaseReplication: Stage = {
    id: "cdn",
    name: "Caching Static Content",
    title: "Implement a Content Delivery Network (CDN)",
    description:
      "Your website is slow to load for users in different parts of the world.",
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
        targets: [database1, sessionCache1],
      },
      {
        type: "Server",
        id: server2,
        targets: [database1, sessionCache1],
      },
      {
        type: "Database",
        id: database1,
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
    ],
    criteria: [
      "At least 1 client",
      "At least 2 servers",
      "At least 1 database",
      "At least 1 load balancer for servers",
      "Servers connected to load balancer should connect to the database.",
      "At least 1 cache with User Session configuration for session management",
      "There has to be 1 cache that's explicitly configured for session management in the solution provided",

      "At least 1 CDN for caching static content",
      "Clients can connect to CDNs and load balancers simultaneously",
    ],
  };

  return databaseReplication;
};
