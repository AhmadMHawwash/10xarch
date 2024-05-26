import { type Level } from "./type";

export const loadBalancing: Level = {
  name: "Load Balancing",
  title: "Distribute Load Across Multiple Servers",
  preConnectedComponents: [
    { source: "Client", target: "Server" },
    { source: "Server", target: "SQL Database" },
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
