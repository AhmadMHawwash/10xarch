"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
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
}

export function ChatUI({ sessionId, challengeId }: ChatUIProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(10);
  const { getMessages, addMessage } = useChatMessages();
  const messages = getMessages(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get remaining prompts on load
  const { data: rateLimitInfo } = api.chat.getRemainingPrompts.useQuery(
    { challengeId }
  );

  // Update remaining messages when rate limit info changes
  useEffect(() => {
    if (rateLimitInfo?.remaining !== undefined) {
      setRemainingMessages(rateLimitInfo.remaining);
    }
  }, [rateLimitInfo]);

  const progressPercentage = (remainingMessages / 10) * 100;
  const isLowOnMessages = remainingMessages <= 3;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
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
      <div className="border-b bg-background p-2">
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-sm font-medium">
            {remainingMessages} / 10 prompts remaining
          </span>
          <span className="text-xs text-muted-foreground">
            Resets hourly
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2"
          indicatorColor={isLowOnMessages ? 'bg-red-500' : 'bg-green-500'}
        />
      </div>
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="space-y-4 p-4">
          {messages.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              Hi! I am your AI assistant. How can I help you with this challenge?
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
      <div className="border-t bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2 p-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={remainingMessages === 0 
              ? "Message limit reached. Please wait for hourly reset." 
              : "Type your message..."}
            disabled={isLoading || remainingMessages === 0}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || remainingMessages === 0}
            className={`${remainingMessages === 0 ? 'opacity-50' : ''}`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
