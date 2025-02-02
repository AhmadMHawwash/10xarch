"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import { useSessionId } from "@/hooks/useSessionId";
import { ChatUI } from "./ChatUI";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";

export function PanelChat() {
  const [isOpen, setIsOpen] = useState(false);
  const sessionId = useSessionId();
  const params = useParams<{ slug: string }>();

  if (!sessionId || !params.slug) return null;

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 400 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-full overflow-hidden rounded-lg border bg-background shadow-sm"
          >
            <div className="flex items-center justify-between border-b bg-muted/50 p-2">
              <span className="text-sm font-medium flex items-center gap-2">
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
              <ChatUI sessionId={sessionId} challengeId={params.slug} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          {isOpen ? "Hide AI Assistant" : "Show AI Assistant"}
        </Button>
      </div>
      <Separator className="mb-4" />
    </div>
  );
}
