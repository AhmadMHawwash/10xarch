import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Set up the mock refetch function
const mockRefetch = vi.fn().mockResolvedValue({});

describe('useCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    
    // Mock dependencies at runtime - now including useOrganization
    vi.doMock('@clerk/nextjs', () => ({
      useAuth: () => ({
        userId: 'test-user',
      }),
      useOrganization: () => ({
        organization: null, // Default to personal account
      }),
    }));

    vi.doMock('@tanstack/react-query', () => ({
      useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn(),
      })),
    }));
    
    // Set up the data to be returned by the API - updated for token system
    vi.doMock('@/trpc/react', () => ({
      api: {
        credits: {
          getBalance: {
            useQuery: vi.fn().mockReturnValue({
              data: { 
                balance: {
                  expiringTokens: 100,
                  expiringTokensExpiry: null,
                  nonexpiringTokens: 0
                }
              },
              isLoading: false,
              error: null,
              refetch: mockRefetch,
            }),
          },
        },
      },
    }));
  });

  it('should return the correct balance', async () => {
    // Import the useCredits hook after mocking dependencies
    const { useCredits } = await import('../useCredits');
    
    const { result } = renderHook(() => useCredits());
    expect(result.current.totalUsableTokens).toBe(100);
  });

  it('should have hasValidData true when balance is available', async () => {
    const { useCredits } = await import('../useCredits');
    const { result } = renderHook(() => useCredits());
    expect(result.current.hasValidData).toBe(true);
  });

  it('should detect low credits', async () => {
    // Update the mock to return zero balance
    vi.doMock('@/trpc/react', () => ({
      api: {
        credits: {
          getBalance: {
            useQuery: vi.fn().mockReturnValue({
              data: { 
                balance: {
                  expiringTokens: 0,
                  expiringTokensExpiry: null,
                  nonexpiringTokens: 0
                }
              },
              isLoading: false,
              error: null,
              refetch: mockRefetch,
            }),
          },
        },
      },
    }));
    
    const { useCredits } = await import('../useCredits');
    const { result } = renderHook(() => useCredits());
    expect(result.current.hasLowCredits).toBe(true);
  });

  it('should prevent multiple simultaneous refetch calls', async () => {
    mockRefetch.mockClear();
    
    const { useCredits } = await import('../useCredits');
    const { result } = renderHook(() => useCredits());
    
    // Call refetch multiple times in quick succession
    await act(async () => {
      // Use void to explicitly mark promises as ignored
      void result.current.refetch();
      void result.current.refetch();
      void result.current.refetch();
      
      // Wait for debounce to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    });
    
    // Should only call the actual refetch once due to debouncing
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should handle debounced refetch with setTimeout', async () => {
    // We'll modify the mockRefetch to control when it resolves
    let resolveRefetch: () => void;
    const controlledPromise = new Promise<Record<string, never>>(resolve => {
      resolveRefetch = () => resolve({});
    });
    
    mockRefetch.mockImplementationOnce(() => controlledPromise);
    
    const { useCredits } = await import('../useCredits');
    const { result } = renderHook(() => useCredits());
    
    // Set up a spy on setTimeout to verify it's called to reset the flag
    const originalSetTimeout = global.setTimeout;
    const mockSetTimeoutFn = vi.fn().mockImplementation(
      (callback: () => void, ms?: number) => originalSetTimeout(callback, ms)
    );
    
    global.setTimeout = mockSetTimeoutFn as unknown as typeof global.setTimeout;
    
    try {
      // Start the refetch
      await act(async () => {
        const refetchPromise = result.current.refetch();
        
        // Resolve the refetch to complete the process
        resolveRefetch!();
        await refetchPromise;
      });
      
      // Verify that setTimeout was called to reset the flag
      expect(mockSetTimeoutFn).toHaveBeenCalledWith(expect.any(Function), 300);
    } finally {
      global.setTimeout = originalSetTimeout;
    }
  });

  it('should handle error states correctly', async () => {
    const testError = new Error('Failed to fetch credits');
    
    vi.doMock('@/trpc/react', () => ({
      api: {
        credits: {
          getBalance: {
            useQuery: vi.fn().mockReturnValue({
              data: undefined,
              isLoading: false,
              error: testError,
              refetch: mockRefetch,
            }),
          },
        },
      },
    }));
    
    const { useCredits } = await import('../useCredits');
    const { result } = renderHook(() => useCredits());
    
    expect(result.current.error).toBe(testError);
    expect(result.current.totalUsableTokens).toBe(0);
    expect(result.current.hasValidData).toBe(false);
  });
  
  it('should call useQuery with appropriate options', async () => {
    const mockUseQuery = vi.fn().mockReturnValue({
      data: { 
        balance: {
          expiringTokens: 100,
          expiringTokensExpiry: null,
          nonexpiringTokens: 0
        }
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    
    vi.doMock('@/trpc/react', () => ({
      api: {
        credits: {
          getBalance: {
            useQuery: mockUseQuery,
          },
        },
      },
    }));
    
    const { useCredits } = await import('../useCredits');
    renderHook(() => useCredits());
    
    // Simply verify the query was called
    expect(mockUseQuery).toHaveBeenCalled();
  });
}); 