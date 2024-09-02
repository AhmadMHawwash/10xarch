import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, X } from "lucide-react";

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }]);
      // TODO: Implement AI response logic here
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} className="rounded-full p-3">
          <MessageSquare size={24} />
        </Button>
      )}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-80 h-96 flex flex-col">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold">AI Chat</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </Button>
          </div>
          <ScrollArea className="flex-grow p-3">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${
                  msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {msg.content}
                </span>
              </div>
            ))}
          </ScrollArea>
          <div className="p-3 border-t">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow mr-2"
              />
              <Button type="submit">Send</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};