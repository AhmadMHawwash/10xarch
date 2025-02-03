import { ChatMessagesProvider } from '@/lib/hooks/useChatMessages_'

export default function ChallengeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ChatMessagesProvider>{children}</ChatMessagesProvider>
}
