/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { describe, expect, test, vi, beforeEach } from 'vitest';
import { setupTestEnvironment } from '../../__tests__/test-utils';

// Setup environment before any other imports that validate env
setupTestEnvironment();

import { TRPCError } from '@trpc/server';
import { createTestCaller } from '../../__tests__/test-utils';

describe('getUsersByIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns empty array for empty user IDs', async () => {
    const { caller } = await createTestCaller('test-user');

    const result = await caller.playgrounds.getUsersByIds({
      userIds: [],
    });

    expect(result.users).toEqual([]);
  });

  test('throws unauthorized error for unauthenticated user', async () => {
    const { caller } = await createTestCaller(null);

    await expect(
      caller.playgrounds.getUsersByIds({ userIds: ['user-1'] })
    ).rejects.toThrow(TRPCError);
  });

  // Note: Full integration testing with Clerk would be done in separate e2e tests
  // This file tests the core authentication and input validation logic
}); 