import { type Level } from "./type";

export const loadBalancing: Level = {
  name: "Load Balancing",
  title: "Distribute Load Across Multiple Servers",
  description:
    "Your user base has grown significantly, and a single server is no longer able to handle the increased load. You need to add additional servers and a load balancer to distribute traffic efficiently.",
  components: ["Client", "Server", "Load Balancer", "SQL Database"],
  dashboard: {
    problems: [
      "Server is reaching 100% of its power.",
      "High rate of timeouts.",
    ],
  },
};
