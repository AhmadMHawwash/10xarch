import { create } from "zustand";
import { type Level } from "./type";

const componentsNumberingStore = create<{
  id: number;
  getNextId: () => number;
}>((set, get) => ({
  id: 0,
  getNextId: () => {
    const id = get().id;
    set({ id: get().id + 1 });
    return id;
  },
}));
export const loadBalancing: Level = {
  id: "load-balancing",
  name: "Load Balancing",
  title: "Distribute Load Across Multiple Servers",
  preConnectedComponents: [
    { type: "Client", id: "Client_1" },
    { type: "Server", id: "Server_2" },
    {
      type: "SQL Database",
      id: "SQL Database_3",
    },
  ],
  preConnectedConnections: [
    {
      source: { id: "Client_1", type: "Client" },
      target: { id: "Server_2", type: "Server" },
    },
    {
      source: { id: "Server_2", type: "Server" },
      target: { id: "SQL Database_3", type: "SQL Database" },
    },
  ],
  description:
    "Your user base has grown significantly, and a single server is no longer able to handle the increased load. Add additional servers and a load balancer to distribute traffic efficiently.",
  components: ["Client", "SQL Database", "Server", "Load Balancer"],
  dashboard: {
    beforeStartingLevel: {
      reports: [
        {
          key: "Server",
          value: "Server is under high load during peak times.",
        },
        {
          key: "Latency",
          value: "Noticeable increase in latency during peak hours.",
        },
      ],
      stats: [
        {
          key: "Requests Per Second",
          value: "600",
        },
        {
          key: "Success Rate",
          value: "95%",
        },
        {
          key: "Latency",
          value: "400ms",
        },
        {
          key: "Server Utilization",
          value: "75%",
        },
        {
          key: "Number of Active Users",
          value: "300",
        },
      ],
    },
    afterStartingLevel: {
      reports: [
        {
          key: "Server",
          value: "Has reached 100% of its power even during regular hours.",
        },
        {
          key: "Latency",
          value: "High latency detected during peak hours.",
        },
        {
          key: "Timeouts",
          value: "High rate of timeouts observed.",
        },
        {
          key: "Failures",
          value: "Increased rate of request failures.",
        },
      ],
      stats: [
        {
          key: "Requests Per Second",
          value: "1000",
        },
        {
          key: "Success Rate",
          value: "70%",
        },
        {
          key: "Latency",
          value: "800ms",
        },
        {
          key: "Server Utilization",
          value: "100%",
        },
        {
          key: "Number of Active Users",
          value: "700",
        },
      ],
    },
  },
};
