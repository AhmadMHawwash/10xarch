import { type Level } from "../type";
import { componentsNumberingStore } from "../utils";

const componentsNumberingStoreInstance = componentsNumberingStore.getState();

export const messageQueueLevelMaker = () => {
  const client1 = componentsNumberingStoreInstance.getNextId("Client");
  const loadbalancer1 =
    componentsNumberingStoreInstance.getNextId("Load Balancer");
  const server1 = componentsNumberingStoreInstance.getNextId("Server");
  const server2 = componentsNumberingStoreInstance.getNextId("Server");
  const database1 = componentsNumberingStoreInstance.getNextId("Database");
  const database2 = componentsNumberingStoreInstance.getNextId("Database");
  const cdn1 = componentsNumberingStoreInstance.getNextId("CDN");
  const sessionCache1 = componentsNumberingStoreInstance.getNextId("Cache");
  const databaseCache1 = componentsNumberingStoreInstance.getNextId("Cache");
  const mq1 = componentsNumberingStoreInstance.getNextId("Message Queue");

  const messageQueue: Level = {
    id: "messege-queue",
    name: "Message Queue",
    title: "Handling Background Jobs",
    description:
      "The application needs to process background jobs asynchronously, such as sending emails or processing data, without blocking main operations.      ",
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
        type: "Cache",
        id: sessionCache1,
        configs: {
          type: "User Session",
        },
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
    criteria: [
      "At least 1 client",
      "At least 2 servers",
      "At least 1 load balancer for servers",
      "At least 1 cache with User Session configuration for session management",
      "There has to be 1 cache that's explicitly configured for session management in the solution provided",
      "At least 1 primary database for writing",
      "At least 1 replica database for reading",
      "At least 1 CDN for caching static content",
      "Clients can connect to CDNs and load balancers simultaneously",
      "CDNs shouldn't be directly connected to servers",
      "At least 1 cache has to have Database Read/Write cache configuration",
      "There has to be 1 cache that's explicitly configured as Database Read/Write cache in the solution provided",
      "In configurations section, all caches have to be configured to either be Database Read/Write or User Session caches, otherwise, the solution is invalid",
      "Servers can be connected to the cache directly to access data, if the server couldn't find the data in cache, it will fetch it from the database",

      "At least 1 message queue",
      "Servers can push background jobs to the message queue",
      "Message queue should be connected to worker servers",
      "Worker servers should update the cache and database",
    ],
  };

  return messageQueue;
};
