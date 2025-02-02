"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, MessageSquare, Coins, X } from "lucide-react";
import { api } from "@/trpc/react";
import { useChatMessages } from "@/lib/hooks/useChatMessages";
import { Progress } from "@/components/ui/progress";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatUIProps {
  sessionId: string;
  challengeId: string;
  onClose?: () => void;
}

export function ChatUI({ sessionId, challengeId, onClose }: ChatUIProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(10);
  const [credits, setCredits] = useState(0);
  const { getMessages, addMessage } = useChatMessages();
  const messages = getMessages(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get remaining prompts on load
  const { data: rateLimitInfo } = api.chat.getRemainingPrompts.useQuery({
    challengeId,
  });

  // Update remaining messages and credits when rate limit info changes
  useEffect(() => {
    if (rateLimitInfo) {
      setRemainingMessages(rateLimitInfo.remaining);
      setCredits(rateLimitInfo.credits);
    }
  }, [rateLimitInfo]);

  const progressPercentage = (remainingMessages / 10) * 100;
  const isLowOnMessages = remainingMessages <= 3 && credits === 0;
  const hasAvailablePrompts = remainingMessages > 0 || credits > 0;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const sendMessage = api.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      addMessage(sessionId, assistantMessage);
      setRemainingMessages(data.remainingMessages);
      setCredits(data.credits);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setIsLoading(false);
      // Display error message to user
      const errorMessage: Message = {
        role: "system",
        content: error.message,
      };
      addMessage(sessionId, errorMessage);
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    addMessage(sessionId, userMessage);
    setInput("");
    setIsLoading(true);

    sendMessage.mutate({
      message: input,
      challengeId,
      history: messages,
    });
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{remainingMessages} / 10 free prompts</span>
              {remainingMessages === 0 && (
                <span className="text-sm">(resets in 1 hour)</span>
              )}
            </div>
            {credits > 0 && (
              <div className="flex items-center gap-2 text-sm text-yellow-500">
                <Coins className="h-4 w-4" />
                <span>{credits} credits available</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Progress
            value={progressPercentage}
            indicatorColor={isLowOnMessages ? "bg-red-500" : "bg-green-500"}
            className="h-1.5 w-28"
          />
          {onClose && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="space-y-4 p-4">
          {messages.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              Hi! I am your AI assistant. How can I help you with this
              challenge?
            </div>
          )}
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.role === "system"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              hasAvailablePrompts
                ? "Type your message..."
                : "No prompts remaining. Please wait for reset or purchase credits."
            }
            disabled={isLoading || !hasAvailablePrompts}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !hasAvailablePrompts}
            size="icon"
            >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
