"use client";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";
import { useState } from "react";
import { useCredits } from "@/hooks/useCredits";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./icons/logo";

export default function Navbar() {
  const { user } = useUser();
  const { credits, isLoading } = useCredits();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="h-[7vh] bg-slate-100 p-4 shadow-md dark:bg-gray-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold">System Design</span>
          </Link>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        <div className="hidden items-center space-x-4 md:flex">
          {!user && (
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          )}
          {user && (
            <>
              <div className="text-sm">
                {isLoading ? (
                  "Loading credits..."
                ) : (
                  <>Credits: {credits?.balance ?? 0}</>
                )}
              </div>
              <Link href="/credits">
                <Button variant="outline" size="sm">
                  Buy Credits
                </Button>
              </Link>
              <SignOutButton>
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </SignOutButton>
            </>
          )}
          <ThemeToggle />
        </div>

        {isMenuOpen && (
          <div className="absolute left-0 right-0 top-[7vh] z-50 bg-slate-100 p-4 shadow-md dark:bg-gray-800 md:hidden">
            {!user && (
              <SignInButton mode="modal">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </SignInButton>
            )}
            {user && (
              <>
                <div className="text-sm">
                  {isLoading ? (
                    "Loading credits..."
                  ) : (
                    <>Credits: {credits?.balance ?? 0}</>
                  )}
                </div>
                <Link href="/credits">
                  <Button variant="outline" className="mt-2 w-full">
                    Buy Credits
                  </Button>
                </Link>
                <SignOutButton>
                  <Button variant="outline" className="mt-2 w-full">
                    Sign Out
                  </Button>
                </SignOutButton>
              </>
            )}
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
