import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { waitlistTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const waitlistRouter = createTRPCRouter({
  joinWaitlist: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.insert(waitlistTable).values({ email: input.email });
        return true;
      } catch (error) {
        console.error("Error inserting into waitlist:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to join waitlist. Reason: ${JSON.stringify(error)}`,
        });
      }
    }),
});
