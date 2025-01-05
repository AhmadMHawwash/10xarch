"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { api, type RouterOutputs } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useCredits } from "@/hooks/useCredits";
import { useState } from "react";

// Token conversion rate: $1 = 20 tokens
const TOKENS_PER_DOLLAR = 20;
const MIN_AMOUNT = 5;

type Transaction = RouterOutputs["credits"]["getTransactions"]["transactions"][number];

export function CreditManagement() {
  const { balance: credits, isLoading } = useCredits();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const dollarAmount = parseFloat(amount) || 0;
  const tokenAmount = Math.floor(dollarAmount * TOKENS_PER_DOLLAR);
  const isValidAmount = dollarAmount >= MIN_AMOUNT;

  const { data: transactionData, isLoading: isLoadingTransactions } =
    api.credits.getTransactions.useQuery();

  const addCreditsMutation = api.credits.addCredits.useMutation({
    onSuccess: () => {
      setAmount("");
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
      const amountToAdd = customAmount ?? tokenAmount;
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
          <p className="mb-4">
            Current Balance: {credits} credits
          </p>
          
          <div className="mb-6 space-y-4">
            <div className="flex max-w-md flex-col space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Custom Amount (minimum ${MIN_AMOUNT})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  min={MIN_AMOUNT}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-6"
                  placeholder="Enter amount in USD"
                />
              </div>
              {amount && (
                <p className="text-sm text-gray-600">
                  You will receive: {tokenAmount} tokens
                </p>
              )}
              <Button
                onClick={() => handleAddCredits()}
                disabled={!isValidAmount || addCreditsMutation.isPending}
                className="mt-2"
              >
                {addCreditsMutation.isPending ? "Processing..." : "Purchase Tokens"}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">Quick Purchase Options:</p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => handleAddCredits(100)}
                disabled={addCreditsMutation.isPending}
              >
                Add 100 Credits ($5)
              </Button>
              <Button
                onClick={() => handleAddCredits(500)}
                disabled={addCreditsMutation.isPending}
              >
                Add 500 Credits ($25)
              </Button>
              <Button
                onClick={() => handleAddCredits(1000)}
                disabled={addCreditsMutation.isPending}
              >
                Add 1000 Credits ($50)
              </Button>
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
