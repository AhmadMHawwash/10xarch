import { type Stage } from "../type";

export const basicStageMaker = () => {
  const loadBalancing: Stage = {
    id: "basic",
    name: "Basic Architecture",
    title: "Implement Basic Architecture",
    description:
      "You are tasked with designing a basic system architecture that includes a client, a server, and a database.",
    preConnectedComponents: [],
    criteria: ["At least 1 client", "At least 1 server", "At least 1 database"],
  };

  return loadBalancing;
};
