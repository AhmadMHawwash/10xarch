import { usePathname } from "next/navigation";

export const useFeatures = () => {
  const pathname = usePathname();

  if (pathname?.includes("playground")) {
    return {
      canRunSolution: true,
    };
  }

  return {
    canRunSolution: true,
  };
};

export const useFeatureCustomisation = () => {
  const pathname = usePathname();

  if (pathname?.includes("playground")) {
    return {
      runSolutionLabel: "Evaluate Solution",
    };
  }

  return {
    runSolutionLabel: "Evaluate Solution",
  };
};
