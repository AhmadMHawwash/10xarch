/**
 * This file provides a unified interface for Clerk functionality.
 * In development mode, Clerk components are only used if a real API key is present.
 */

import {
  useAuth as useRealAuth,
  useUser as useRealUser,
  useClerk as useRealClerkHook,
  ClerkProvider as RealClerkProvider,
  SignIn as RealSignIn,
  SignUp as RealSignUp,
  SignOutButton as RealSignOutButton,
  UserButton as RealUserButton,
  SignInButton as RealSignInButton,
  SignUpButton as RealSignUpButton,
} from "@clerk/nextjs";
import { type NextClerkProviderProps } from "node_modules/@clerk/nextjs/dist/types/types";

// Helper to check if we have a real Clerk key (not the dummy placeholder)
const hasClerkKey =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('dummy');

// Determine if we're in development mode
const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

// Only use real Clerk implementation if we have a real key or we're in production
const shouldUseRealClerk = hasClerkKey ?? !isDevelopmentMode;

// Default values for auth state when Clerk is not available
const nonClerkAuthState = {
  userId: "dev_user_123",
  sessionId: "dev-session-123",
  getToken: async () => "dev-token",
  isLoaded: true,
  isSignedIn: true,
};

// Default values for user data when Clerk is not available
const defaultUser = {
  id: "dev_user_123",
  firstName: "Dev",
  lastName: "User",
  fullName: "Dev User",
  username: "dev_user",
  primaryEmailAddress: {
    emailAddress: "dev@example.com",
    id: "email_123",
    verification: { status: "verified" },
  },
  imageUrl: "https://via.placeholder.com/150",
  createdAt: new Date().toISOString(),
};

// Auth hook implementation
export function useAuth() {
  if (shouldUseRealClerk) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRealAuth();
  }

  // Return default auth state for development
  return nonClerkAuthState;
}

// User hook implementation
export function useUser() {
  if (shouldUseRealClerk) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRealUser();
  }

  // Return default user data for development
  return {
    isLoaded: true,
    isSignedIn: true,
    user: defaultUser,
  };
}

// Clerk utility hook implementation
export function useClerk() {
  if (shouldUseRealClerk) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRealClerkHook();
  }

  // Return minimal implementation for dev mode
  return {
    signOut: async () => console.log("Dev mode: Sign out called"),
    openSignIn: () => console.log("Dev mode: Open sign in called"),
    openSignUp: () => console.log("Dev mode: Open sign up called"),
  };
}

// ClerkProvider component
export function ClerkProvider({
  children,
  ...props
}: React.PropsWithChildren<NextClerkProviderProps>) {
  // If Clerk is available, use the real provider
  if (shouldUseRealClerk) {
    return (
      <RealClerkProvider {...props}>
        {children}
      </RealClerkProvider>
    );
  }

  // In dev mode without Clerk, just render children directly
  return <>{children}</>;
}

// Re-export other components (if needed in development mode, they'll be dummy components)
export const SignIn = shouldUseRealClerk
  ? RealSignIn
  : () => <div>Sign In (Dev Mode)</div>;
export const SignUp = shouldUseRealClerk
  ? RealSignUp
  : () => <div>Sign Up (Dev Mode)</div>;
export const SignOutButton = shouldUseRealClerk
  ? RealSignOutButton
  : ({ children }: React.PropsWithChildren) => <>{children}</>;
export const UserButton = shouldUseRealClerk
  ? RealUserButton
  : () => <div>User Button (Dev Mode)</div>;
export const SignInButton = shouldUseRealClerk
  ? RealSignInButton
  : ({ children }: React.PropsWithChildren) => <div className="cursor-pointer">{children}</div>;
export const SignUpButton = shouldUseRealClerk
  ? RealSignUpButton
  : ({ children }: React.PropsWithChildren) => <div className="cursor-pointer">{children}</div>;
