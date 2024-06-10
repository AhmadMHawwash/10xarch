import { type Level } from "../type";
import { componentsNumberingStore } from "../utils";

const componentsNumberingStoreInstance = componentsNumberingStore.getState();

export const cdnLevelMaker = () => {
  const client1 = componentsNumberingStoreInstance.getNextId("Client");
  const loadbalancer1 =
    componentsNumberingStoreInstance.getNextId("Load Balancer");
  const server1 = componentsNumberingStoreInstance.getNextId("Server");
  const server2 = componentsNumberingStoreInstance.getNextId("Server");
  const database1 = componentsNumberingStoreInstance.getNextId("Database");
  const database2 = componentsNumberingStoreInstance.getNextId("Database");

  const databaseReplication: Level = {
    id: "cdn",
    name: "Caching Static Content",
    title: "Implement a Content Delivery Network (CDN)",
    description:
      "Your website is slow to load for users in different parts of the world.",
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
      "At least one client",
      "At least one server",
      "At least one load balancer for servers if more than one server is present",
      "At least one primary database for writing",
      "At least one replica database for reading",
      "At least one CDN for caching static content",
      "clients can connect to CDNs and load balancers simultaneously",
    ],
  };

  return databaseReplication;
};
