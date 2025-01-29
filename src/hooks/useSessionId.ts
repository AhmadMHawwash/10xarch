import { useEffect, useState } from 'react'

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    // Generate a new session ID if one doesn't exist
    if (!sessionId) {
      setSessionId(Math.random().toString(36).substring(2, 15))
    }
  }, [sessionId])

  return sessionId
}
