import { ChatMessagesProvider } from '@/lib/hooks/useChatMessages'

export default function ChallengeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ChatMessagesProvider>{children}</ChatMessagesProvider>
}
