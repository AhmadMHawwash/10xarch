import { type Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TokenBalance } from "@/components/credits/TokenBalance";
import { TransactionHistory } from "@/components/credits/TransactionHistory";
import { AccountContext } from "@/components/credits/AccountContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Coins, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Token Balance",
  description: "View your token balance and transaction history",
};

export default async function BalancePage() {
  const { userId, orgId, orgRole } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user can view transaction history
  // Allow if: 1) No active organization (personal account), or 2) User is admin of the organization
  // Support both new format (org:admin) and legacy format (admin) for backward compatibility
  const canViewTransactionHistory = !orgId || orgRole === "org:admin" || orgRole === "admin";

  return (
    <div className="container mx-auto py-10">
      {/* Account Context */}
      <AccountContext />

      {/* Navigation between Credits and Balance */}
      <div className="mb-8 flex justify-center">
        <div className="flex rounded-lg bg-muted p-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href="/credits" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Purchase Credits
            </Link>
          </Button>
          <Button
            asChild
            variant="default"
            size="sm"
            className="bg-primary text-primary-foreground"
          >
            <Link href="/balance" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              View Balance
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-12">
        {/* Token Balance Section */}
        <section>
          <TokenBalance />
        </section>

        {/* Transaction History Section - Only for admin users or personal accounts */}
        {canViewTransactionHistory && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Transaction History</h2>
              <p className="text-muted-foreground">
                View all your token purchases, subscriptions, and usage
              </p>
            </div>
            <TransactionHistory />
          </section>
        )}

        {/* Access denied message for non-admin organization members */}
        {!canViewTransactionHistory && (
          <section>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Transaction History Access Restricted
              </h3>
              <p className="text-muted-foreground">
                Only organization administrators can view transaction history. 
                Contact your organization admin for access to this information.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
} 