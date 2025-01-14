"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { useCredits } from "@/hooks/useCredits";
import {
  calculatePurchaseTokens,
  isValidAmount,
  MAX_AMOUNT,
  MIN_AMOUNT
} from "@/lib/tokens";
import { api } from "@/trpc/react";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

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

type Transaction = {
  id: string;
  createdAt: Date;
  type: string;
  amount: number;
  description: string | null;
  status: string;
};

export function CreditManagement() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("5");
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setSessionId(searchParams.get("session_id"));
  }, []);

  const {
    balance: credits,
    refetch: refetchCredits,
    isLoading: isLoadingCredits,
  } = useCredits();
  const { data: session, isSuccess } = api.stripe.verifySession.useQuery(
    {
      sessionId: sessionId ?? "",
    },
    {
      enabled: !!sessionId,
    },
  );

  useEffect(() => {
    if (isSuccess) {
      if (session?.success) {
        toast({
          title: "Payment Successful",
          description: `Added ${session.totalTokens.toLocaleString()} tokens to your account!`,
        });
      } else {
        toast({
          title: "Payment Issue",
          description:
            session?.message ??
            "There was an issue adding tokens to your account. Please contact support.",
          variant: "destructive",
        });
      }
      void refetchCredits();
      // Clear the session_id from URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [isSuccess, session, toast, refetchCredits]);

  const addCreditsMutation = api.stripe.createCheckoutSession.useMutation();

  const { baseTokens, bonusTokens, totalTokens, bonusPercentage } =
    calculatePurchaseTokens(parseFloat(amount));

  const handleAddCredits = async () => {
    const parsedAmount = parseFloat(amount);

    if (!isValidAmount(parsedAmount)) {
      toast({
        title: "Invalid amount",
        description: `Please enter an amount between ${formatCurrency(
          MIN_AMOUNT,
        )} and ${formatCurrency(MAX_AMOUNT)}`,
        variant: "destructive",
      });
      return;
    }

    const result = await addCreditsMutation.mutateAsync({
      amount: parsedAmount,
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
  };

  const { data: transactionData, isLoading: isLoadingTransactions } =
    api.credits.getTransactions.useQuery();

  if (!credits && isLoadingCredits) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="space-y-4 p-4">
        <h2 className="text-2xl font-bold">Credit Management</h2>
        <div className="rounded-lg border p-4">
          <p className="mb-4">
            Current Balance: {credits?.toLocaleString()} credits
          </p>

          <div className="mb-6 space-y-4">
            <div className="flex max-w-md flex-col space-y-4">
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Amount ({formatCurrency(MIN_AMOUNT)} -{" "}
                  {formatCurrency(MAX_AMOUNT)})
                </label>
                <div className="mb-2">
                  <div className="relative mb-6 mt-2">
                    <Slider
                      id="amount"
                      min={MIN_AMOUNT}
                      max={MAX_AMOUNT}
                      step={1}
                      value={[parseFloat(amount)]}
                      onValueChange={(value) =>
                        setAmount(value?.[0]?.toString() ?? "5")
                      }
                      className="py-4"
                    />
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col items-start">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        You pay
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat(amount))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="min-w-[200px] space-y-4">
                        <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                          You receive
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <span className="w-16">Base:</span>
                            <span className="ml-2 tabular-nums">
                              {baseTokens.toLocaleString()}
                            </span>
                          </div>
                          {bonusTokens > 0 && (
                            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                              <span className="w-16">Bonus:</span>
                              <span className="tabular-nums">
                                +{bonusTokens.toLocaleString()}
                              </span>
                              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                +{bonusPercentage}%
                              </span>
                            </div>
                          )}
                          <div className="flex items-center border-t border-gray-200 pt-1 dark:border-gray-700">
                            <span className="w-16 font-medium">Total:</span>
                            <span className="ml-2 font-bold tabular-nums">
                              {totalTokens.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <Button
                  onClick={handleAddCredits}
                  disabled={!!addCreditsMutation.isPending}
                  className="relative h-14 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  <div className="flex items-center justify-center space-x-3">
                    {addCreditsMutation.isPending ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span className="text-lg text-gray-100 dark:text-gray-200">
                          Processing...
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg text-gray-100 dark:text-gray-200">
                          Purchase {totalTokens.toLocaleString()} tokens
                        </span>
                        <span className="text-sm text-gray-100 dark:text-gray-200">
                          •
                        </span>
                        <span className="text-lg font-bold text-gray-100 dark:text-gray-200">
                          {formatCurrency(parseFloat(amount))}
                        </span>
                      </>
                    )}
                  </div>
                </Button>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-xl font-bold">Transaction History</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTransactions ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactionData?.transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactionData?.transactions.map(
                  (transaction: Transaction) => (
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
                      <TableCell>{transaction?.description ?? "-"}</TableCell>
                      <TableCell className="capitalize">
                        {transaction?.status}
                      </TableCell>
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
