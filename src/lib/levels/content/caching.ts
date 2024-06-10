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
  const database2 = componentsNumberingStoreInstance.getNextId("Database");
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
        configs: {
          type: "Primary (Write)",
        },
      },
      {
        type: "Database",
        id: database2,
        configs: {
          type: `Replica (Read only) of ${database1}`,
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
    ],
    citeria: [
      "At least 1 client",
      "At least 1 server",
      "At least 1 load balancer for servers if more than 1 server is present",
      "At least 1 primary database for writing",
      "At least 1 replica database for reading",
      "At least one CDN for caching static content",
      "1 cache to store frequently accessed data",
      "Servers should be connected to the cache, if the server couldn't find the data in the cache, it will fetch it from the database",
    ],
  };

  return databaseReplication;
};
