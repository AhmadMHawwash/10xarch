import { type Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SubscriptionPricingTable } from "@/components/pricing/SubscriptionPricingTable";
import { CustomerPortalSuccess } from "@/components/credits/CustomerPortalSuccess";
import { AccountContext } from "@/components/credits/AccountContext";
import { CreditPackages } from "@/components/credits/CreditPackages";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Coins, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Credits",
  description: "Purchase and manage your AI credits",
};

export default async function CreditsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-10">
      {/* Account Context */}
      <AccountContext />

      {/* Navigation between Credits and Balance */}
      <div className="mb-8 flex justify-center">
        <div className="flex rounded-lg bg-muted p-1">
          <Button
            asChild
            variant="default"
            size="sm"
            className="bg-primary text-primary-foreground"
          >
            <Link href="/credits" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Purchase Credits
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href="/balance" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              View Balance
            </Link>
          </Button>
        </div>
      </div>

      {/* Success Notifications */}
      <Suspense>
        <CustomerPortalSuccess />
      </Suspense>

      <div className="space-y-16">
        {/* Subscription Plans Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">Subscription Plans</h2>
            <p className="text-muted-foreground">
              Get monthly tokens automatically with a subscription plan for better value
            </p>
          </div>
          <SubscriptionPricingTable contextOnly={true} />
        </section>

        {/* Token Packages Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Token Packages</h2>
            <p className="text-muted-foreground">
              Purchase one-time token packages that never expire
            </p>
          </div>
          <CreditPackages />
        </section>
      </div>
    </div>
  );
}
