"use client";

import { buttonVariants } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";

export function FeedbackButton() {
  return (
    <a
      href="https://archround.userjot.com/"
      target="_blank"
      rel="noopener noreferrer"
      className={`${buttonVariants({
        variant: "outline",
        size: "icon",
      })} group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-blue-500 shadow-md ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25 dark:bg-blue-600 dark:hover:bg-blue-700`}
      aria-label="Give Feedback"
    >
      <ThumbsUp className="h-6 w-6 text-white transition-transform group-hover:scale-105" />
      <span className="sr-only">Give Feedback</span>
    </a>
  );
}
