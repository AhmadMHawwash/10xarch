"use client";
import { SignInButton, useUser, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useCredits } from "@/hooks/useCredits";
import { api } from "@/trpc/react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./icons/logo";

export default function Navbar() {
  const { user } = useUser();
  const { balance: credits, isLoading, refetch: refetchCredits } = useCredits();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      void refetchCredits();
    }
  }, [user, refetchCredits]);

  return (
    <nav className="h-[7vh] bg-slate-100 p-4 shadow-md dark:bg-gray-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold">Archround</span>
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
          {user && (
            <Link
              href="/credits"
              className="text-sm transition-none hover:text-gray-600 hover:underline dark:hover:text-gray-300"
            >
              {isLoading ? "Loading credits..." : <>Credits: {credits}</>}
            </Link>
          )}
          <ThemeToggle />
          {user && <UserButton />}
          {!user && (
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          )}
        </div>

        {isMenuOpen && (
          <div className="absolute left-0 right-0 top-[7vh] z-50 bg-slate-100 p-4 shadow-md dark:bg-gray-800 md:hidden">
            {user && (
              <Link
                href="/credits"
                className="block py-2 text-sm transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                {isLoading ? "Loading credits..." : <>Credits: {credits}</>}
              </Link>
            )}
            <div className="flex items-center justify-between pt-2">
              <ThemeToggle />
              {user && <UserButton />}
              {!user && (
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
