"use client";

import { useCredits } from "@/hooks/useCredits";

export function TokenBalance() {
  const {
    expiringTokens,
    expiringTokensExpiry,
    nonexpiringTokens,
    totalUsableTokens,
    isLoading: isLoadingCredits,
  } = useCredits();

  if (isLoadingCredits) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4 dark:bg-gray-700"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-40 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-36 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Current Token Balance</h2>
        
        {/* Total Tokens - Top of pyramid */}
        <div className="mb-6">
          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700/50">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {totalUsableTokens.toLocaleString()}
            </div>
            <div className="text-lg font-medium text-blue-700 dark:text-blue-300">Total Tokens Available</div>
          </div>
        </div>
        
        {/* Expiring and Non-Expiring - Bottom of pyramid */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border border-amber-200 dark:border-amber-700/50">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {expiringTokens.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Expiring Tokens
              {expiringTokensExpiry && expiringTokens > 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Expires {new Date(expiringTokensExpiry).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-700/50">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {nonexpiringTokens.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-green-700 dark:text-green-300">Non-Expiring Tokens</div>
          </div>
        </div>
      </div>
    </div>
  );
} 