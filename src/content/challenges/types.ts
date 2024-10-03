export type Challenge = {
  slug: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  stages: Stage[];
  generalLearnings: string[];
};

export type Stage = {
  problem: string;
  requirements: string[];
  metaRequirements: string[];
  hintsPerArea: {
    requirements: {
      functional: string[];
      nonFunctional: string[];
    };
    systemAPI: string[];
    capacityEstimations: {
      traffic: string[];
      storage: string[];
      memory: string[];
      bandwidth: string[];
    };
    highLevelDesign: string[];
  };
  criteria: string[];
  learningsInMD: string;
};
