"use client";

import { useToast } from "@/components/ui/use-toast";
import { useCredits } from "@/hooks/useCredits";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useAuth } from "@clerk/nextjs";
import { type CreditTransactionInput } from "@/lib/validations/credits";
import { api } from "@/trpc/react";
import { CreditPackages } from "./CreditPackages";

export function CreditManagement() {
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sid = searchParams.get("session_id");
    if (sid) {
      setSessionId(sid);
    }
  }, []);

  const {
    expiringTokens,
    expiringTokensExpiry,
    nonexpiringTokens,
    totalUsableTokens,
    refetch: refetchCredits,
    isLoading: isLoadingCredits,
  } = useCredits();

  const verifySessionMutation = api.stripe.verifySession.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Payment Successful",
          description: `Added ${data.totalTokens.toLocaleString()} tokens to your account!`,
        });
        void refetchCredits();
      }
      // Clear the session_id from URL
      window.history.replaceState({}, "", window.location.pathname);
    },
    onError: (error) => {
      toast({
        title: "Payment Issue",
        description: error.message,
        variant: "destructive",
      });
      // Clear the session_id from URL
      window.history.replaceState({}, "", window.location.pathname);
    },
  });

  useEffect(() => {
    if (sessionId) {
      void verifySessionMutation.mutate({ sessionId });
    }
  }, [sessionId]);

  const { data: transactionData, isLoading: isLoadingTransactions } =
    api.credits.getTransactions.useQuery(undefined, {
      enabled: !!userId,
      staleTime: 0, // Consider data stale immediately so it refreshes on mount
    });

  if (isLoadingCredits) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="space-y-6 p-4">
        <h2 className="text-2xl font-bold">Token Management</h2>
        
        {/* Token Balance Display */}
        <div className="rounded-lg border p-4">
          <div className="mb-4">
            <div className="font-semibold">Current Token Balances:</div>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <span className="font-medium">Total:</span> {totalUsableTokens.toLocaleString()} tokens
              </li>
              <li>
                <span className="font-medium">Expiring:</span> {expiringTokens.toLocaleString()} tokens
                {expiringTokensExpiry && expiringTokens > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (expires {new Date(expiringTokensExpiry).toLocaleDateString()})
                  </span>
                )}
              </li>
              <li>
                <span className="font-medium">Non-expiring:</span> {nonexpiringTokens.toLocaleString()} tokens
              </li>
            </ul>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold">Purchase Token Packages</h3>
            <p className="text-muted-foreground">Choose a package that fits your needs. Non-expiring tokens never expire!</p>
          </div>
          <CreditPackages />
        </div>

        {/* Transaction History */}
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-xl font-bold">Transaction History</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTransactions ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactionData?.transactions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactionData?.transactions?.map(
                  (transaction: CreditTransactionInput) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="capitalize">
                        {transaction.type}
                      </TableCell>
                      <TableCell
                        className={
                          transaction.amount > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount}
                      </TableCell>
                      <TableCell>{transaction?.reason ?? "-"}</TableCell>
                    </TableRow>
                  ),
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
