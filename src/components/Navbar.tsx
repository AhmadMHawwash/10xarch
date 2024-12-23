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
    <nav className="h-[7vh] bg-slate-100 p-4 shadow-md dark:bg-gray-800">
      <div className="mx-auto flex items-center justify-between">
        <span className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex gap-2 text-xl font-bold text-gray-900 dark:text-white"
          >
            <Logo className="h-8 w-8 pb-0.5 pt-0.5" />
            <span className="hidden md:block">Archround</span>
          </Link>
          <span className="flex items-center space-x-4 border-l border-gray-400 pl-4">
            {[
              { name: "Challenges", href: "/challenges" },
              { name: "Playground", href: "/playground" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white underline-offset-4 hover:underline transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </span>
        </span>
        <div className="hidden items-center space-x-4 md:!flex">
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
