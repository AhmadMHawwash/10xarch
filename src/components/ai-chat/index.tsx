'use client'

import { useSessionId } from '@/hooks/useSessionId'
import { ChatUI } from './ChatUI'
import { useParams } from 'next/navigation'
import { useChallengeManager } from '@/lib/hooks/useChallengeManager'

export function AIChatAssistant() {
  const sessionId = useSessionId()
  const params = useParams<{ slug: string }>()
  const { currentStageIndex, challenge } = useChallengeManager()

  // Wait for everything to be initialized
  if (!sessionId || !params.slug || !challenge) return null

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <ChatUI 
        sessionId={sessionId} 
        challengeId={params.slug} 
        stageIndex={currentStageIndex ?? 0}
      />
    </div>
  )
}
