import { clerkMiddleware, createRouteMatcher } from "@/lib/clerk/server";
import { NextResponse, type NextRequest } from "next/server";
import { getAllSecurityHeaders } from "@/lib/csp";

// Determine if we're in development mode with dev mocking enabled
const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

// Define protected routes that require authentication
const isProtectedFromSigninsRoute = createRouteMatcher(["/credits(.*)"]);

// Common function to add security headers to responses
const addSecurityHeaders = (response: NextResponse) => {
  // Add all security headers from our centralized configuration
  const headers = getAllSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply CSP reporting if enabled via environment variable or in development
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_CSP_REPORTING === 'true') {
    response.headers.set(
      'Content-Security-Policy-Report-Only', 
      getAllSecurityHeaders(true)['Content-Security-Policy-Report-Only'] ?? ''
    );
  }

  return response;
};

// Use Clerk middleware which will be real or mock based on environment
export default clerkMiddleware(async (auth, req) => {
  try {
    // Get auth session using the auth function passed to us by middleware
    const { userId, redirectToSignIn } = await auth();
    
    console.log("[Middleware] Auth result userId:", userId);

    // For protected routes, ensure user is authenticated
    // In dev mode with mocking, userId will be set to a dev value
    if (!userId && isProtectedFromSigninsRoute(req)) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Get the original response and add security headers
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  } catch (error) {
    console.error("[Middleware] Error handling request:", error);
    
    // In dev mode, continue even if there's an auth error
    if (isDevelopmentMode) {
      return addSecurityHeaders(NextResponse.next());
    }
    
    // In production, redirect to sign-in for protected routes
    if (isProtectedFromSigninsRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    
    // For other routes, continue with the request
    return addSecurityHeaders(NextResponse.next());
  }
  });

export const config = {
  matcher: [
    "/challenges/:slug*",
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
