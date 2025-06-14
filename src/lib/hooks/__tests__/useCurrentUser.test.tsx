import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCurrentUser } from '../useCurrentUser';
import { useUser } from '@clerk/nextjs';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

describe('useCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct structure when user is loading', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: false,
      isSignedIn: false,
    } as any);

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current).toEqual({
      clerkUser: null,
      isSignedIn: false,
      isLoading: true,
    });
  });

  it('should return correct structure when user is signed in', () => {
    const mockUser = {
      id: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
    } as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockUseUser.mockReturnValue({
      user: mockUser,
      isLoaded: true,
      isSignedIn: true,
    } as any);

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current).toEqual({
      clerkUser: mockUser,
      isSignedIn: true,
      isLoading: false,
    });
  });

  it('should return correct structure when user is not signed in', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    } as any);

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current).toEqual({
      clerkUser: null,
      isSignedIn: false,
      isLoading: false,
    });
  });

  it('should return correct structure when user is undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoaded: true,
      isSignedIn: undefined,
    } as any);

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current).toEqual({
      clerkUser: undefined,
      isSignedIn: undefined,
      isLoading: false,
    });
  });

  it('should properly handle isLoading state', () => {
    // Test loading state
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: false,
      isSignedIn: false,
    } as any);

    const { result, rerender } = renderHook(() => useCurrentUser());
    expect(result.current.isLoading).toBe(true);

    // Test loaded state
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    } as any);

    rerender();
    expect(result.current.isLoading).toBe(false);
  });
}); 