"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AIChatAssistant } from ".";

export function PanelChat() {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams<{ slug: string }>();

  if (!params.slug) return null;

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 400 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-2 w-[400px] overflow-hidden rounded-lg border bg-background shadow-lg"
          >
            <div className="flex items-center justify-between border-b bg-muted/50 p-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Bot className="h-5 w-5" /> AI Assistant
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[calc(400px-48px)]">
              <AIChatAssistant />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-background px-4 py-2 shadow-lg"
      >
        <Bot className="h-4 w-4" />
        {isOpen ? "Hide AI Assistant" : "Show AI Assistant"}
      </Button>
    </div>
  );
}
