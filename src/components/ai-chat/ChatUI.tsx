"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCredits } from "@/hooks/useCredits";
import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { api } from "@/trpc/react";
import { Coins, MessageSquare, Send } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useChatMessages } from "@/lib/hooks/useChatMessages_";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatUIProps {
  challengeId: string;
  stageIndex: number;
}

interface WhiteboardConfigs {
  "API definitions and flows"?: Array<{
    name: string;
    definition: string;
    flow: string;
  }>;
  "Capacity estimations"?: {
    Traffic?: string;
    Storage?: string;
    Bandwidth?: string;
    Memory?: string;
  };
  "functional requirements"?: string;
  "non-functional requirements"?: string;
}

export function ChatUI({ challengeId, stageIndex = 0 }: ChatUIProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(10);
  const { balance: credits, refetch: refetchCredits } = useCredits();
  const { getMessages, addMessage } = useChatMessages();
  const [mounted, setMounted] = useState(false);
  
  // Create a stable chat session ID that persists across component mounts
  const chatSessionId = useMemo(() => `chat:${challengeId}`, [challengeId]);
  
  // Only get messages after component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const messages = useMemo(() => 
    mounted ? getMessages(chatSessionId) : [],
    [mounted, getMessages, chatSessionId]
  );
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { nodes } = useSystemDesigner();

  // Get remaining prompts on load
  const { data: rateLimitInfo } = api.chat.getRemainingPrompts.useQuery({
    challengeId,
  });

  // Update remaining messages when rate limit info changes
  useEffect(() => {
    if (rateLimitInfo) {
      setRemainingMessages(rateLimitInfo.remaining);
    }
  }, [rateLimitInfo]);

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
    onSuccess: async (data) => {
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      addMessage(chatSessionId, assistantMessage);
      setRemainingMessages(data.remainingMessages);
      // Refetch credits to update the navbar
      await refetchCredits();
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
      addMessage(chatSessionId, errorMessage);
    },
  });

  // Extract solution data
  const extractSolutionData = () => {
    const whiteboardNode = nodes.find((node) => node.type === "Whiteboard");
    const configs = whiteboardNode?.data.configs as WhiteboardConfigs | undefined ?? {};

    const cleanedNodes = nodes
      .filter((node) => node.type !== "Whiteboard")
      .map((node) => ({
        type: node.data.name,
        id: node.id,
        configs: node.data.configs,
      }));

    return {
      components: cleanedNodes,
      apiDefinitions: configs["API definitions and flows"] ?? [],
      capacityEstimations: {
        traffic: configs["Capacity estimations"]?.Traffic ?? "",
        storage: configs["Capacity estimations"]?.Storage ?? "",
        bandwidth: configs["Capacity estimations"]?.Bandwidth ?? "",
        memory: configs["Capacity estimations"]?.Memory ?? "",
      },
      functionalRequirements: configs["functional requirements"] ?? "",
      nonFunctionalRequirements: configs["non-functional requirements"] ?? "",
    };
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    addMessage(chatSessionId, userMessage);
    setInput("");
    setIsLoading(true);

    sendMessage.mutate({
      message: input,
      challengeId,
      stageIndex: stageIndex ?? 0,
      history: messages,
      solution: extractSolutionData(),
    });
  }

  const renderMessage = (message: Message) => {
    const isUser = message.role === "user";
    const isSystem = message.role === "system";

    return (
      <div
        className={cn(
          "flex",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-[80%] rounded-lg px-4 py-2",
            isUser
              ? "bg-primary text-primary-foreground"
              : isSystem
                ? "bg-destructive text-destructive-foreground"
                : "bg-muted"
          )}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <ReactMarkdown
              className={cn(
                "prose prose-sm max-w-none",
                isSystem
                  ? "prose-invert"
                  : "prose-neutral dark:prose-invert",
                "break-words [&_p:last-child]:mb-0",
                "[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5",
                "[&_pre]:my-1 [&_code]:my-1",
                "[&_pre]:bg-secondary/50 [&_pre]:p-2 [&_pre]:rounded",
                "[&_code]:bg-secondary/50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded",
                "[&_a]:text-primary [&_a:hover]:underline",
                "[&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:px-2 [&_th]:px-2",
                "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/20 [&_blockquote]:pl-4 [&_blockquote]:italic"
              )}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col">
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="space-y-4 p-4">
          {messages.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              Hi! I am your AI assistant. How can I help you with this
              challenge?
            </div>
          )}
          {messages.map((message, i) => (
            <div key={i}>
              {renderMessage(message)}
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
      <div className="border-t border-border/40 bg-background/95">
        <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{remainingMessages}/10 free</span>
            {remainingMessages === 0 && <span>(resets in 1h)</span>}
          </div>
          {credits > 0 && (
            <div className="flex items-center gap-2 text-yellow-500">
              <Coins className="h-3.5 w-3.5" />
              <span>{credits} credits</span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              hasAvailablePrompts
                ? "Type your message..."
                : "No prompts remaining. Please wait for reset or purchase credits."
            }
            disabled={isLoading || !hasAvailablePrompts}
            className="flex-1 bg-muted/50"
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="secondary"
            disabled={isLoading || !hasAvailablePrompts}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
