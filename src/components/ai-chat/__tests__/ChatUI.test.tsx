import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Define the expected types for our mocks that match the actual implementations
interface CreditsInterface {
  balance: number;
  isLoading: boolean;
  hasValidData: boolean;
  error: null;
  refetch: () => Promise<void>;
  isUpdating: boolean;
  hasLowCredits: boolean;
}

interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  isSystemDesignRelated: boolean;
}

type MessagesMap = Map<string, Message[]>;

// Define the expected response structure from chat API
interface ChatResponseSuccess {
  message: string;
  remainingMessages: number;
  credits?: number;
  isSystemDesignRelated: boolean;
}

interface ChatMutationOptions {
  onSuccess?: (data: ChatResponseSuccess) => void;
  onError?: (error: Error) => void;
}

interface ChatMessagesInterface {
  messages: MessagesMap;
  addMessage: (sessionId: string, message: Message) => void;
  resetMessages: () => void;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
  getLastUserMessage: () => string;
  getMessages: (sessionId: string) => Message[];
  clearSession: (sessionId: string) => void;
}

// Mock dependencies
vi.mock("@/hooks/useCredits", () => ({
  useCredits: vi.fn().mockReturnValue({
    balance: 100,
    isLoading: false,
    hasValidData: true,
    error: null,
    refetch: vi.fn().mockResolvedValue(undefined),
    isUpdating: false,
    hasLowCredits: false,
  } as CreditsInterface),
}));

vi.mock("@/lib/hooks/useChatMessages_", () => {
  // Create a mock Map for messages inside the mock function
  const messagesMap = new Map<string, Message[]>();
  messagesMap.set("chat:undefined", [
    {
      id: "1",
      content:
        "Hi! I am your AI assistant. How can I help you with this challenge?",
      role: "assistant",
      isSystemDesignRelated: true,
    },
  ]);

  return {
    useChatMessages: vi.fn().mockReturnValue({
      messages: messagesMap,
      addMessage: vi.fn(),
      resetMessages: vi.fn(),
      setIsLoading: vi.fn(),
      isLoading: false,
      getLastUserMessage: vi.fn().mockReturnValue("Hello AI"),
      getMessages: vi.fn().mockReturnValue([]),
      clearSession: vi.fn(),
    } as ChatMessagesInterface),
  };
});

