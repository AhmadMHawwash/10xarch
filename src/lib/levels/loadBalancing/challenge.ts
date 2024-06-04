import { create } from "zustand";
import { type Level, type SystemComponent } from "../type";

export const componentsNumberingStore = create<{
  getNextId: (componentName: SystemComponent["name"]) => string;
  componentsToCount: Record<SystemComponent["name"], number>;
}>((set, get) => ({
  componentsToCount: {
    Client: 1,
    Server: 1,
    "SQL Database": 1,
    "Load Balancer": 1,
    Cache: 1,
    CDN: 1,
  },
  getNextId: (componentName) => {
    const id = get().componentsToCount[componentName];
    set((state) => ({
      componentsToCount: {
        ...state.componentsToCount,
        [componentName]: state.componentsToCount[componentName] + 1,
      },
    }));
    return `${componentName}-${id}`;
  },
}));

const componentsNumberingStoreInstance = componentsNumberingStore.getState();

export const loadBalancing: Level = {
  id: "load-balancing",
  name: "Load Balancing",
  title: "Distribute Load Across Multiple Servers",
  metaInstructions: `
  Strict rules:
    Don't ask to configure the load balancers.
    Don't ask for concurrent connections.
    Don't ask to distribute traffic between servers properly through load balancer.
  `,
  preConnectedComponents: [
    {
      type: "Client",
      id: componentsNumberingStoreInstance.getNextId("Client"),
    },
    {
      type: "Server",
      id: componentsNumberingStoreInstance.getNextId("Server"),
    },
    {
      type: "SQL Database",
      id: componentsNumberingStoreInstance.getNextId("SQL Database"),
    },
  ],
  preConnectedConnections: [
    {
      source: { id: "Client-1", type: "Client" },
      target: { id: "Server-1", type: "Server" },
    },
    {
      source: { id: "Server-1", type: "Server" },
      target: { id: "SQL Database-1", type: "SQL Database" },
    },
  ],
  description:
    "Your user base has grown significantly, and a single server is no longer able to handle the increased load.",
  components: ["Client", "SQL Database", "Server", "Load Balancer"],
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

// console.log(loadBalancing)