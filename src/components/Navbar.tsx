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
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./icons/logo";
import { Button } from "./ui/button";
import { api } from "@/trpc/react";

function RateLimitInfo() {
  const { user } = useUser();
  const rateLimitQuery = api.challenges.getRateLimitInfo.useQuery(undefined, {
    refetchInterval: 1000 * 60, // Refresh every minute
  });

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
    <div className="space-y-2 p-2 rounded-md bg-secondary/30">
      {user && (
        <p className="text-xs italic text-muted-foreground">
          Free challenges do not use your credits
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Submissions:&nbsp;</span>
        <span className={cn(
          "font-bold",
          remaining === 0 ? "text-destructive" : "text-primary"
        )}>
          {remaining}/{limit}
        </span>
      </div>
      {remaining < limit && (
        <p className="text-xs text-muted-foreground flex items-center justify-end">
          <span className="mr-1">Resets at</span>
          <span className="font-medium">{formattedTime}</span>
        </p>
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

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  return (
    <nav className="relative z-50 h-[7vh] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-full items-center justify-between">
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

        <div className="hidden items-center space-x-4 md:flex">
          <FreeChallengeBadge />
          {user && (
            <Link
              href="/credits"
              className={cn(
                "text-sm text-muted-foreground hover:text-foreground",
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
          <ThemeToggle />
          {user ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          )}
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
