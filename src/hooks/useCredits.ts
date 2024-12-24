import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";

export function useCredits() {
  const { data: credits, isLoading, error } = api.credits.getBalance.useQuery();
  const { toast } = useToast();

  const creditsMutation = api.credits.use.useMutation({
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to use credits",
        variant: "destructive",
      });
    },
    // Invalidate the credits query after successful mutation
    onSuccess: () => {
      // api.credits.getBalance.invalidate();
    },
  });

  return {
    credits: credits?.credits,
    isLoading,
    error,
    useCredits: creditsMutation.mutate,
    isUsingCredits: creditsMutation.isPending,
  };
}
