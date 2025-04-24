import { api } from "@/trpc/react";
import { useAuth } from "@clerk/nextjs";

export function useCredits() {
  const { userId } = useAuth();
  const {
    data: credits,
    isLoading,
    error,
    refetch,
  } = api.credits.getBalance.useQuery(undefined, { enabled: !!userId });

  // Check if the user has low or zero credits, safely handle undefined cases
  const balance = credits?.credits?.balance ?? 0;
  const hasLowCredits = balance === 0;

  return {
    balance,
    isLoading,
    error,
    refetch,
    hasLowCredits,
  };
}
