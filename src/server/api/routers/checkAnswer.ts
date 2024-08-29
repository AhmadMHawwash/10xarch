import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const checkSolution = createTRPCRouter({
  hello: publicProcedure
    .input(z.string())
    .mutation(async ({ input: prompt }) => {
      if (!prompt) {
        return { error: "Missing required parameters" };
      }

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: [
                {
                  type: "text",
                  text: "You are a system design expert, and are given 1. The challenge 2. The current level being solved of the given challenge 3. The user's solution. You should be evaluating the solution that is provided to you, in  context of the provided 1. challenge, 2. assumptions of the system, 3. hints for the user to solve the current level of the challenge, 4. criteria for the solution to be considered correct.",
                },
              ],
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
              ],
            },
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: "How do you evaluate the solution from 1 to 10, and what can we improve (answer shortly without long explanations)",
                },
              ],
            },
          ],
          temperature: 1,
          max_tokens: 512,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          response_format: {
            type: "text",
          },
        });

        return response.choices[0]?.message.content ?? "No response generated";
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw new Error("Failed to evaluate the solution. Please try again later.");
      }
    }),
});
