export type Challenge = {
  slug: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  stages: {
    problem: string;
    assumptions: string[];
    hintsPerArea: {
      functionalAndNonFunctionalRequirements: string[];
      systemAPI: string[];
      capacityEstimations: string[];
      highLevelDesign: string[];
    };
  }[];
};
