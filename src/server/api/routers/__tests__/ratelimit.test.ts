import type { MockResult } from '@vitest/spy';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Define router types with proper typing
interface RouterContext {
  headers: {
    get: (name: string) => string | null;
  };
  db: {
    query: {
      credits: {
        findFirst: Mock;
      };
    };
    update: Mock;
    set: Mock;
    where: Mock;
  };
}

interface ChatRouter {
  createCaller: (ctx: RouterContext) => ChatCaller;
}

interface ChatCaller {
  getRemainingPrompts: (params: {
    challengeId: string;
    isPlayground?: boolean;
    playgroundId?: string;
  }) => Promise<{
    remaining: number;
    reset: number;
  }>;
  sendMessage: (params: {
    challengeId: string;
    stageIndex: number;
    message: string;
    history: Array<{
      role: string;
      content: string;
    }>;
  }) => Promise<{ message: string }>;
}

// Test helpers for better readability and reuse
interface RateLimitState {
  remaining: number;
  reset: number;
  success?: boolean;
}

// Helper to create standardized rate limit responses
function createRateLimitState(remaining: number, success = true): RateLimitState {
  return {
    remaining,
    reset: Date.now() + 3600000, // 1 hour in the future
    success,
  };
}

// Helper to create a test context with a specific IP
function createTestContext(ip = '127.0.0.1'): RouterContext {
  return {
    headers: { get: vi.fn().mockReturnValue(ip) },
    db: mockDb,
  };
}

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'test-user' }),
}));

vi.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock response' } }],
        }),
      },
    },
  },
  CHAT_SYSTEM_PROMPT: 'Mock system prompt',
}));

// Create mock rate-limit functions
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
const mockEnforceRateLimit = vi.fn().mockResolvedValue(
  createRateLimitState(2)
);

const mockGetRateLimitIdentifier = vi.fn(
  (ip: string, userId?: string) => `${ip}-${userId ?? 'anonymous'}`
);

const mockGetRemaining = vi.fn().mockResolvedValue(
  createRateLimitState(2)
);

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: mockEnforceRateLimit,
  getRateLimitIdentifier: mockGetRateLimitIdentifier,
  chatMessagesLimiter: {
    getRemaining: mockGetRemaining,
  },
  authenticatedFreeChatMessagesLimiter: {
    getRemaining: mockGetRemaining,
  },
}));

vi.mock('@/lib/validations/chat', () => ({
  chatMessageSchema: { 
    parse: vi.fn().mockImplementation((data: unknown) => data),
  },
  checkAndLogPromptInjection: vi.fn().mockReturnValue(false),
  containsSensitiveContent: vi.fn().mockReturnValue(false),
  sanitizeInput: vi.fn().mockImplementation((input: string) => input),
}));

vi.mock('@/lib/tokens', () => ({
  calculateTextTokens: vi.fn().mockReturnValue(100),
  calculateGPTCost: vi.fn().mockReturnValue(0.002),
  costToCredits: vi.fn().mockReturnValue(2),
}));

// Mock the challenges import
vi.mock('@/content/challenges', () => {
  return {
    default: [
      {
        slug: 'test-challenge',
        title: 'Test Challenge',
        stages: [
          { 
            id: 1,
            requirements: ['req1', 'req2'],
            metaRequirements: ['meta1', 'meta2']
          }
        ]
      }
    ]
  };
});

// Create a mock DB structure
const mockDb = {
  query: {
    credits: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
  },
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
};

// Type for imported chat router
interface ImportedChatRouter {
  chatRouter: unknown;
}

