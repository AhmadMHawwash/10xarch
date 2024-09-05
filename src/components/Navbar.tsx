"use client";
import { Menu, UserCircle, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle"; // Add this import

export default function Navbar({ user }: { user: null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="h-[8vh] bg-slate-100 p-4 shadow-md dark:bg-gray-800">
      <div className="mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 dark:text-white"
        >
          System Design Playground
        </Link>

        <div className="hidden items-center space-x-4 md:!flex">
          <Link
            href="/playground"
            className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Playground
          </Link>
          {/* <Link
            href="/learn"
            className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Learn
          </Link>
          <Link
            href="/community"
            className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Community
          </Link> */}

          {user ? (
            <Link
              href="/profile"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <UserCircle className="inline-block h-8 w-8 stroke-1" />
            </Link>
          ) : (
            <Link
              href="/signin"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Sign In
            </Link>
          )}
          <ThemeToggle />
        </div>

        <div className="flex items-center md:hidden">
          <ThemeToggle />
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="ml-2">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
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
            {/* <Link
              href="/learn"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Learn
            </Link>
            <Link
              href="/community"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Community
            </Link> */}

            {user ? (
              <Link
                href="/profile"
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/signin"
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
