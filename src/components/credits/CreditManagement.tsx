"use client";

import { Button } from "@/components/ui/button";
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

type Transaction = RouterOutputs["credits"]["getTransactions"]["transactions"][number];

export function CreditManagement() {
  const { balance: credits, isLoading } = useCredits();
  const { toast } = useToast();

  const { data: transactionData, isLoading: isLoadingTransactions } =
    api.credits.getTransactions.useQuery();

  const addCreditsMutation = api.credits.addCredits.useMutation({
    onSuccess: () => {
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

  const handleAddCredits = async (amount: number) => {
    try {
      await addCreditsMutation.mutateAsync({ amount });
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
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => handleAddCredits(100)}
              disabled={addCreditsMutation.isPending}
            >
              Add 100 Credits
            </Button>
            <Button
              onClick={() => handleAddCredits(500)}
              disabled={addCreditsMutation.isPending}
            >
              Add 500 Credits
            </Button>
            <Button
              onClick={() => handleAddCredits(1000)}
              disabled={addCreditsMutation.isPending}
            >
              Add 1000 Credits
            </Button>
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
