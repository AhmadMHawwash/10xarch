import { api } from "@/trpc/react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { useCallback, useEffect, useRef } from "react";

// Define a global state flag to track when updates are in progress
let isUpdating = false;

export function useCredits() {
  const { userId } = useAuth();
  const { organization } = useOrganization();
  
  // Track the previous organization ID to detect changes
  const prevOrgIdRef = useRef<string | null | undefined>();
  
  const {
    data: creditsData,
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

  // Watch for organization changes and refetch when context switches
  useEffect(() => {
    const currentOrgId = organization?.id ?? null;
    
    // Only refetch if the organization actually changed (not on initial mount)
    if (prevOrgIdRef.current !== undefined && prevOrgIdRef.current !== currentOrgId) {
      void refetch();
    }
    
    // Update the ref to the current org ID
    prevOrgIdRef.current = currentOrgId;
  }, [organization?.id, refetch]);

  // Extract token balances
  const balance = creditsData?.balance;
  const expiringTokens = balance?.expiringTokens ?? 0;
  const expiringTokensExpiry = balance?.expiringTokensExpiry ?? null;
  const nonexpiringTokens = balance?.nonexpiringTokens ?? 0;
  const totalUsableTokens = expiringTokens + nonexpiringTokens;

  // Check if we have actual data
  const hasValidData = typeof balance === 'object' && balance !== null;
  const hasLowCredits = totalUsableTokens === 0;
  
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
    expiringTokens,
    expiringTokensExpiry,
    nonexpiringTokens,
    totalUsableTokens,
    isLoading,
    hasValidData,
    error,
    refetch: debouncedRefetch,
    hasLowCredits,
  };
}
