import { usePathname } from "next/navigation";

interface UseFeatures {
  canRunSolution: boolean;
}

interface UseFeatureCustomisation {
  runSolutionLabel: string;
}

export const useFeatures = (): UseFeatures => {
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

export const useFeatureCustomisation = (): UseFeatureCustomisation => {
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
