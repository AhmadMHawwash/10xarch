import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAllSecurityHeaders } from "@/lib/csp";

const isProtectedFromSigninsRoute = createRouteMatcher(["/credits(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Skip middleware processing for webhook routes
  console.log("req.nextUrl.pathname", req.nextUrl);
  if (req.nextUrl.pathname === "/api/webhook/clerk") {
    return NextResponse.next();
  }

  const { userId, redirectToSignIn } = await auth();

  // For protected routes, ensure user is authenticated
  if (!userId && isProtectedFromSigninsRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Get the original response
  const response = NextResponse.next();

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
});

export const config = {
  matcher: [
    "/challenges/:slug*",
    // Skip Next.js internals, all static files and API routes
    "/((?!_next|api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/trpc/:path*",
  ],
};
