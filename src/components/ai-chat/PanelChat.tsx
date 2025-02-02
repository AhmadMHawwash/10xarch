'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, X } from 'lucide-react'
import { useSessionId } from '@/hooks/useSessionId'
import { ChatUI } from './ChatUI'
import { motion, AnimatePresence } from 'framer-motion'
import { Separator } from '@/components/ui/separator'
import { useParams } from 'next/navigation'

export function PanelChat() {
  const [isOpen, setIsOpen] = useState(false)
  const sessionId = useSessionId()
  const params = useParams<{ slug: string }>()

  if (!sessionId || !params.slug) return null

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 400 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-background border rounded-lg shadow-sm overflow-hidden mb-4"
          >
            <div className="flex items-center justify-between p-2 border-b bg-muted/50">
              <span className="text-sm font-medium">AI Assistant</span>
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

      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          {isOpen ? 'Hide AI Assistant' : 'Show AI Assistant'}
        </Button>
      </div>
      <Separator className="mb-4" />
    </div>
  )
}
