import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/challenges/:slug*"]);

export default clerkMiddleware(async (auth, req) => {
  // Redirect to sign in if not authenticated
  if (!auth().userId && isProtectedRoute(req)) {
    return auth().redirectToSignIn();
  }

  const usersCount = await clerkClient().users.getCount();

  if (usersCount > 50 && isProtectedRoute(req) && !auth().userId) {
    return NextResponse.redirect(new URL("/waitlist", req.url).toString());
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
