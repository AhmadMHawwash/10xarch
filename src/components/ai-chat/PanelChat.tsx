"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, X, Maximize2, Minimize2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AIChatAssistant } from ".";

export function PanelChat() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const params = useParams<{ slug: string }>();

  const handleExpandToDialog = () => {
    setIsPanelOpen(false);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsPanelOpen(true);
  };

  if (!params.slug) return null;

  return (
    <div className="relative">
      {/* Small Panel */}
      <AnimatePresence>
        {isPanelOpen && !isDialogOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 400 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-2 w-[400px] overflow-hidden rounded-lg border border-border/40 bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <div className="flex h-8 items-center justify-between border-b border-border/40 bg-muted/50 px-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="text-xs font-medium">AI Assistant</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-muted/50"
                  onClick={handleExpandToDialog}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-muted/50"
                  onClick={() => setIsPanelOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="h-[calc(100%-32px)]">
              <div className="h-full">
                <AIChatAssistant />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[80vw] w-[1020px] h-[80vh] p-0 gap-0 border border-border/40 bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-8 items-center justify-between border-b border-border/40 bg-muted/50 px-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="text-xs font-medium">AI Assistant</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-muted/50"
                onClick={handleCloseDialog}
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-muted/50"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="h-[calc(100%-32px)]">
            <div className="h-full">
              <AIChatAssistant />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsPanelOpen(true)}
        className={`flex items-center gap-2 rounded-full bg-background/95 px-4 py-2 shadow-lg relative backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
          !isPanelOpen && !isDialogOpen ? "animate-pulse-ring" : ""
        }`}
      >
        <Bot className={`h-7 w-7`} />
      </Button>
    </div>
  );
}
