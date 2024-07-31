export type Challenge = {
  slug: string;
  title: string;
  diffcutly: "Easy" | "Medium" | "Hard";
  description: string;
  stages: {
    objective: string;
    problem?: string;
  }[];
};
