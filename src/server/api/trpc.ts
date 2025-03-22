/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/server/db";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { apiRequestsLimiter, getRateLimitIdentifier } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * Rate limiting middleware for all API requests
 */
const rateLimit = t.middleware(async ({ ctx, next }) => {
  // Skip rate limiting for certain conditions
  if (process.env.DISABLE_RATE_LIMIT === "true") {
    return next();
  }

  // Try to get user auth information if available
  let auth;
  try {
    auth = await clerkAuth();
  } catch (error) {
    // Continue without auth if it fails
    auth = { userId: null };
  }

  const userId = auth.userId;
  const ipAddress = ctx.headers.get("x-forwarded-for") ?? null;
  
  // Create identifier that combines IP and user ID (if available)
  const identifier = getRateLimitIdentifier(ipAddress, userId);
  
  // Apply rate limit
  const { success, reset, remaining } = await apiRequestsLimiter.limit(identifier);
  
  if (!success) {
    // Calculate reset time in seconds
    const secondsUntilReset = Math.ceil((reset - Date.now()) / 1000);
    
    // Log rate limit exceeded event
    logSecurityEvent({
      eventType: "rate-limit-exceeded",
      message: "API rate limit exceeded",
      userId: userId ?? undefined,
      ipAddress: ipAddress ?? undefined,
      endpoint: ctx.headers.get("referer") ?? "/api/trpc",
      metadata: {
        limitType: "api_requests",
        reset: reset,
        secondsUntilReset
      }
    });
    
    // Throw rate limit error
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Try again in ${secondsUntilReset} seconds.`,
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      rateLimit: { remaining }
    }
  });
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure
  .use(rateLimit)
  .use(async ({ next, ctx }) => {
    return next({
      ctx: {
        db: ctx.db,
        headers: ctx.headers,
      },
    });
  });

/**
 * Protected (authenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API that require authentication.
 * It guarantees that a user querying is authorized by throwing an error if they are not logged in.
 */
export const protectedProcedure = t.procedure
  .use(rateLimit)
  .use(async ({ next, ctx }) => {
    const auth = await clerkAuth();
    if (!auth.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        db: ctx.db,
        auth
      },
    });
  });
