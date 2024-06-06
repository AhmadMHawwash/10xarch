import { type Level } from "../type";
import { componentsNumberingStore } from "../utils";

const componentsNumberingStoreInstance = componentsNumberingStore.getState();

export const loadBalancingLevelMaker = () => {
  const client1 = componentsNumberingStoreInstance.getNextId("Client");
  const server1 = componentsNumberingStoreInstance.getNextId("Server");
  const sqlDatabase1 = componentsNumberingStoreInstance.getNextId("Database");

  const loadBalancing: Level = {
    id: "load-balancing",
    name: "Load Balancing",
    title: "Distribute Load Across Multiple Servers",
    preConnectedComponents: [
      {
        type: "Client",
        id: client1,
      },
      {
        type: "Server",
        id: server1,
      },
      {
        type: "Database",
        id: sqlDatabase1,
      },
    ],
    preConnectedConnections: [
      {
        source: { id: client1, type: "Client" },
        target: { id: server1, type: "Server" },
      },
      {
        source: { id: server1, type: "Server" },
        target: { id: sqlDatabase1, type: "Database" },
      },
    ],
    citeria: [
      "At least 1 client",
      "At least 2 server",
      "At least 1 load balancer",
    ],
    description:
      "Your user base has grown significantly, and a single server is no longer able to handle the increased load.",
    components: ["Client", "Database", "Server", "Load Balancer"],
    // dashboard: {
    //   beforeStartingLevel: {
    //     reports: [
    //       {
    //         key: "Server",
    //         value: "Server is under high load during peak times.",
    //       },
    //       {
    //         key: "Latency",
    //         value: "Noticeable increase in latency during peak hours.",
    //       },
    //     ],
    //     stats: [
    //       {
    //         key: "Requests Per Second",
    //         value: "600",
    //       },
    //       {
    //         key: "Success Rate",
    //         value: "95%",
    //       },
    //       {
    //         key: "Latency",
    //         value: "400ms",
    //       },
    //       {
    //         key: "Server Utilization",
    //         value: "75%",
    //       },
    //       {
    //         key: "Number of Active Users",
    //         value: "300",
    //       },
    //     ],
    //   },
    //   afterStartingLevel: {
    //     reports: [
    //       {
    //         key: "Server",
    //         value: "Has reached 100% of its power even during regular hours.",
    //       },
    //       {
    //         key: "Latency",
    //         value: "High latency detected during peak hours.",
    //       },
    //       {
    //         key: "Timeouts",
    //         value: "High rate of timeouts observed.",
    //       },
    //       {
    //         key: "Failures",
    //         value: "Increased rate of request failures.",
    //       },
    //     ],
    //     stats: [
    //       {
    //         key: "Requests Per Second",
    //         value: "1000",
    //       },
    //       {
    //         key: "Success Rate",
    //         value: "70%",
    //       },
    //       {
    //         key: "Latency",
    //         value: "800ms",
    //       },
    //       {
    //         key: "Server Utilization",
    //         value: "100%",
    //       },
    //       {
    //         key: "Number of Active Users",
    //         value: "700",
    //       },
    //     ],
    //   },
    // },
  };

  return loadBalancing;
};

// console.log(loadBalancing)
