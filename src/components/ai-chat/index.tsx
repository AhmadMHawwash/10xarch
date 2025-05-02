"use client";

import { ChatUI } from "./ChatUI";
import { useParams } from "next/navigation";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";

export function AIChatAssistant() {
  const params = useParams<{ slug: string }>();
  const { currentStageIndex, challenge } = useChallengeManager();

  // Wait for everything to be initialized
  if (!params?.slug || !challenge) return null;

  return (
    <ChatUI
      challengeId={params.slug}
      stageIndex={currentStageIndex ?? 0}
    />
  );
}
