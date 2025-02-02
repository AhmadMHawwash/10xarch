'use client'

import { useSessionId } from '@/hooks/useSessionId'
import { ChatUI } from './ChatUI'
import { useParams } from 'next/navigation'

export function AIChatAssistant() {
  const sessionId = useSessionId()
  const params = useParams<{ slug: string }>()

  if (!sessionId || !params.slug) return null

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <ChatUI sessionId={sessionId} challengeId={params.slug} />
    </div>
  )
}
