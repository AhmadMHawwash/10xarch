"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { useCredits } from "@/hooks/useCredits";
import { api, type RouterOutputs } from "@/trpc/react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

// Token pricing based on gpt-4o-mini costs
// Input: $0.01/1K tokens, Output: $0.03/1K tokens
// Average cost per token = ($0.01 + $0.03) / 2 = $0.02 per 1K tokens
// Per token cost = $0.00002
// We charge 500x for profit margin
const TOKEN_PRICE = 0.01; // $0.01 per token ($0.00002 * 500)
const TOKENS_PER_DOLLAR = Math.floor(1 / TOKEN_PRICE); // 100 tokens per dollar
const MIN_AMOUNT = 5;
const MAX_AMOUNT = 100; // Maximum amount in dollars

// Bonus tiers for token purchases
const BONUS_TIERS = [
  { threshold: 50, bonus: 1.5 }, // 50% bonus for $50+
  { threshold: 25, bonus: 1.25 }, // 25% bonus for $25+
  { threshold: 10, bonus: 1.1 }, // 10% bonus for $10+
  { threshold: 0, bonus: 1 }, // Base rate
];

function calculateTokenBreakdown(dollars: number): {
  baseTokens: number;
  bonusTokens: number;
  totalTokens: number;
  bonusPercentage: number;
} {
  const baseTokens = Math.floor(dollars * TOKENS_PER_DOLLAR);
  const tier = BONUS_TIERS.find((tier) => dollars >= tier.threshold);
  const bonusMultiplier = tier?.bonus ?? 1;
  const totalTokens = Math.floor(baseTokens * bonusMultiplier);
  const bonusTokens = totalTokens - baseTokens;
  const bonusPercentage = Math.round((bonusMultiplier - 1) * 100);

  return {
    baseTokens,
    bonusTokens,
    totalTokens,
    bonusPercentage,
  };
}

type Transaction =
  RouterOutputs["credits"]["getTransactions"]["transactions"][number];

export function CreditManagement() {
  const { balance: credits, isLoading } = useCredits();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("5");
  const dollarAmount = parseFloat(amount) || 0;
  const { baseTokens, bonusTokens, totalTokens, bonusPercentage } =
    calculateTokenBreakdown(dollarAmount);
  const isValidAmount = dollarAmount >= MIN_AMOUNT;

  const { data: transactionData, isLoading: isLoadingTransactions } =
    api.credits.getTransactions.useQuery();

  const addCreditsMutation = api.credits.addCredits.useMutation({
    onSuccess: () => {
      setAmount("5");
      toast({
        title: "Credits added successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding credits",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddCredits = async (customAmount?: number) => {
    try {
      const amountToAdd = customAmount ?? totalTokens;
      await addCreditsMutation.mutateAsync({ amount: amountToAdd });
    } catch (error) {
      // Error is handled by the mutation callbacks
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="space-y-4 p-4">
        <h2 className="text-2xl font-bold">Credit Management</h2>
        <div className="rounded-lg border p-4">
          <p className="mb-4">Current Balance: {credits} credits</p>

          <div className="mb-6 space-y-4">
            <div className="flex max-w-md flex-col space-y-4">
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Amount (${MIN_AMOUNT} - ${MAX_AMOUNT})
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
                        setAmount(value?.[0]?.toString?.() ?? "5")
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
                        ${amount}
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
                  onClick={() => handleAddCredits()}
                  disabled={!isValidAmount || addCreditsMutation.isPending}
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
                          ${amount}
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
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="capitalize">
                        {transaction.status}
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
