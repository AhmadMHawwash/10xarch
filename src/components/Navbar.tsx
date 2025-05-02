"use client";
import { CreditAlert } from "@/components/credits/CreditAlert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import challenges from "@/content/challenges";
import { useCredits } from "@/hooks/useCredits";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { SignUpButton, useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { Coins, Github, Loader2, Menu, X } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./icons/logo";
import { Button } from "./ui/button";

function RateLimitInfo() {
  const rateLimitQuery = api.challenges.getChallengesSubmitRateLimitInfo.useQuery(undefined, {
    refetchInterval: 1000 * 60, // Refresh every minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Consider data stale immediately so it refreshes on mount
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
          {remaining > 0
            ? `${remaining} of ${limit} free submissions available`
            : `0 of ${limit} free submissions available`}
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
              You&apos;ve used all free submissions.{" "}
              <Link
                href="/credits"
                className="font-medium underline"
                prefetch={false}
              >
                Purchase credits
              </Link>{" "}
              to continue.
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
  if (!params?.slug || !challenge?.isFree) return null;

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
  const { isSignedIn, isLoading: isUserLoading } = useCurrentUser();
  const { userId } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { 
    balance: credits, 
    isLoading: isLoadingCredits,
    hasValidData,
    refetch: refetchCredits 
  } = useCredits();
  const pathname = usePathname();

  // Only refresh credits once when the user is first identified
  useEffect(() => {
    if (userId && !isLoadingCredits) {
      void refetchCredits();
    }
  }, [userId]); // Intentionally omit refetchCredits from dependencies to prevent re-runs

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
        {/* Left section - Logo and Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="flex items-center space-x-2"
            prefetch={false}
          >
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold">10×arch</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden items-center space-x-4 md:flex">
            <Link
              href="/playground"
              className={cn(
                "text-sm font-medium hover:text-primary",
                pathname === "/playground"
                  ? "font-semibold text-primary"
                  : "text-muted-foreground",
              )}
              prefetch={false}
            >
              Playground
            </Link>
            <Link
              href="/challenges"
              className={cn(
                "text-sm font-medium hover:text-primary",
                pathname === "/challenges"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
              prefetch={false}
            >
              Challenges
            </Link>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="block p-2 md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Right section - User info, Credits, Theme Toggle */}
        <div className="hidden items-center space-x-4 md:flex">
          <FreeChallengeBadge />

          {isUserLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : isSignedIn ? (
            <div className="flex items-center space-x-4">
              <Link
                href="/credits"
                className="flex items-center gap-1.5 text-sm font-medium"
                prefetch={false}
              >
                <Coins className="h-4 w-4" />
                {isLoadingCredits || !hasValidData ? (
                  <span className="text-muted-foreground">Loading...</span>
                ) : (
                  <span className="text-muted-foreground">
                    {credits} credits
                  </span>
                )}
              </Link>
              <CreditAlert className="ml-2" />
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 font-medium text-white hover:from-blue-700 hover:to-purple-700"
                >
                  Sign up
                </Button>
              </SignUpButton>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Link
              href="https://github.com/AhmadMHawwash/system-design-playground"
              className="rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-gray-200 hover:text-primary dark:hover:bg-gray-700"
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
            >
              <Github className="h-5 w-5 text-gray-800 dark:text-white" />
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute left-0 right-0 top-[7vh] z-50 bg-slate-100 p-4 shadow-md dark:bg-gray-800 md:hidden">
            {/* Navigation Links - Mobile */}
            <div className="mb-4 space-y-2">
              <Link
                href="/playground"
                className={cn(
                  "block py-2 text-sm hover:text-primary",
                  pathname === "/playground"
                    ? "font-semibold text-primary"
                    : "text-muted-foreground",
                )}
                prefetch={false}
              >
                Playground
              </Link>
              <Link
                href="/challenges"
                className={cn(
                  "block py-2 text-sm hover:text-primary",
                  pathname === "/challenges"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
                prefetch={false}
              >
                Challenges
              </Link>
            </div>

            {/* Challenge & Credits Info - Mobile */}
            <FreeChallengeBadge />
            {isUserLoading ? (
              <div className="flex items-center space-x-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : (
              isSignedIn && (
                <Link
                  href="/credits"
                  className={cn(
                    "block py-2 text-sm text-muted-foreground hover:text-foreground",
                    isLoadingCredits && "animate-pulse",
                  )}
                  prefetch={false}
                >
                  {isLoadingCredits || !hasValidData ? (
                    "Loading credits..."
                  ) : (
                    <>Credits: {credits}</>
                  )}
                </Link>
              )
            )}

            {/* User & Theme - Mobile */}
            <div className="flex items-center justify-between py-2">
              <ThemeToggle />
              <Link
                href="https://github.com/AhmadMHawwash/system-design-playground"
                className="rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-gray-200 hover:text-primary dark:hover:bg-gray-700"
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
              >
                <Github className="h-5 w-5" />
              </Link>
              {isUserLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <div className="flex w-full flex-col space-y-2">
                  <SignInButton mode="modal">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full rounded-full"
                    >
                      Sign in
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 font-medium text-white hover:from-blue-700 hover:to-purple-700"
                    >
                      Sign up
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
