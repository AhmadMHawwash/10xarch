"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import { useSessionId } from "@/hooks/useSessionId";
import { ChatUI } from "./ChatUI";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const sessionId = useSessionId();
  const params = useParams<{ slug: string }>();

  if (!sessionId || !params.slug) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 h-[600px] w-[414px] overflow-hidden rounded-lg border bg-background shadow-xl"
            style={{ zIndex: 50 }}
          >
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="text-base font-medium">AI Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[calc(100%-48px)]">
              <ChatUI sessionId={sessionId} challengeId={params.slug} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-24 h-12 w-12 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>
    </>
  );
}
