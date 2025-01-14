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

  return {
    balance: credits?.credits?.balance ?? 0,
    isLoading,
    error,
    refetch,
  };
}
