import { type Level } from "../type";

export const basicLevelMaker = () => {
  const loadBalancing: Level = {
    id: "basic",
    name: "Basic Architecture",
    title: "Implement Basic Architecture",
    description:
      "You are tasked with designing a basic system architecture that includes a client, a server, and a database.",
    preConnectedComponents: [],
    preConnectedConnections: [],
    criteria: ["At least 1 client", "At least 1 server", "At least 1 database"],
  };

  return loadBalancing;
};
