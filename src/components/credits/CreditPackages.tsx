"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CREDIT_PACKAGES } from "@/lib/tokens";
import { api } from "@/trpc/react";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, Zap } from "lucide-react";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export function CreditPackages() {
  const { toast } = useToast();
  const addCreditsMutation = api.stripe.createCheckoutSession.useMutation();

  const handlePurchasePackage = async (packageName: keyof typeof CREDIT_PACKAGES) => {
    try {
      const result = await addCreditsMutation.mutateAsync({
        packageName,
      });

      const stripe = await stripePromise;
      if (!stripe) {
        toast({
          title: "Error",
          description: "Failed to load Stripe",
          variant: "destructive",
        });
        return;
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: result.id,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Object.entries(CREDIT_PACKAGES).map(([key, package_]) => (
        <Card key={key} className="relative overflow-hidden border-2 transition-all hover:border-blue-200 hover:shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-xl">{package_.name}</CardTitle>
            <CardDescription className="text-sm">{package_.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(package_.price)}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base tokens:</span>
                <span className="font-medium">{package_.tokens.toLocaleString()}</span>
              </div>
              
              {package_.bonusTokens > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bonus tokens:</span>
                  <span className="font-medium text-green-600">
                    +{package_.bonusTokens.toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between border-t pt-2">
                <span className="font-medium">Total tokens:</span>
                <span className="font-bold text-lg">{package_.totalTokens.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {(package_.totalTokens / package_.price).toFixed(0)} tokens per $
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={() => handlePurchasePackage(key as keyof typeof CREDIT_PACKAGES)}
              disabled={addCreditsMutation.isPending}
              className="w-full"
              size="lg"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {addCreditsMutation.isPending ? "Processing..." : "Purchase"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 