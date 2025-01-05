import { api } from "@/trpc/react";

export function useCredits() {
  const { data: credits, isLoading, error, refetch } = api.credits.getBalance.useQuery();

  return {
    balance: credits?.credits?.balance ?? 0,
    isLoading,
    error,
    refetch
  };
}
