import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { openai, SYSTEM_PROMPT } from '@/lib/openai'

const chatSessions = new Map<
  string,
  {
    messages: {
      role: 'user' | 'assistant' | 'system'
      content: string
    }[]
  }
>()

export const chatRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(
      z.object({
        message: z.string(),
        sessionId: z.string(),
        history: z.array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const { message, sessionId, history } = input

      // Get or create session
      if (!chatSessions.has(sessionId)) {
        chatSessions.set(sessionId, { messages: [] })
      }

      const session = chatSessions.get(sessionId)!
      session.messages = history || []

      // Prepare messages for OpenAI
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...session.messages,
        { role: 'user' as const, content: message },
      ]

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages.map(({ role, content }) => ({ role, content })),
        temperature: 0.1,
        max_tokens: 100,
      })

      const response = {
        role: 'assistant' as const,
        content: completion.choices[0]?.message?.content ?? 'No response generated.',
      }

      // Update session with the new messages
      session.messages = [
        ...session.messages,
        { role: 'user', content: message },
        response,
      ]

      return { message: response.content }
    }),
})
