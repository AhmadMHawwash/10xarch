"use client";

import { buttonVariants } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function FloatingButton() {
  return (
    <a
      href="https://archround.userjot.com/"
      target="_blank"
      rel="noopener noreferrer"
      className={`${buttonVariants({
        variant: "outline",
        size: "icon",
      })} fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700`}
      aria-label="Feedback"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
