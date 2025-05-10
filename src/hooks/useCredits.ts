import { api } from "@/trpc/react";
import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

// Define a global state flag to track when updates are in progress
let isUpdating = false;

export function useCredits() {
  const { userId } = useAuth();
  
  const {
    data: credits,
    isLoading,
    error,
    refetch,
  } = api.credits.getBalance.useQuery(undefined, {
    enabled: !!userId,
    // Use a longer staleTime to reduce unnecessary refetches
    staleTime: 60 * 1000, // 1 minute
    // Only trigger automatic refetch on mount, not on every window focus
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors (401)
      if (error.message?.includes('401') || error.message?.includes('UNAUTHORIZED')) {
        return false;
      }
      // For other errors, retry up to 3 times
      return failureCount < 3;
    }
  });

  // Check if we have actual data
  const hasValidData = Boolean(credits?.credits?.balance !== undefined);
  
  // Return the balance or 0 if not available
  const balance = credits?.credits?.balance ?? 0;
  const hasLowCredits = balance === 0;
  
  // Create a debounced refetch that won't trigger multiple simultaneous requests
  const debouncedRefetch = useCallback(async () => {
    if (isUpdating) return; // Skip if already updating
    
    try {
      isUpdating = true;
      await refetch();
    } finally {
      // Reset after a short delay to prevent rapid consecutive calls
      setTimeout(() => {
        isUpdating = false;
      }, 300);
    }
  }, [refetch]);
  
  return {
    balance,
    isLoading,
    hasValidData,
    error,
    refetch: debouncedRefetch,
    hasLowCredits,
  };
}