vi.mock("@/lib/hooks/_useSystemDesigner", () => ({
  useSystemDesigner: vi.fn().mockReturnValue({
    open: false,
    setOpen: vi.fn(),
    nodes: [],
  }),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: vi.fn().mockReturnValue({
    userId: "test-user",
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn().mockReturnValue({
    invalidateQueries: vi.fn(),
    removeQueries: vi.fn(),
  }),
}));

// Store success/error handlers for tests
let onSuccessCallback: ((data: ChatResponseSuccess) => void) | null = null;
let onErrorCallback: ((error: Error) => void) | null = null;

// Define a mock refetch function for the remaining prompts query
const mockRefetchMessages = vi.fn().mockResolvedValue(undefined);

// Mock the trpc API
vi.mock("@/trpc/react", () => ({
  api: {
    chat: {
      getRemainingPrompts: {
        useQuery: () => ({
          data: { remaining: 3, reset: 0, limit: 3, credits: 100 },
          refetch: mockRefetchMessages,
        }),
      },
      sendMessage: {
        useMutation: (options?: ChatMutationOptions) => {
          // Store the callbacks for later use in tests
          onSuccessCallback = options?.onSuccess ?? null;
          onErrorCallback = options?.onError ?? null;

          return {
            mutate: vi.fn(),
            isLoading: false,
            error: null,
          };
        },
      },
    },
  },
}));

// Import the component
import { ChatUI } from "../ChatUI";
// Import mocked dependencies to access their methods
import { useCredits } from "@/hooks/useCredits";
import { useChatMessages } from "@/lib/hooks/useChatMessages_";

// Create a function to get a fresh mock messages map for tests
const createTestMessagesMap = (): MessagesMap => {
  const map = new Map<string, Message[]>();
  map.set("chat:undefined", [
    {
      id: "1",
      content:
        "Hi! I am your AI assistant. How can I help you with this challenge?",
      role: "assistant",
      isSystemDesignRelated: true,
    },
  ]);
  return map;
};

// Define session ID for consistent testing
const CHAT_SESSION_ID = "chat:undefined";

describe("ChatUI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset callbacks
    onSuccessCallback = null;
    onErrorCallback = null;
  });

  it("should render correctly with credits", () => {
    render(<ChatUI />);

    expect(screen.getByText(/Hi! I am your AI assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/100 credits/i)).toBeInTheDocument();
  });

  it("should call refetchCredits when a message is sent and credits are returned", async () => {
    // Set up mock for refetchCredits that we can track
    const mockRefetch = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useCredits).mockReturnValue({
      balance: 100,
      isLoading: false,
      hasValidData: true,
      error: null,
      refetch: mockRefetch,
      isUpdating: false,
      hasLowCredits: false,
    } as CreditsInterface);

    render(<ChatUI />);

    // Type and submit a message
    const input = screen.getByPlaceholderText("Type your message...");
    const submitButton = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "Hello AI" } });
    fireEvent.click(submitButton);

    // Simulate API response with onSuccess callback
    await act(async () => {
      if (onSuccessCallback) {
        onSuccessCallback({
          message: "Test response",
          remainingMessages: 2,
          credits: 95, // Include credits in the response
          isSystemDesignRelated: true,
        });
      }
    });

    // Verify refetchCredits was called
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("should not call refetchCredits when credits are undefined in the response", async () => {
    // Set up mock for refetchCredits that we can track
    const mockRefetch = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useCredits).mockReturnValue({
      balance: 100,
      isLoading: false,
      hasValidData: true,
      error: null,
      refetch: mockRefetch,
      isUpdating: false,
      hasLowCredits: false,
    } as CreditsInterface);

    render(<ChatUI />);

    // Type and submit a message
    const input = screen.getByPlaceholderText("Type your message...");
    const submitButton = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "Hello AI" } });
    fireEvent.click(submitButton);

    // Simulate API response without credits in the response
    await act(async () => {
      if (onSuccessCallback) {
        onSuccessCallback({
          message: "Test response",
          remainingMessages: 2,
          isSystemDesignRelated: true,
          // No credits property
        });
      }
    });

    // Verify refetchCredits was not called
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it("should call both refetchCredits and refetchRemainingMessages when credits are in the response", async () => {
    // Set up mock for refetchCredits that we can track
    const mockRefetch = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useCredits).mockReturnValue({
      balance: 100,
      isLoading: false,
      hasValidData: true,
      error: null,
      refetch: mockRefetch,
      isUpdating: false,
      hasLowCredits: false,
    } as CreditsInterface);

    // Reset the mockRefetchMessages to track new calls
    mockRefetchMessages.mockClear();

    render(<ChatUI />);

    // Type and submit a message
    const input = screen.getByPlaceholderText("Type your message...");
    const submitButton = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "Hello AI" } });
    fireEvent.click(submitButton);

    // Simulate API response with credits in the response
    await act(async () => {
      if (onSuccessCallback) {
        onSuccessCallback({
          message: "Test response",
          remainingMessages: 2,
          credits: 95, // Include credits in the response
          isSystemDesignRelated: true,
        });
      }
    });

    // Verify credits refetch was called
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    
    // Verify that refetchRemainingMessages was also called
    expect(mockRefetchMessages).toHaveBeenCalled();
  });

  it("should handle error responses gracefully", async () => {
    // Set up mock for addMessage that we can track
    const mockAddMessage = vi.fn();

    // Use custom messages map for this test
    const messagesMap = createTestMessagesMap();

    vi.mocked(useChatMessages).mockReturnValue({
      messages: messagesMap,
      addMessage: mockAddMessage,
      resetMessages: vi.fn(),
      setIsLoading: vi.fn(),
      isLoading: false,
      getLastUserMessage: vi.fn().mockReturnValue("Hello AI"),
      getMessages: vi.fn().mockReturnValue([]),
      clearSession: vi.fn(),
    } as ChatMessagesInterface);

    render(<ChatUI />);

    // Type and submit a message
    const input = screen.getByPlaceholderText("Type your message...");
    const submitButton = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "Hello AI" } });
    fireEvent.click(submitButton);

    // Clear previous calls before simulating error
    mockAddMessage.mockClear();

    // Create the expected error message for strong typing
    const expectedErrorMessage: Message = {
      role: "system",
      content: "Test error", // We'll check if the actual message contains this string
      isSystemDesignRelated: false,
    };

    // Simulate API error response
    await act(async () => {
      if (onErrorCallback) {
        onErrorCallback(new Error("Test error"));
      }
    });

    // Verify error message was added with proper typing
    expect(mockAddMessage).toHaveBeenCalledWith(
      CHAT_SESSION_ID,
      expect.objectContaining({
        role: expectedErrorMessage.role,
        isSystemDesignRelated: expectedErrorMessage.isSystemDesignRelated,
      }),
    );

    // Check that the content contains our error text
    const calls = mockAddMessage.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    // Ensure we have calls and the second parameter exists before accessing it
    if (calls.length > 0 && calls[0]?.[1]) {
      const actualMessage = calls[0][1] as Message;
      expect(actualMessage.content).toContain("Test error");
    }
  });
});
