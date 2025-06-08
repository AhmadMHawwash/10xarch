"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CREDIT_PACKAGES } from "@/lib/tokens";
import { api } from "@/trpc/react";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showShadow, setShowShadow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowShadow(scrollWidth > clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  const handlePurchasePackage = async (
    packageName: keyof typeof CREDIT_PACKAGES,
  ) => {
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
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className="flex justify-center gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar-thumb:hover]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar]:h-2"
      >
        {Object.entries(CREDIT_PACKAGES).map(([key, package_], index) => (
          <Card
            key={key}
            className="relative w-64 flex-shrink-0 overflow-hidden border-2 border-gray-200 bg-white transition-all hover:border-blue-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-600"
            style={{
              marginRight:
                index === Object.entries(CREDIT_PACKAGES).length - 1
                  ? "2rem"
                  : "0",
            }}
          >
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                {package_.name}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                {package_.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 py-4 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(package_.price)}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Base tokens:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {package_.tokens.toLocaleString()}
                  </span>
                </div>

                {package_.bonusTokens > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Bonus tokens:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      +{package_.bonusTokens.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Total tokens:
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {package_.totalTokens.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {(package_.totalTokens / package_.price).toFixed(0)} tokens per
                $
              </div>
            </CardContent>

            <CardFooter className="pt-3">
              <Button
                onClick={() =>
                  handlePurchasePackage(key as keyof typeof CREDIT_PACKAGES)
                }
                disabled={addCreditsMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
                size="default"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {addCreditsMutation.isPending ? "Processing..." : "Purchase"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {/* Conditional scroll indicator */}
      {showShadow && (
        <div className="pointer-events-none absolute bottom-4 right-0 top-0 w-8 bg-gradient-to-l from-background to-transparent" />
      )}
    </div>
  );
}
