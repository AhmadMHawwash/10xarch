"use client";

import { useCredits } from "@/hooks/useCredits";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AlertCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreditAlertProps {
  className?: string;
  variant?: "inline" | "banner";
  hasNoFreePrompts?: boolean;
}

export function CreditAlert({ className, variant = "inline", hasNoFreePrompts = true }: CreditAlertProps) {
  const { hasLowCredits, balance } = useCredits();

  if (!hasLowCredits || !hasNoFreePrompts) {
    return null;
  }

  if (variant === "banner") {
    return (
      <div className={cn(
        "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-3 rounded-md flex items-center gap-3",
        className
      )}>
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
            You&apos;ve used all your free AI credits
          </p>
          <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
            Purchase more credits to continue using AI features
          </p>
        </div>
        <Button asChild size="sm" className="flex-shrink-0">
          <Link href="/credits">
            <CreditCard className="mr-2 h-4 w-4" />
            Buy Credits
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Link 
      href="/credits"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300",
        className
      )}
    >
      <CreditCard className="h-3.5 w-3.5" />
      <span>You have {balance} credits. Buy more</span>
    </Link>
  );
} 