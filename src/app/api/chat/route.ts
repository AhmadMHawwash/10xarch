import { NextResponse } from "next/server";
import { openai, SYSTEM_PROMPT } from "@/lib/openai";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatSession {
  messages: ChatMessage[];
}

interface ChatRequest {
  message: string;
  sessionId: string;
  history: ChatMessage[];
}

const chatSessions = new Map<string, ChatSession>();

export async function POST(req: Request) {
  try {
    const { message, sessionId, history } = (await req.json()) as ChatRequest;

    // Get or create session
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, { messages: [] });
    }

    const session = chatSessions.get(sessionId)!;
    session.messages = history || [];

    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...session.messages,
      { role: "user", content: message },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages.map(({ role, content }) => ({ role, content })),
      temperature: 0.7,
      max_tokens: 500,
    });

    const response: ChatMessage = {
      role: "assistant",
      content:
        completion.choices[0]?.message?.content ?? "No response generated.",
    };

    // Update session with the new messages
    session.messages = [
      ...session.messages,
      { role: "user", content: message },
      response,
    ];

    return NextResponse.json({ message: response.content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
