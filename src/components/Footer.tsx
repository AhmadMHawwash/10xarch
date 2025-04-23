"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="container flex items-center justify-between px-4">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} 10×arch. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <Link
            prefetch={false}
            href="https://github.com/AhmadMHawwash/system-design-playground/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-blue-500"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Give Feedback</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
