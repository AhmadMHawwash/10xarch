"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import challenges from "@/content/challenges";
import { useCredits } from "@/hooks/useCredits";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Menu, X, Coins } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./icons/logo";
import { Button } from "./ui/button";
import { CreditAlert } from "@/components/credits/CreditAlert";

function RateLimitInfo() {
  const rateLimitQuery = api.challenges.getRateLimitInfo.useQuery(undefined, {
    refetchInterval: 1000 * 60, // Refresh every minute
  });
  
  const { balance: credits } = useCredits();

  if (rateLimitQuery.isLoading) {
    return <p>Loading...</p>;
  }

  if (!rateLimitQuery.data) {
    return null;
  }

  const { remaining, reset, limit } = rateLimitQuery.data;
  const resetTime = new Date(reset);
  const formattedTime = resetTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="space-y-2 rounded-md bg-secondary/30 p-2">
      <p className="text-xs italic text-muted-foreground">
        Free submissions are used before credits are deducted
      </p>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-bold",
            remaining === 0 ? "text-destructive" : "text-primary",
          )}
        >
          {remaining} of {limit} free submissions available
        </span>
      </div>
      {remaining < limit && (
        <p className="flex items-center justify-end text-xs text-muted-foreground">
          <span className="mr-1">Next reset:</span>
          <span className="font-medium">{formattedTime}</span>
        </p>
      )}
      {remaining === 0 && (
        <div className="mt-2 border-t border-border/40 pt-2">
          {credits > 0 ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              You have {credits} credits available to continue using AI features
            </p>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              You&apos;ve used all free submissions. <Link href="/credits" className="underline font-medium">Purchase credits</Link> to continue.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FreeChallengeBadge() {
  const params = useParams<{ slug: string }>();
  const challenge = challenges.find((c) => c.slug === params?.slug);

  // Only show for free challenges
  if (!params.slug || !challenge?.isFree) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative cursor-help text-sm">
            <span className="font-medium text-primary">Free Challenge</span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={5}
          className="z-[100]"
          side="bottom"
          align="center"
        >
          <RateLimitInfo />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function Navbar() {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { balance: credits, isLoading: isLoadingCredits } = useCredits();
  const pathname = usePathname();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  // Only apply container class for home and challenges pages
  const shouldUseContainer = pathname === "/" || pathname === "/challenges";

  return (
    <nav className="relative z-50 h-[7vh] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div
        className={cn(
          "flex h-full items-center justify-between",
          shouldUseContainer ? "container" : "px-6",
        )}
      >
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold">Archround</span>
          </Link>
        </div>

        <button
          className="block p-2 md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        <div className="hidden items-center space-x-6 md:flex">
          <FreeChallengeBadge />
          {user ? (
            <>
              <div className="flex items-center space-x-3">
                <Link
                  href="/challenges"
                  className={cn(
                    "text-sm font-medium hover:text-primary",
                    pathname === "/challenges"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  Challenges
                </Link>
                <Link
                  href="/playground"
                  className={cn(
                    "text-sm font-medium hover:text-primary",
                    pathname === "/playground"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  Playground
                </Link>
                <Link
                  href="/credits"
                  className="flex items-center gap-1.5 text-sm font-medium"
                >
                  <Coins className="h-4 w-4" />
                  {isLoadingCredits ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    <span className="text-muted-foreground">
                      {credits} credits
                    </span>
                  )}
                </Link>
                <CreditAlert className="ml-2" />
              </div>

              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          )}
          <ThemeToggle />
        </div>

        {isMenuOpen && (
          <div className="absolute left-0 right-0 top-[7vh] z-50 bg-slate-100 p-4 shadow-md dark:bg-gray-800 md:hidden">
            <FreeChallengeBadge />
            {user && (
              <Link
                href="/credits"
                className={cn(
                  "block py-2 text-sm text-muted-foreground hover:text-foreground",
                  isLoadingCredits && "animate-pulse",
                )}
              >
                {isLoadingCredits ? (
                  "Loading credits..."
                ) : (
                  <>Credits: {credits}</>
                )}
              </Link>
            )}
            <div className="flex items-center justify-between py-2">
              <ThemeToggle />
              {user ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
