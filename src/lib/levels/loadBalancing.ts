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
    { type: "Client", id: 1 },
    { type: "Server", id: 2 },
    {
      type: "SQL Database",
      id: 3,
    },
  ],
  preConnectedConnections: [
    { source: { id: 1, type: "Client" }, target: { id: 2, type: "Server" } },
    {
      source: { id: 2, type: "Server" },
      target: { id: 3, type: "SQL Database" },
    },
  ],
  description:
    "Your user base has grown significantly, and a single server is no longer able to handle the increased load. You need to add additional servers and a load balancer to distribute traffic efficiently.",
  components: ["Server", "Load Balancer"],
  dashboard: {
    problems: [
      "Server is reaching 100% of its power.",
      "High rate of timeouts.",
    ],
  },
};
