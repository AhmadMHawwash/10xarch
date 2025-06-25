/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { addTokensToAccount, handleTierChangeTokens, deductTokensFromAccount } from '../tokens-server';

// Mock the database - move mockDb inside the factory function to avoid hoisting issues
vi.mock('@/server/db', () => {
  const mockDb = {
    query: {
      tokenBalances: {
        findFirst: vi.fn(),
      }
    },
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    transaction: vi.fn(),
  };
  
  return {
    db: mockDb
  };
});

vi.mock('@/server/db/schema', () => ({
  tokenBalances: { 
    ownerType: 'tokenBalances.ownerType',
    ownerId: 'tokenBalances.ownerId',
    expiringTokens: 'tokenBalances.expiringTokens',
    nonexpiringTokens: 'tokenBalances.nonexpiringTokens'
  },
  tokenLedger: { 
    ownerId: 'tokenLedger.ownerId' 
  }
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  and: vi.fn((...conditions) => ({ type: 'and', conditions }))
}));

// Mock tokens utility
vi.mock('@/lib/tokens', () => ({
  getSubscriptionTokens: vi.fn((tier: string) => {
    const tierMap: Record<string, number> = {
      'pro': 15000,
      'premium': 25000,
      'free': 0
    };
    return tierMap[tier] ?? 0;
  })
}));

// Test constants
const TEST_USER_ID = 'user_test123';
const TEST_ORG_ID = 'org_test123';

// Get access to mockDb for the tests
let mockDb: any;

