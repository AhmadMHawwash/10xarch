import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { waitlistTable } from "@/server/db/schema";

export const waitlistRouter = createTRPCRouter({
  joinWaitlist: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.insert(waitlistTable).values({ email: input.email });
        return { success: true };
      } catch (error) {
        console.error("Error inserting into waitlist:", error);
        throw new Error("Failed to join waitlist");
      }
    }),
});
