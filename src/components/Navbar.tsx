"use client";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle"; // Add this import
import { Button } from "./ui/button";
import { Logo } from "./icons/logo";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="h-[8vh] bg-slate-100 p-4 shadow-md dark:bg-gray-800">
      <div className="mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 dark:text-white flex gap-2"
        >
          <Logo className="h-8 w-8 pt-0.5 pb-0.5" />
          ArchRound
        </Link>
        <div className="hidden items-center space-x-4 md:!flex">
          <Link
            href="/challenges"
            className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Challenges
          </Link>
          <Link
            href="/playground"
            className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Playground
          </Link>

          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <ThemeToggle />
        </div>

        <div className="flex items-center md:hidden">
          <ThemeToggle />
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="ml-2"
            variant="ghost"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="mt-2 flex flex-col space-y-2">
            <Link
              href="/playground"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Playground
            </Link>

            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}