describe('Token Server Utilities', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import the mocked db to get access to mockDb
    const { db } = await import('@/server/db');
    mockDb = db;
    
    // Reset transaction mock
    mockDb.transaction.mockImplementation(async (callback: any) => {
      const mockTx = {
        query: {
          tokenBalances: {
            findFirst: vi.fn(),
          }
        },
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };
      return await callback(mockTx);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('addTokensToAccount', () => {
    describe('User Account Token Addition', () => {
      test('should add non-expiring tokens to new user account', async () => {
        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(null), // No existing balance
              }
            },
            insert: vi.fn().mockImplementation((_table: any) => ({
              values: vi.fn().mockReturnValue(mockTx)
            })),
            values: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
          };
          return await callback(mockTx);
        });

        const result = await addTokensToAccount({
          userId: TEST_USER_ID,
          baseTokens: 1000,
          bonusTokens: 200,
          isSubscription: false
        });

        expect(result).toBe(1200); // baseTokens + bonusTokens
        expect(mockDb.transaction).toHaveBeenCalledTimes(1);
      });

      test('should add non-expiring tokens to existing user account', async () => {
        const existingBalance = {
          expiringTokens: 5000,
          nonexpiringTokens: 3000,
          expiringTokensExpiry: new Date()
        };

        let updateValues: any;
        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(existingBalance),
              }
            },
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            update: vi.fn().mockImplementation((_table: any) => ({
              set: vi.fn().mockImplementation((values: any) => {
                updateValues = values;
                return {
                  where: vi.fn().mockReturnThis()
                };
              })
            })),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
          };
          return await callback(mockTx);
        });

        const result = await addTokensToAccount({
          userId: TEST_USER_ID,
          baseTokens: 1000,
          bonusTokens: 500,
          isSubscription: false
        });

        expect(result).toBe(1500);
        expect(updateValues?.nonexpiringTokens).toBe(4500); // 3000 + 1500
      });

      test('should add expiring tokens for subscription', async () => {
        let insertedTokenBalance: any;

        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(null),
              }
            },
            insert: vi.fn().mockImplementation((_table: any) => ({
              values: vi.fn().mockImplementation((values: any) => {
                if (values.expiringTokens !== undefined) {
                  insertedTokenBalance = values;
                }
                return mockTx;
              })
            })),
          };
          return await callback(mockTx);
        });

        const result = await addTokensToAccount({
          userId: TEST_USER_ID,
          baseTokens: 15000,
          isSubscription: true
        });

        expect(result).toBe(15000);
        expect(insertedTokenBalance?.expiringTokens).toBe(15000);
        expect(insertedTokenBalance?.expiringTokensExpiry).toBeInstanceOf(Date);
      });

      test('should handle organization accounts', async () => {
        let insertedTokenBalance: any;

        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(null),
              }
            },
            insert: vi.fn().mockImplementation((_table: any) => ({
              values: vi.fn().mockImplementation((values: any) => {
                if (values.ownerType === 'org') {
                  insertedTokenBalance = values;
                }
                return mockTx;
              })
            })),
          };
          return await callback(mockTx);
        });

        const result = await addTokensToAccount({
          userId: TEST_USER_ID,
          orgId: TEST_ORG_ID,
          baseTokens: 5000,
          isSubscription: false
        });

        expect(result).toBe(5000);
        expect(insertedTokenBalance?.ownerType).toBe('org');
        expect(insertedTokenBalance?.ownerId).toBe(TEST_ORG_ID);
      });

      test('should handle transaction failures gracefully', async () => {
        mockDb.transaction.mockRejectedValue(new Error('Database transaction failed'));

        await expect(addTokensToAccount({
          userId: TEST_USER_ID,
          baseTokens: 1000,
        })).rejects.toThrow('Database transaction failed');
      });
    });

    describe('Subscription Token Management', () => {
      test('should set correct expiry date for subscription tokens', async () => {
        let tokenExpiry: Date;

        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(null),
              }
            },
            insert: vi.fn().mockImplementation((_table: any) => ({
              values: vi.fn().mockImplementation((values: any) => {
                if (values.expiringTokensExpiry) {
                  tokenExpiry = values.expiringTokensExpiry;
                }
                return mockTx;
              })
            })),
          };
          return await callback(mockTx);
        });

        await addTokensToAccount({
          userId: TEST_USER_ID,
          baseTokens: 15000,
          isSubscription: true
        });

        // Should be approximately 30 days from now
        const expectedExpiry = new Date();
        expectedExpiry.setDate(expectedExpiry.getDate() + 30);
        
        const timeDiff = Math.abs(tokenExpiry!.getTime() - expectedExpiry.getTime());
        expect(timeDiff).toBeLessThan(60000); // Within 1 minute
      });

      test('should replace existing subscription tokens with fresh monthly allowance', async () => {
        const existingBalance = {
          expiringTokens: 10000,
          nonexpiringTokens: 2000,
          expiringTokensExpiry: new Date(Date.now() + 15 * 24 * 3600 * 1000) // 15 days from now
        };

        let updateValues: any;
        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(existingBalance),
              }
            },
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            update: vi.fn().mockImplementation((_table: any) => ({
              set: vi.fn().mockImplementation((values: any) => {
                updateValues = values;
                return {
                  where: vi.fn().mockReturnThis()
                };
              })
            })),
          };
          return await callback(mockTx);
        });

        const result = await addTokensToAccount({
          userId: TEST_USER_ID,
          baseTokens: 15000,
          isSubscription: true
        });

        expect(result).toBe(15000);
        expect(updateValues?.expiringTokens).toBe(15000); // Fresh monthly allowance replaces old tokens
        // Should update the expiry to 30 days from now
        expect(updateValues?.expiringTokensExpiry).toBeInstanceOf(Date);
      });
    });
  });

  describe('handleTierChangeTokens', () => {
    describe('Tier Upgrade Scenarios', () => {
      test('should handle Pro to Premium upgrade with partial consumption', async () => {
        const existingBalance = {
          expiringTokens: 10000, // 5000 tokens consumed from 15000 Pro allowance
          nonexpiringTokens: 1000,
          expiringTokensExpiry: new Date(Date.now() + 20 * 24 * 3600 * 1000)
        };

        let updateValues: any;
        let ledgerEntry: any;

        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(existingBalance),
              }
            },
            insert: vi.fn().mockImplementation((_table: any) => ({
              values: vi.fn().mockImplementation((values: any) => {
                if (values.reason?.includes('tier_upgrade')) {
                  ledgerEntry = values;
                }
                return mockTx;
              })
            })),
            update: vi.fn().mockImplementation((_table: any) => ({
              set: vi.fn().mockImplementation((values: any) => {
                updateValues = values;
                return {
                  where: vi.fn().mockReturnThis()
                };
              })
            })),
          };
          return await callback(mockTx);
        });

        const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        const result = await handleTierChangeTokens({
          ownerType: 'user',
          ownerId: TEST_USER_ID,
          oldTier: 'pro',
          newTier: 'premium',
          subscriptionEndDate
        });

        // Consumed: 15000 - 10000 = 5000
        // New balance: 25000 - 5000 = 20000
        expect(result.consumedTokens).toBe(5000);
        expect(result.newTokenBalance).toBe(20000);
        expect(result.isUpgrade).toBe(true);
        expect(updateValues?.expiringTokens).toBe(20000);
      });

      test('should handle Premium to Pro downgrade', async () => {
        const existingBalance = {
          expiringTokens: 15000, // 10000 tokens consumed from 25000 Premium allowance
          nonexpiringTokens: 500,
          expiringTokensExpiry: new Date(Date.now() + 20 * 24 * 3600 * 1000)
        };

        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(existingBalance),
              }
            },
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
          };
          return await callback(mockTx);
        });

        const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        const result = await handleTierChangeTokens({
          ownerType: 'user',
          ownerId: TEST_USER_ID,
          oldTier: 'premium',
          newTier: 'pro',
          subscriptionEndDate
        });

        // Consumed: 25000 - 15000 = 10000
        // New balance: max(0, 15000 - 10000) = 5000
        expect(result.consumedTokens).toBe(10000);
        expect(result.newTokenBalance).toBe(5000);
        expect(result.isUpgrade).toBe(false);
      });

      test('should handle over-consumption scenario', async () => {
        const existingBalance = {
          expiringTokens: 0, // User consumed all 15000 Pro tokens
          nonexpiringTokens: 2000,
          expiringTokensExpiry: new Date(Date.now() + 20 * 24 * 3600 * 1000)
        };

        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(existingBalance),
              }
            },
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
          };
          return await callback(mockTx);
        });

        const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        const result = await handleTierChangeTokens({
          ownerType: 'user',
          ownerId: TEST_USER_ID,
          oldTier: 'pro',
          newTier: 'premium',
          subscriptionEndDate
        });

        // Consumed: 15000 - 0 = 15000
        // New balance: max(0, 25000 - 15000) = 10000
        expect(result.consumedTokens).toBe(15000);
        expect(result.newTokenBalance).toBe(10000);
      });

      test('should handle extreme over-consumption gracefully', async () => {
        const existingBalance = {
          expiringTokens: 0, // User consumed all tokens and more
          nonexpiringTokens: 0,
          expiringTokensExpiry: new Date(Date.now() + 20 * 24 * 3600 * 1000)
        };

        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(existingBalance),
              }
            },
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
          };
          return await callback(mockTx);
        });

        const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        const result = await handleTierChangeTokens({
          ownerType: 'user',
          ownerId: TEST_USER_ID,
          oldTier: 'pro',
          newTier: 'pro', // Same tier (edge case)
          subscriptionEndDate
        });

        // Even with over-consumption, should not go negative
        expect(result.newTokenBalance).toBeGreaterThanOrEqual(0);
      });
    });

    describe('New User Without Existing Balance', () => {
      test('should create new token balance for user without existing record', async () => {
        let insertedValues: any;

        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(null), // No existing balance
              }
            },
            insert: vi.fn().mockImplementation((_table: any) => ({
              values: vi.fn().mockImplementation((values: any) => {
                if (values.expiringTokens !== undefined) {
                  insertedValues = values;
                }
                return mockTx;
              })
            })),
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
          };
          return await callback(mockTx);
        });

        const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        const result = await handleTierChangeTokens({
          ownerType: 'user',
          ownerId: TEST_USER_ID,
          oldTier: 'free',
          newTier: 'pro',
          subscriptionEndDate
        });

        expect(result.consumedTokens).toBe(0); // No previous consumption
        expect(result.newTokenBalance).toBe(15000); // Full Pro allowance
        expect(result.isUpgrade).toBe(true);
        expect(insertedValues?.expiringTokens).toBe(15000);
      });
    });

    describe('Audit Logging', () => {
      test('should create correct audit log for upgrade', async () => {
        const existingBalance = {
          expiringTokens: 8000,
          nonexpiringTokens: 0,
          expiringTokensExpiry: new Date(Date.now() + 20 * 24 * 3600 * 1000)
        };

        let ledgerEntry: any;

        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(existingBalance),
              }
            },
            insert: vi.fn().mockImplementation((_table: any) => ({
              values: vi.fn().mockImplementation((values: any) => {
                if (values.reason?.includes('tier_upgrade')) {
                  ledgerEntry = values;
                }
                return mockTx;
              })
            })),
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
          };
          return await callback(mockTx);
        });

        const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        await handleTierChangeTokens({
          ownerType: 'user',
          ownerId: TEST_USER_ID,
          oldTier: 'pro',
          newTier: 'premium',
          subscriptionEndDate
        });

        expect(ledgerEntry?.reason).toBe('tier_upgrade_pro_to_premium_adjustment');
        expect(ledgerEntry?.type).toBe('expiring');
        expect(ledgerEntry?.amount).toBe(10000); // Net change: 18000 - 8000
        expect(ledgerEntry?.expiry).toBe(subscriptionEndDate);
      });

      test('should create correct audit log for downgrade', async () => {
        const existingBalance = {
          expiringTokens: 20000,
          nonexpiringTokens: 0,
          expiringTokensExpiry: new Date(Date.now() + 20 * 24 * 3600 * 1000)
        };

        let ledgerEntry: any;

        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(existingBalance),
              }
            },
            insert: vi.fn().mockImplementation((_table: any) => ({
              values: vi.fn().mockImplementation((values: any) => {
                if (values.reason?.includes('tier_downgrade')) {
                  ledgerEntry = values;
                }
                return mockTx;
              })
            })),
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
          };
          return await callback(mockTx);
        });

        const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        await handleTierChangeTokens({
          ownerType: 'user',
          ownerId: TEST_USER_ID,
          oldTier: 'premium',
          newTier: 'pro',
          subscriptionEndDate
        });

        expect(ledgerEntry?.reason).toBe('tier_downgrade_premium_to_pro_adjustment');
        expect(ledgerEntry?.amount).toBe(-10000); // Net change: 10000 - 20000 = -10000
      });
    });

    describe('Error Handling', () => {
      test('should handle database errors gracefully', async () => {
        mockDb.transaction.mockRejectedValue(new Error('Database connection lost'));

        const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        
        await expect(handleTierChangeTokens({
          ownerType: 'user',
          ownerId: TEST_USER_ID,
          oldTier: 'pro',
          newTier: 'premium',
          subscriptionEndDate
        })).rejects.toThrow('Database connection lost');
      });

      test('should handle invalid tier gracefully', async () => {
        // This should be handled by the getSubscriptionTokens function returning 0
        const existingBalance = {
          expiringTokens: 1000,
          nonexpiringTokens: 0,
          expiringTokensExpiry: new Date(Date.now() + 20 * 24 * 3600 * 1000)
        };

        mockDb.transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            query: {
              tokenBalances: {
                findFirst: vi.fn().mockResolvedValue(existingBalance),
              }
            },
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
          };
          return await callback(mockTx);
        });

        const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        const result = await handleTierChangeTokens({
          ownerType: 'user',
          ownerId: TEST_USER_ID,
          oldTier: 'invalid_tier',
          newTier: 'pro',
          subscriptionEndDate
        });

        // Should still work, treating invalid tier as 0 tokens
        expect(result.newTokenBalance).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

describe('deductTokensFromAccount', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import the mocked db to get access to mockDb
    const { db } = await import('@/server/db');
    mockDb = db;
  });

  describe('Token Deduction Logic', () => {
    test('should deduct tokens expiring first, then nonexpiring', async () => {
      const existingBalance = {
        expiringTokens: 1000,
        nonexpiringTokens: 500,
        expiringTokensExpiry: new Date(Date.now() + 10 * 24 * 3600 * 1000)
      };

      let updateValues: any;
      const ledgerEntries: any[] = [];

      mockDb.transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          query: {
            tokenBalances: {
              findFirst: vi.fn().mockResolvedValue(existingBalance),
            }
          },
          insert: vi.fn().mockImplementation((_table: any) => ({
            values: vi.fn().mockImplementation((values: any) => {
              if (values.reason) {
                ledgerEntries.push(values);
              }
              return mockTx;
            })
          })),
          update: vi.fn().mockImplementation((_table: any) => ({
            set: vi.fn().mockImplementation((values: any) => {
              updateValues = values;
              return {
                where: vi.fn().mockReturnThis()
              };
            })
          })),
        };
        return await callback(mockTx);
      });

      const result = await deductTokensFromAccount({
        userId: TEST_USER_ID,
        tokensUsed: 800,
        reason: "test",
      });

      expect(result.tokensDeducted).toBe(800);
      expect(result.finalExpiringBalance).toBe(200); // 1000 - 800
      expect(result.finalNonexpiringBalance).toBe(500); // unchanged
      expect(updateValues?.expiringTokens).toBe(200);
      expect(updateValues?.nonexpiringTokens).toBe(500);
      expect(ledgerEntries).toHaveLength(1);
      expect(ledgerEntries[0]?.amount).toBe(-800);
      expect(ledgerEntries[0]?.type).toBe('expiring');
    });

    test('should allow negative balances when tokens are insufficient', async () => {
      const existingBalance = {
        expiringTokens: 100,
        nonexpiringTokens: 50,
        expiringTokensExpiry: new Date(Date.now() + 10 * 24 * 3600 * 1000)
      };

      let updateValues: any;
      const ledgerEntries: any[] = [];

      mockDb.transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          query: {
            tokenBalances: {
              findFirst: vi.fn().mockResolvedValue(existingBalance),
            }
          },
          insert: vi.fn().mockImplementation((_table: any) => ({
            values: vi.fn().mockImplementation((values: any) => {
              if (values.reason) {
                ledgerEntries.push(values);
              }
              return mockTx;
            })
          })),
          update: vi.fn().mockImplementation((_table: any) => ({
            set: vi.fn().mockImplementation((values: any) => {
              updateValues = values;
              return {
                where: vi.fn().mockReturnThis()
              };
            })
          })),
        };
        return await callback(mockTx);
      });

      const result = await deductTokensFromAccount({
        userId: TEST_USER_ID,
        tokensUsed: 200, // More than available (150 total)
        reason: "test",
      });

      expect(result.tokensDeducted).toBe(200);
      expect(result.finalExpiringBalance).toBe(0); // 100 - 100 (all used)
      expect(result.finalNonexpiringBalance).toBe(-50); // 50 - 100 (goes negative)
      expect(updateValues?.expiringTokens).toBe(0);
      expect(updateValues?.nonexpiringTokens).toBe(-50); // Negative balance allowed
      expect(ledgerEntries).toHaveLength(2); // One for expiring, one for nonexpiring
    });

    test('should handle expired tokens correctly', async () => {
      const existingBalance = {
        expiringTokens: 1000,
        nonexpiringTokens: 300,
        expiringTokensExpiry: new Date(Date.now() - 24 * 3600 * 1000) // Expired yesterday
      };

      let updateValues: any;

      mockDb.transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          query: {
            tokenBalances: {
              findFirst: vi.fn().mockResolvedValue(existingBalance),
            }
          },
          insert: vi.fn().mockImplementation((_table: any) => ({
            values: vi.fn().mockReturnThis()
          })),
          update: vi.fn().mockImplementation((_table: any) => ({
            set: vi.fn().mockImplementation((values: any) => {
              updateValues = values;
              return {
                where: vi.fn().mockReturnThis()
              };
            })
          })),
        };
        return await callback(mockTx);
      });

      const result = await deductTokensFromAccount({
        userId: TEST_USER_ID,
        tokensUsed: 200,
        reason: "test",
      });

      // Should not use expired tokens, only nonexpiring
      expect(result.finalExpiringBalance).toBe(1000); // Unchanged (expired)
      expect(result.finalNonexpiringBalance).toBe(100); // 300 - 200
    });

    test('should handle organization accounts', async () => {
      const existingBalance = {
        expiringTokens: 500,
        nonexpiringTokens: 0,
        expiringTokensExpiry: new Date(Date.now() + 10 * 24 * 3600 * 1000)
      };

      mockDb.transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          query: {
            tokenBalances: {
              findFirst: vi.fn().mockResolvedValue(existingBalance),
            }
          },
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
        };
        return await callback(mockTx);
      });

      const result = await deductTokensFromAccount({
        userId: TEST_USER_ID,
        orgId: TEST_ORG_ID,
        tokensUsed: 200,
        reason: "org-test",
      });

      expect(result.tokensDeducted).toBe(200);
      expect(result.finalExpiringBalance).toBe(300);
    });

    test('should throw error if token balance not found', async () => {
      mockDb.transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          query: {
            tokenBalances: {
              findFirst: vi.fn().mockResolvedValue(null), // No balance found
            }
          },
        };
        return await callback(mockTx);
      });

      await expect(deductTokensFromAccount({
        userId: TEST_USER_ID,
        tokensUsed: 100,
        reason: "test",
      })).rejects.toThrow('Token balance not found during deduction');
    });
  });
}); 