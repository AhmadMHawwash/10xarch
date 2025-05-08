import { api } from "@/trpc/react";
import { useAuth } from "@/lib/clerk/client";
import { useCallback, useEffect, useState } from "react";

// Define a global state flag to track when updates are in progress
let isUpdating = false;

// Check if we're in a development environment
const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export function useCredits() {
  // Store auth state in hook's internal state to avoid ClerkProvider dependency issues
  const [authState, setAuthState] = useState<{ userId: string | null }>({ userId: null });
  const auth = useAuth();
  
  // Safe access to userId, ensuring it doesn't throw errors if called outside ClerkProvider
  useEffect(() => {
    try {
      // In development mode, we default to a dev user ID
      if (isDevelopmentMode) {
        setAuthState({ userId: "dev_user_123" });
      } else if (auth?.userId) {
        setAuthState({ userId: auth.userId });
      }
    } catch (error) {
      console.warn("[useCredits] Error accessing auth:", error);
      if (isDevelopmentMode) {
        setAuthState({ userId: "dev_user_123" });
      }
    }
  }, [auth]);
  
  const {
    data: credits,
    isLoading,
    error,
    refetch,
  } = api.credits.getBalance.useQuery(void 0, {
    enabled: !!authState.userId,
    // Use a longer staleTime to reduce unnecessary refetches
    staleTime: 60 * 1000, // 1 minute
    // Only trigger automatic refetch on mount, not on every window focus
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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
    } catch (error) {
      console.warn("[useCredits] Error refetching credits:", error);
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
