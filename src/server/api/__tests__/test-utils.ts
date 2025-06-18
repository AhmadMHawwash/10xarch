import { vi } from 'vitest';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { type Playground, playgrounds, users, type User } from '@/server/db/schema';
import { type MockedFunction } from 'vitest';
import { auth as clerkAuth } from '@clerk/nextjs/server';
import { appRouter, type AppRouter } from '@/server/api/root';
import type { JwtPayload } from '@clerk/types';
import crypto from 'crypto'; // For generating UUIDs
// import type { RatelimitResponse } from '@upstash/ratelimit'; // This was problematic

// Infer the return type of the auth function
export type ClerkAuthReturn = Awaited<ReturnType<typeof clerkAuth>>;

// Create a mock auth object
export const createMockAuth = (userId: string | null): ClerkAuthReturn => {
  if (!userId) {
    return null as unknown as ClerkAuthReturn;
  }
  const mockAuth = {
    userId,
    orgId: undefined,
    getToken: async () => null,
    sessionId: 'sess_test',
    session: undefined,
    actor: undefined,
    orgPermissions: [],
    orgRole: undefined,
    orgSlug: undefined,
    has: (() => false) as unknown,
    debug: () => ({}),
    isPublicRoute: false,
    isApiRoute: false,
    sessionClaims: {
      azp: '',
      exp: 0,
      iat: 0,
      iss: '',
      nbf: 0,
      sub: userId,
      sid: 'sess_test',
    } as JwtPayload,
    sessionStatus: 'active' as const,
    factorVerificationAge: [0, 0] as [number, number],
  };
  return mockAuth as unknown as NonNullable<ClerkAuthReturn>; 
};

// --- Top-level Mocks ---
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => createMockAuth('test-user')), // Default mock
}));

vi.mock('@/lib/rate-limit', () => ({
  getRateLimitIdentifier: vi.fn().mockReturnValue('test-identifier'),
  enforceRateLimit: vi.fn(), // Will be mocked in createTestCaller
  apiRequestsLimiter: {
    limit: vi.fn(), // Will be mocked in createTestCaller
  },
}));

vi.mock('@/server/api/routers/stripe', () => ({
  stripeRouter: {
    createCheckoutSession: {
      _def: {
        query: vi.fn().mockResolvedValue({
          id: 'test-session-id',
          url: 'https://test-checkout-url',
        }),
      },
    },
    verifySession: {
      _def: {
        query: vi.fn().mockResolvedValue({
          success: true,
          totalTokens: 100,
        }),
      },
    },
  },
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'test-session-id',
          url: 'https://test-checkout-url',
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'test-session-id',
          payment_status: 'paid',
          metadata: {
            userId: 'test-user',
            totalTokens: '100',
            baseTokens: '80',
            bonusTokens: '20',
          },
        }),
      },
    },
  })),
}));

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'mocked response' } }],
        }),
      },
    },
  })),
}));

vi.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'mocked response' } }],
        }),
      },
    },
  },
}));
// --- End Top-level Mocks ---


// Define more specific types for mock DB operations
export type MockDbOperations = {
  findMany: MockedFunction<any>; // Use any for flexibility now
  findFirst: MockedFunction<any>;
};

export type MockUserOperations = {
  findFirst: MockedFunction<any>;
};

// Define a more specific type for the mock DB instance
export interface MockDb {
  query: {
    playgrounds: MockDbOperations;
    users: MockUserOperations;
  };
  insert: MockedFunction<() => MockDb>; // Ensure chainable methods return MockDb
  values: MockedFunction<() => MockDb>;
  returning: MockedFunction< <T = any>() => Promise<T[]> >;
  update: MockedFunction<() => MockDb>;
  set: MockedFunction<() => MockDb>;
  where: MockedFunction<() => MockDb>;
  delete: MockedFunction<() => MockDb>;
  transaction: MockedFunction<(fn: (tx: any) => Promise<any>) => Promise<any>>;
}

