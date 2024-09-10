"use client";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme = "dark", setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <Sun className={cn("h-5 w-5", theme === "dark" ? "hidden" : "")} />
      <Moon className={cn("h-5 w-5", theme === "dark" ? "" : "hidden")} />
    </button>
  );
}
