"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { SUBSCRIPTION_TIERS } from "@/lib/tokens";
import { api } from "@/trpc/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CheckCircle, Star, CreditCard, ArrowUp, ArrowDown, Settings, AlertTriangle } from "lucide-react";

interface SubscriptionPricingTableProps {
  /** Show only context-relevant options for authenticated users */
  contextOnly?: boolean;
}

const TIER_PRICING = {
  pro: { price: 35, description: "Perfect for small teams getting started" },
  premium: { price: 50, description: "Advanced features for growing teams" },
} as const;

export function SubscriptionPricingTable({ contextOnly = false }: SubscriptionPricingTableProps) {
  const { toast } = useToast();
  const { userId, orgId, orgRole } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const { data: currentSubscription, isLoading: isLoadingSubscription } = 
    api.stripe.getCurrentSubscription.useQuery(undefined, {
      enabled: !!userId,
    });

    console.log(currentSubscription)
  const createSubscriptionMutation = api.stripe.createSubscriptionSession.useMutation({
    onSuccess: async (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPortalMutation = api.stripe.createCustomerPortalSession.useMutation({
    onSuccess: async (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = async (tier: "pro" | "premium") => {
    if (!userId) {
      // Redirect to sign-in with return URL
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (orgId && orgRole !== "org:admin") {
      toast({
        title: "Permission Required",
        description: "Only organization administrators can manage subscriptions.",
        variant: "destructive",
      });
      return;
    }

    await createSubscriptionMutation.mutateAsync({ tier });
  };

  const handleManageSubscription = async () => {
    await createPortalMutation.mutateAsync();
  };

  // New function to handle upgrade/downgrade
  const handleTierChange = async (targetTier: "pro" | "premium") => {
    if (!currentSubscription) {
      // No existing subscription - create new one
      await handleSubscribe(targetTier);
      return;
    }

    // User has active subscription - redirect to Customer Portal for upgrade/downgrade
    await handleManageSubscription();
  };

  const getButtonText = (tier: "pro" | "premium") => {
    if (!userId) return "Subscribe";
    if (!currentSubscription) return "Subscribe";
    
    if (currentSubscription.tier === tier) {
      if (isScheduledForCancellation()) {
        return "Reactivate Plan";
      }
      return "Manage Subscription";
    }
    
    const currentTierIndex = currentSubscription.tier === "pro" ? 0 : 1;
    const targetTierIndex = tier === "pro" ? 0 : 1;
    
    if (targetTierIndex > currentTierIndex) return "Upgrade Plan";
    if (targetTierIndex < currentTierIndex) return "Downgrade Plan";
    return "Subscribe";
  };

  const getButtonVariant = (tier: "pro" | "premium") => {
    const buttonText = getButtonText(tier);
    if (buttonText === "Upgrade Plan") return "upgrade";
    if (buttonText === "Downgrade Plan") return "downgrade";
    if (buttonText === "Manage Subscription") return "manage";
    if (buttonText === "Reactivate Plan") return "reactivate";
    return "subscribe";
  };

  const getButtonDescription = (tier: "pro" | "premium") => {
    const buttonText = getButtonText(tier);
    if (buttonText === "Upgrade Plan") {
      return "Click to upgrade via Stripe Customer Portal";
    }
    if (buttonText === "Downgrade Plan") {
      return "Click to downgrade via Stripe Customer Portal";
    }
    if (buttonText === "Manage Subscription") {
      return "Manage billing, invoices, and payment methods";
    }
    if (buttonText === "Reactivate Plan") {
      return "Reactivate your canceled subscription";
    }
    return "Start your subscription today";
  };

  const isCurrentPlan = (tier: "pro" | "premium") => {
    return currentSubscription?.tier === tier && currentSubscription?.status === "active";
  };

  const isScheduledForCancellation = () => {
    return currentSubscription?.cancel_at_period_end === 1 && currentSubscription?.status === "active";
  };

  const getCancellationDate = () => {
    if (isScheduledForCancellation() && currentSubscription?.current_period_end) {
      return new Date(currentSubscription.current_period_end);
    }
    return null;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCurrentContext = () => {
    if (orgId) {
      const orgName = user?.organizationMemberships?.find(
        (membership) => membership.organization.id === orgId
      )?.organization.name ?? "Organization";
      return { type: "Organization", name: orgName };
    }
    return { type: "Personal", name: "Account" };
  };

  const context = getCurrentContext();

  if (isLoadingSubscription) {
    return <div className="animate-pulse">Loading pricing...</div>;
  }

  return (
    <div className="space-y-6">
      {contextOnly && userId && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
            <Star className="mr-2 h-4 w-4" />
            <span>Managing subscription for: <strong>{context.name}</strong> ({context.type})</span>
          </div>
        </div>
      )}
      
      {/* Cancellation Warning Banner */}
      {isScheduledForCancellation() && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-orange-800 dark:text-orange-200">
                Subscription Scheduled for Cancellation
              </div>
              <div className="mt-1 text-orange-700 dark:text-orange-300">
                Your subscription will be canceled on{" "}
                <strong>{getCancellationDate() && formatDate(getCancellationDate()!)}</strong>.
                You&apos;ll continue to have access to your current plan and tokens until then.
              </div>
              <div className="mt-2">
                <Button
                  onClick={() => void handleManageSubscription()}
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-800/30"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Reactivate Subscription
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid gap-8 md:grid-cols-2">
        {Object.entries(SUBSCRIPTION_TIERS).map(([tier, tierData]) => {
          const pricing = TIER_PRICING[tier as keyof typeof TIER_PRICING];
          const buttonText = getButtonText(tier as "pro" | "premium");
          const buttonVariant = getButtonVariant(tier as "pro" | "premium");
          const buttonDescription = getButtonDescription(tier as "pro" | "premium");
          const isPro = tier === "pro";
          const isCurrentTier = isCurrentPlan(tier as "pro" | "premium");
          
          return (
            <Card
              key={tier}
              className={`relative flex min-h-[450px] flex-col overflow-hidden border-2 ${
                isPro
                  ? "scale-105 border-purple-400 shadow-lg dark:border-purple-600"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className={`absolute left-0 top-0 h-1 w-full ${
                isPro 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-gradient-to-r from-blue-400 to-blue-500"
              }`}></div>
              
              {isPro && (
                <div className="absolute -right-5 -top-5">
                  <div className="origin-bottom-right rotate-45 transform bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-1 text-xs font-bold text-white shadow-lg">
                    RECOMMENDED
                  </div>
                </div>
              )}

              {isCurrentTier && (
                <div className="absolute -left-5 -top-5">
                  <div className={`origin-bottom-left -rotate-45 transform px-8 py-1 text-xs font-bold text-white shadow-lg ${
                    isScheduledForCancellation()
                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                  }`}>
                    {isScheduledForCancellation() ? "CANCELING SOON" : "CURRENT PLAN"}
                  </div>
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  {tierData.name}
                  {isPro && (
                    <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      Popular
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {pricing.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">${pricing.price}</span>
                  <span className="text-gray-500 dark:text-gray-400"> / month</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <div>
                      <span className="font-medium">{tierData.monthlyTokens.toLocaleString()} AI tokens</span>
                      <span> per month</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <div>
                      <span className="font-medium">Advanced system design tools</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <div>
                      <span className="font-medium">Priority AI processing</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <div>
                      <span className="font-medium">Advanced component library</span>
                    </div>
                  </li>
                  {tier === "premium" && (
                    <>
                      <li className="flex items-start">
                        <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                        <div>
                          <span className="font-medium">Advanced analytics</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                        <div>
                          <span className="font-medium">Premium support</span>
                        </div>
                      </li>
                    </>
                  )}
                </ul>
                
                <div className={`mt-4 rounded-md border p-3 ${
                  isPro
                    ? "border-purple-100 bg-purple-50 dark:border-purple-800/30 dark:bg-purple-900/20"
                    : "border-blue-100 bg-blue-50 dark:border-blue-800/30 dark:bg-blue-900/20"
                }`}>
                  <div className={`flex items-center text-sm ${
                    isPro
                      ? "text-purple-700 dark:text-purple-300"
                      : "text-blue-700 dark:text-blue-300"
                  }`}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span className="font-medium">Tokens expire 30 days after subscription starts</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="mt-auto space-y-3">
                {buttonVariant !== "subscribe" && (
                  <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                    {buttonDescription}
                  </p>
                )}
                <Button
                  onClick={() => {
                    if (buttonText === "Subscribe") {
                      void handleSubscribe(tier as "pro" | "premium");
                    } else {
                      // For "Manage Subscription", "Upgrade Plan", and "Downgrade Plan" - go to Customer Portal
                      void handleTierChange(tier as "pro" | "premium");
                    }
                  }}
                  disabled={createSubscriptionMutation.isPending || createPortalMutation.isPending}
                  className={`w-full shadow-md transition-all hover:shadow-lg ${
                    buttonVariant === "upgrade"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      : buttonVariant === "downgrade"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                      : buttonVariant === "manage"
                      ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                      : buttonVariant === "reactivate"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                      : isPro
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  }`}
                >
                  {createSubscriptionMutation.isPending || createPortalMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Loading...
                    </div>
                  ) : (
                    <>
                      {buttonText}
                      {buttonVariant === "upgrade" && <ArrowUp className="ml-2 h-4 w-4" />}
                      {buttonVariant === "downgrade" && <ArrowDown className="ml-2 h-4 w-4" />}
                      {buttonVariant === "manage" && <Settings className="ml-2 h-4 w-4" />}
                      {buttonVariant === "reactivate" && <Settings className="ml-2 h-4 w-4" />}
                      {buttonVariant === "subscribe" && <CreditCard className="ml-2 h-4 w-4" />}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 