// Function to create a NEW mock DB instance each time
export const createMockDb = (): MockDb => ({
  query: {
    playgrounds: { findMany: vi.fn(), findFirst: vi.fn() },
    users: { findFirst: vi.fn() },
  },
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([]), // Default empty array
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  transaction: vi.fn().mockImplementation(async (fn: (tx: any) => Promise<any>) => {
    // Create a mock transaction object that shares the same mock functions
    // This way test expectations work properly
    const mockTx = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]), // This will be overridden by test setup
          }),
        }),
      }),
    };
    
    const result = await fn(mockTx);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result; // Explicitly cast to any for mock purposes
  }),
});

// Create mock context
export const createMockContext = async () => {
  const authResult = await vi.mocked(clerkAuth)(); 
  const dbInstance = createMockDb(); // Create a fresh DB mock instance
  return {
    db: dbInstance as unknown as PostgresJsDatabase<typeof import('@/server/db/schema')>,
    headers: new Headers(),
    userId: authResult?.userId ?? null,
    // Add the raw dbInstance here if needed for direct manipulation before type casting, though usually not necessary
  };
};

export const mockClerkAuthFn = vi.mocked(clerkAuth);

// Create a mock playground
export const createMockPlayground = (userId: string): Playground => ({
  id: crypto.randomUUID(), // Use crypto.randomUUID()
  title: 'Test Playground 1',
  jsonBlob: { nodes: [], edges: [] },
  ownerType: 'user',
  ownerId: userId,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: userId,
  updatedBy: userId,
  editorIds: [],
  viewerIds: [],
  currentVisitorIds: [userId],
  isPublic: 0,
  description: null,
  tags: null,
  lastEvaluationAt: null,
  evaluationScore: null,
        evaluationFeedback: null,
      lastBackupCommitSha: null,
      backupStatus: null,
});

// Create a mock user
export const createMockUser = (userId: string): User => ({
  id: userId,
  email: `${userId}@example.com`,
  stripe_customer_id: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});


// Setup test environment - now only for environment variables
export const setupTestEnvironment = () => {
  process.env = {
    ...process.env,
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    OPENAI_API_KEY: 'test-openai-key',
    CLERK_SECRET_KEY: 'test-clerk-secret',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'test-clerk-publishable',
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
    STRIPE_SECRET_KEY: 'test-stripe-key',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    BYPASS_TOKEN: 'test-bypass-token',
    UPSTASH_REDIS_REST_URL: 'test-redis-url',
    UPSTASH_REDIS_REST_TOKEN: 'test-redis-token',
    GITHUB_BACKUP_TOKEN: 'test-github-token',
    GITHUB_BACKUP_REPO: 'test-owner/test-repo',
  };
};

// Create a test caller
export const createTestCaller = async (userId: string | null = 'test-user') => {
  const clerkAuthMock = vi.mocked(clerkAuth);
  clerkAuthMock.mockReset();
  clerkAuthMock.mockResolvedValue(createMockAuth(userId));

  const rateLimitModule = await import('@/lib/rate-limit');
  vi.mocked(rateLimitModule.apiRequestsLimiter.limit).mockReset();
  type InferredRatelimitResponse = Awaited<ReturnType<typeof rateLimitModule.apiRequestsLimiter.limit>>;
  const mockRateLimitResponse: InferredRatelimitResponse = {
    success: true, limit: 100, remaining: 99, reset: Date.now() + 3600000, pending: Promise.resolve() as any,
  };
  vi.mocked(rateLimitModule.apiRequestsLimiter.limit).mockResolvedValue(mockRateLimitResponse);
  // Simpler mocks for other rate limit functions if their return value isn't critical
  vi.mocked(rateLimitModule.enforceRateLimit).mockReset().mockResolvedValue(undefined as unknown as InferredRatelimitResponse); 
  vi.mocked(rateLimitModule.getRateLimitIdentifier).mockReset().mockReturnValue('test-identifier');

  const ctx = await createMockContext(); // This now creates a fresh db mock inside
  
  // Default mock for users.findFirst on the specific db instance for this caller
  // This is important because createMockContext creates a new db instance each time.
  // So, we need to configure the mock on ctx.db directly.
  (ctx.db.query.users.findFirst as MockedFunction<any>).mockResolvedValue(userId ? createMockUser(userId) : null);

  return {
    caller: appRouter.createCaller(ctx),
    db: ctx.db as unknown as MockDb, // Return the specific db instance for this caller
  };
}; 