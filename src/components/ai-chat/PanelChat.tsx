"use client";

import { Bot, ChevronLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { ChatUI } from "./ChatUI";

interface PanelChatProps {
  isPlayground?: boolean;
  playgroundId?: string;
  playgroundTitle?: string;
  inSidePanel?: boolean;
  onOpenSidePanel?: () => void;
}

export function PanelChat({
  isPlayground = false,
  playgroundId,
  playgroundTitle,
  inSidePanel = false,
  onOpenSidePanel,
}: PanelChatProps) {
  const params = useParams<{ slug: string }>();

  if (isPlayground && !playgroundId) return null;
  if (!isPlayground && !params?.slug) return null;

  // If we're rendering inside a side panel, just return the ChatUI
  if (inSidePanel) {
    return (
      <div className="h-full flex-1 overflow-hidden">
        <ChatUI
          challengeId={isPlayground ? undefined : params?.slug}
          stageIndex={isPlayground ? undefined : 0}
          isPlayground={isPlayground}
          playgroundId={playgroundId}
          playgroundTitle={playgroundTitle}
        />
      </div>
    );
  }

  // Otherwise just render the button that opens the side panel
  return (
    <div className="ai-chat-assistant relative">
      <button
        onClick={onOpenSidePanel}
        className="relative flex animate-pulse-ring items-center gap-2 rounded-md bg-background/95 px-4 py-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <ChevronLeft className="h-6 w-6 mt-1" />
        <Bot className="h-7 w-7" />
      </button>
    </div>
  );
}
