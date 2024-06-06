import { type Level } from "../type";
import { componentsNumberingStore } from "../utils";
import { solutionDesignShouldHave } from "./solutions";

const componentsNumberingStoreInstance = componentsNumberingStore.getState();

export const databaseReplicationLevelMaker = () => {
  const client1 = componentsNumberingStoreInstance.getNextId("Client");
  const loadbalancer1 =
    componentsNumberingStoreInstance.getNextId("Load Balancer");
  const server1 = componentsNumberingStoreInstance.getNextId("Server");
  const server2 = componentsNumberingStoreInstance.getNextId("Server");
  const sqlDatabase1 = componentsNumberingStoreInstance.getNextId("Database");

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
        type: "Database",
        id: sqlDatabase1,
      },
    ],
    preConnectedConnections: [
      {
        source: { id: client1, type: "Client" },
        target: { id: loadbalancer1, type: "Load Balancer" },
      },
      {
        source: { id: loadbalancer1, type: "Load Balancer" },
        target: { id: server1, type: "Server" },
      },
      {
        source: { id: loadbalancer1, type: "Load Balancer" },
        target: { id: server2, type: "Server" },
      },
      {
        source: { id: server1, type: "Server" },
        target: { id: sqlDatabase1, type: "Database" },
      },
      {
        source: { id: server2, type: "Server" },
        target: { id: sqlDatabase1, type: "Database" },
      },
    ],
    description:
      "The single Database has become a bottleneck. Implement database replication to handle more read requests and ensure high availability.",
    components: [
      "Client",
      "Load Balancer",
      "Server",
      "Primary Database",
      "Secondary Database",
    ],
    citeria: solutionDesignShouldHave,
  };

  return databaseReplication;
};
