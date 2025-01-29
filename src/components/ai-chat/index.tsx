'use client'

import { useSessionId } from '@/hooks/useSessionId'
import { ChatUI } from './ChatUI'

export function AIChatAssistant() {
  const sessionId = useSessionId()

  if (!sessionId) return null

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <ChatUI sessionId={sessionId} />
    </div>
  )
}
