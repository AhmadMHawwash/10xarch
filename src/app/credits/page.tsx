import { type Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CreditManagement } from "@/components/credits/CreditManagement";
import { SubscriptionPricingTable } from "@/components/pricing/SubscriptionPricingTable";
import { CustomerPortalSuccess } from "@/components/credits/CustomerPortalSuccess";

export const metadata: Metadata = {
  title: "AI Credits",
  description: "Manage your AI credits",
};

export default async function CreditsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">AI Credits</h1>
          <p className="text-muted-foreground">
            Purchase and manage your AI credits
          </p>
        </div>
        
        {/* Success message for Customer Portal returns */}
        <Suspense>
          <CustomerPortalSuccess />
        </Suspense>
        
        <CreditManagement />
        
        {/* Subscription Plans Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Subscription Plans</h2>
            <p className="text-muted-foreground">
              Get monthly tokens with a subscription plan
            </p>
          </div>
          <SubscriptionPricingTable contextOnly={true} />
        </div>
      </div>
    </div>
  );
}
