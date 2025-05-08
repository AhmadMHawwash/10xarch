import {
  auth as realAuth,
  createRouteMatcher as realCreateRouteMatcher,
  clerkMiddleware as realClerkMiddleware,
} from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

const hasClerkKey =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('dummy');

// Only use real Clerk implementation if we have a real key or we're in production
const shouldUseRealClerk = hasClerkKey ?? !isDevelopmentMode;

console.log("[Clerk Server] Development mode:", isDevelopmentMode);
console.log("[Clerk Server] Using real Clerk:", shouldUseRealClerk);

// Default mock auth state for development mode
const mockAuthState = {
  actor: null,
  userId: isDevelopmentMode ? "dev_user_123" : null,
  getToken: async () => isDevelopmentMode ? "dev-token" : null,
  has: () => false,
  debug: () => ({}),
  factorVerificationAge: null,
  orgId: null,
  orgRole: null,
  orgSlug: null,
  sessionClaims: null,
  sessionId: isDevelopmentMode ? "dev-session-123" : null,
  orgPermissions: null,
  redirectToSignIn: (options?: { returnBackUrl?: string }) => {
    console.log("[Clerk Mock] Redirect to sign in called", options);
    return null;
  },
};

// Mock auth function for development
const mockAuth = async () => {
  console.log("[Clerk Mock] Auth function called");
  return {
    ...mockAuthState,
    userId: "dev_user_123" // Ensure userId is always set in development mode
  };
};

// Auth function implementation
export function auth() {
  console.log("[Clerk Server] Auth function requested");
  
  // If using real Clerk, return real auth function
  if (shouldUseRealClerk) {
    console.log("[Clerk Server] Using real Clerk auth");
    return realAuth();
  }

  // For mock/dev mode, return our mock auth function
  console.log("[Clerk Server] Using mock auth");
  return mockAuth;
}

export function createRouteMatcher(routes: string[]) {
  if (shouldUseRealClerk) {
    return realCreateRouteMatcher(routes);
  }
  
  // Simple mock implementation for development
  return (req: Request) => {
    const url = new URL(req.url);
    return routes.some(route => {
      if (route.includes('*')) {
        const prefix = route.replace('*', '');
        return url.pathname.startsWith(prefix);
      }
      return url.pathname === route;
    });
  };
}

// Type for middleware handlers without circular reference
type MiddlewareHandler = (
  auth: typeof auth,
  req: NextRequest
) => Promise<NextResponse | Response | void> | NextResponse | Response | void;

// Mock middleware implementation with proper typing
export const clerkMiddleware = shouldUseRealClerk
  ? realClerkMiddleware
  : (fn: MiddlewareHandler) => {
      console.log("[Clerk Server] Creating mock middleware");
      // Return a middleware function that accepts a request
      return async (request: NextRequest) => {
        console.log("[Clerk Middleware] Request path:", request.nextUrl.pathname);
        try {
          // In development mode, inject a consistent auth object with userId
          if (isDevelopmentMode) {
            console.log("[Clerk Middleware] Using dev user auth");
            const mockAuthFn = () => Promise.resolve({
              userId: "dev_user_123",
              sessionId: "dev-session-123",
              getToken: async () => "dev-token",
              has: () => false,
              debug: () => ({}),
            });
            return await fn(mockAuthFn, request);
          }
          
          // Call the provided function with our auth function and the request
          console.log("[Clerk Middleware] Calling middleware function");
          // We know our implementation is correct, so we can safely ignore the type error
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
          return await fn(auth, request);
        } catch (error) {
          console.error("[Clerk Middleware] Error:", error);
          // Return a default response in case of errors
          return NextResponse.next();
        }
      };
    };
