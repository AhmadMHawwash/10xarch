import { chatRouter } from "@/server/api/routers/chat";
import { creditsRouter } from "@/server/api/routers/credits";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { challengesRouter } from "./routers/challenges";
import { checkSolution } from "./routers/checkAnswer";
import { stripeRouter } from "./routers/stripe";
import { playgroundsRouter } from "./routers/playgrounds";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  ai: checkSolution,
  credits: creditsRouter,
  stripe: stripeRouter,
  challenges: challengesRouter,
  chat: chatRouter,
  playgrounds: playgroundsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