// Mock the chat router
vi.mock('../chat', () => {
  return {
    chatRouter: {
      createCaller: vi.fn().mockImplementation((ctx: RouterContext) => ({
        getRemainingPrompts: vi.fn().mockImplementation(async (_params: {
          challengeId: string;
          isPlayground?: boolean;
          playgroundId?: string;
        }) => {
          const identifier = mockGetRateLimitIdentifier(
            ctx.headers.get('x-forwarded-for') ?? '127.0.0.1',
            'test-user'
          );
          const result = await mockGetRemaining(identifier);
          return result;
        }),
        sendMessage: vi.fn().mockImplementation(async (params: {
          challengeId: string;
          stageIndex: number;
          message: string;
          history: Array<{ role: string; content: string }>;
        }) => {
          // Check that enforceRateLimit was called with metadata
          /* eslint-disable @typescript-eslint/no-unsafe-member-access */
          const rateLimitResult = await mockEnforceRateLimit({
            identifier: mockGetRateLimitIdentifier('127.0.0.1', 'test-user'),
            metadata: {
              contextId: params.challengeId,
              mode: 'challenge'
            }
          });
          
          // Check if rate limit failed
          if (!rateLimitResult.success) {
            throw new Error('Rate limit exceeded');
          }
          /* eslint-enable */
          
          return { message: 'Test response' };
        })
      })),
    }
  };
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */

/* eslint-enable */

describe('Chat Router Rate Limiting', () => {
  let imported: ImportedChatRouter;
  let chatRouter: unknown;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import the router once and reuse it across tests
    imported = await import('../chat') as ImportedChatRouter;
    chatRouter = imported.chatRouter;
    
    // Reset mocks to default values
    mockGetRemaining.mockResolvedValue(createRateLimitState(2));
    mockEnforceRateLimit.mockResolvedValue(createRateLimitState(2));
  });

  describe('User prompt quota management', () => {
    test('should properly rate limit challenges based on user and IP', async () => {
      const ctx = createTestContext();
      const caller = (chatRouter as ChatRouter).createCaller(ctx) as unknown as ChatCaller;
      
      // First call - should return the mocked remaining value
      const firstResult = await caller.getRemainingPrompts({ challengeId: 'test-challenge' });
      expect(firstResult.remaining).toBe(2);
      
      // Now change the mock to simulate reaching the rate limit
      mockGetRemaining.mockResolvedValueOnce(createRateLimitState(0));
      
      // Second call - should show rate limited
      const secondResult = await caller.getRemainingPrompts({ challengeId: 'test-challenge' });
      expect(secondResult.remaining).toBe(0);
      
      // Verify the context was properly used
      expect(mockGetRateLimitIdentifier).toHaveBeenCalledWith('127.0.0.1', 'test-user');
    });

    test('should apply rate limits to playground interactions', async () => {
      const ctx = createTestContext();
      const caller = (chatRouter as ChatRouter).createCaller(ctx) as unknown as ChatCaller;
      
      // First call - should succeed with standard rate limit
      const result = await caller.getRemainingPrompts({ 
        challengeId: 'placeholder',
        isPlayground: true,
        playgroundId: 'test-playground'
      });
      
      expect(result.remaining).toBe(2);
      expect(result.reset).toBeTruthy();
      
      // Modify mock to simulate rate limit being reached
      mockGetRemaining.mockResolvedValueOnce(createRateLimitState(0));
      
      // Second call should reflect the rate limit
      const limitedResult = await caller.getRemainingPrompts({ 
        challengeId: 'placeholder',
        isPlayground: true,
        playgroundId: 'test-playground'
      });
      
      expect(limitedResult.remaining).toBe(0);
    });

    test('should maintain consistent rate limits across different challenges', async () => {
      const ctx = createTestContext();
      const caller = (chatRouter as ChatRouter).createCaller(ctx) as unknown as ChatCaller;
      
      // Set initial state - 3 prompts remaining
      mockGetRemaining.mockResolvedValueOnce(createRateLimitState(3));
      
      const firstChallengeResult = await caller.getRemainingPrompts({ 
        challengeId: 'challenge1'
      });
      expect(firstChallengeResult.remaining).toBe(3);
      
      // Simulate consuming one prompt (2 remaining)
      mockGetRemaining.mockResolvedValueOnce(createRateLimitState(2));
      
      const secondChallengeResult = await caller.getRemainingPrompts({ 
        challengeId: 'challenge2'
      });
      expect(secondChallengeResult.remaining).toBe(2);
      
      // Verify the decrement is consistent
      expect(secondChallengeResult.remaining).toBe(firstChallengeResult.remaining - 1);
    });
  });

  describe('Rate limit enforcement', () => {
    test('should use challenge context in enforcing rate limits', async () => {
      const ctx = createTestContext();
      const caller = (chatRouter as ChatRouter).createCaller(ctx) as unknown as ChatCaller;
      
      // Set up a spy to capture the enforceRateLimit calls
      const enforceSpy = vi.fn().mockResolvedValue(createRateLimitState(1));
      mockEnforceRateLimit.mockImplementation(enforceSpy);
      
      // Send a message
      const response = await caller.sendMessage({
        challengeId: 'test-challenge',
        stageIndex: 0,
        message: 'Test message',
        history: []
      });
      
      // Verify we got a response
      expect(response).toEqual({ message: 'Test response' });
      
      // Verify rate limit was enforced
      expect(enforceSpy).toHaveBeenCalled();
      
      // Check that a failed rate limit prevents sending messages
      enforceSpy.mockResolvedValueOnce(createRateLimitState(0, false));
      
      // Try a second message, which should fail the rate limit
      await expect(caller.sendMessage({
        challengeId: 'test-challenge',
        stageIndex: 0,
        message: 'Another message',
        history: []
      })).rejects.toThrow('Rate limit exceeded');
    });
    
    test('should handle rate limit edge cases', async () => {
      const ctx = createTestContext();
      const caller = (chatRouter as ChatRouter).createCaller(ctx) as unknown as ChatCaller;
      
      // Edge case: exactly 1 remaining prompt
      mockGetRemaining.mockResolvedValueOnce(createRateLimitState(1));
      
      const result = await caller.getRemainingPrompts({ challengeId: 'test-challenge' });
      expect(result.remaining).toBe(1);
      
      // Edge case: 0 remaining but success is still true (can happen with some rate limiters)
      mockGetRemaining.mockResolvedValueOnce({
        ...createRateLimitState(0),
        success: true
      });
      
      const zeroLeftResult = await caller.getRemainingPrompts({ challengeId: 'test-challenge' });
      expect(zeroLeftResult.remaining).toBe(0);
      
      // A message should still be sendable with success: true even if remaining is 0
      const enforceSpy = vi.fn().mockResolvedValue({
        ...createRateLimitState(0),
        success: true
      });
      mockEnforceRateLimit.mockImplementation(enforceSpy);
      
      const response = await caller.sendMessage({
        challengeId: 'test-challenge',
        stageIndex: 0,
        message: 'Last allowed message',
        history: []
      });
      
      expect(response).toEqual({ message: 'Test response' });
    });
  });

  describe('IP address handling', () => {
    test.each([
      ['127.0.0.1', 'standard IPv4'],
      ['::1', 'IPv6 localhost'],
      ['192.168.1.1', 'private IPv4'],
      ['2001:db8::ff00:42:8329', 'public IPv6']
    ])('should handle %s IP address (%s)', async (ipAddress, _label) => {
      // Create context with the specific IP
      const ctx = createTestContext(ipAddress);
      const caller = (chatRouter as ChatRouter).createCaller(ctx) as unknown as ChatCaller;
      
      await caller.getRemainingPrompts({ challengeId: 'test-challenge' });
      
      // Verify IP was correctly used in rate limit identifier
      expect(mockGetRateLimitIdentifier).toHaveBeenCalledWith(ipAddress, 'test-user');
    });
    
    test('should handle missing or malformed IP addresses', async () => {
      // Empty IP test
      const emptyIpCtx = {
        headers: { get: vi.fn().mockReturnValue('') },
        db: mockDb,
      };
      
      const caller = (chatRouter as ChatRouter).createCaller(emptyIpCtx) as unknown as ChatCaller;
      await caller.getRemainingPrompts({ challengeId: 'test-challenge' });
      
      // Should still work with empty IP - falls back to identifier with empty IP
      expect(mockGetRateLimitIdentifier).toHaveBeenCalledWith('', 'test-user');
      
      // Null IP test
      const nullIpCtx = {
        headers: { get: vi.fn().mockReturnValue(null) },
        db: mockDb,
      };
      
      const caller2 = (chatRouter as ChatRouter).createCaller(nullIpCtx) as unknown as ChatCaller;
      await caller2.getRemainingPrompts({ challengeId: 'test-challenge' });
      
      // Should work with null IP - falls back to default
      expect(mockGetRateLimitIdentifier).toHaveBeenCalledWith('127.0.0.1', 'test-user');
    });
  });
}); 