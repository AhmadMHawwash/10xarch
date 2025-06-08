"use client";

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

export function TransactionHistory() {
  const { userId } = useAuth();

  const { data: transactionData, isLoading: isLoadingTransactions } =
    api.credits.getTransactions.useQuery(undefined, {
      enabled: !!userId,
      staleTime: 0, // Consider data stale immediately so it refreshes on mount
    });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 dark:border-gray-700">
            <TableHead className="text-gray-700 dark:text-gray-300">
              Date
            </TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">
              Type
            </TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">
              Amount
            </TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">
              Description
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingTransactions ? (
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableCell
                colSpan={4}
                className="text-center text-gray-600 dark:text-gray-400"
              >
                Loading transactions...
              </TableCell>
            </TableRow>
          ) : transactionData?.transactions?.length === 0 ? (
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableCell
                colSpan={4}
                className="text-center text-gray-600 dark:text-gray-400"
              >
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactionData?.transactions?.map(
              (transaction: CreditTransactionInput) => (
                <TableRow
                  key={transaction.id}
                  className="border-gray-200 dark:border-gray-700"
                >
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="capitalize text-gray-700 dark:text-gray-300">
                    {transaction.type}
                  </TableCell>
                  <TableCell
                    className={
                      transaction.amount > 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {transaction?.reason ?? "-"}
                  </TableCell>
                </TableRow>
              ),
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
} 