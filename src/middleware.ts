import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/sign-up(.*)"]);

const MAX_USERS_COUNT = 50;
export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // Get the current user count from Clerk
  const usersCount = await (await clerkClient()).users.getCount();

  // If we've hit the user limit and this is a protected route
  if (usersCount >= MAX_USERS_COUNT && isProtectedRoute(req)) {
    // Allow existing users to continue using the app
    if (!userId) {
      // For non-authenticated users, redirect to waitlist
      // Don't redirect if they're already on the waitlist page
      if (!req.url.includes("/waitlist")) {
        return NextResponse.redirect(new URL("/waitlist", req.url));
      }
    }
  }

  // For protected routes, ensure user is authenticated
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  return NextResponse.next();
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
