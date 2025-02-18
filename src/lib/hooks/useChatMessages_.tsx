"use client";

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
  useState,
} from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  isSystemDesignRelated: boolean;
}

interface ChatMessagesContextType {
  messages: Map<string, Message[]>;
  addMessage: (sessionId: string, message: Message) => void;
  getMessages: (sessionId: string) => Message[];
  clearSession: (sessionId: string) => void;
}

const ChatMessagesContext = createContext<ChatMessagesContextType | null>(null);

export function ChatMessagesProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map());

  const addMessage = useCallback((sessionId: string, message: Message) => {
    setMessages((prev) => {
      const newMap = new Map(prev);
      const sessionMessages = newMap.get(sessionId) ?? [];
      newMap.set(sessionId, [...sessionMessages, message]);
      return newMap;
    });
  }, []);

  const getMessages = useCallback(
    (sessionId: string) => {
      return messages.get(sessionId) ?? [];
    },
    [messages],
  );

  const clearSession = useCallback((sessionId: string) => {
    setMessages((prev) => {
      const newMap = new Map(prev);
      newMap.delete(sessionId);
      return newMap;
    });
  }, []);

  return (
    <ChatMessagesContext.Provider
      value={{ messages, addMessage, getMessages, clearSession }}
    >
      {children}
    </ChatMessagesContext.Provider>
  );
}

export function useChatMessages() {
  const context = useContext(ChatMessagesContext);
  if (!context) {
    throw new Error(
      "useChatMessages must be used within a ChatMessagesProvider",
    );
  }
  return context;
}
