import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const checkSolution = createTRPCRouter({
  hello: publicProcedure
    .input(
      z.object({
        criteria: z.array(z.string()),
        challengeAndSolutionPrompt: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { criteria, challengeAndSolutionPrompt } = input;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: [
                {
                  type: "text",
                  text: "You are a system design evaluation expert. You will receive: \n1. The challenge description \n2. The current level of the challenge being addressed \n3. The user's proposed solution. \nYour task is to evaluate the provided solution in the context of: \n1. The challenge requirements, \n2. The system assumptions, \n3. Provided hints for solving the current level, \n4. The criteria that define a correct solution.",
                },
              ],
            },
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: `Accept the solution if it meets the following criteria: \n${JSON.stringify(criteria, null, 2)}. \nIf any criteria are not met, inform the user and reduce their overall score.`,
                },
              ],
            },
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '{ \n"General evaluation criteria": [\n"A clear database schema must be defined.",\n"Both functional and non-functional requirements should be addressed, aligning with the current level of the challenge and assumptions.",\n"System APIs must be clearly defined, with their flows aligned to address the challenge level appropriately. More than one API may be necessary depending on the requirements.",\n"System capacity estimations should be defined and match the challenge level and assumptions.",\n"A high-level design should include components and their connections, matching the challenge level and assumptions.",\n"Database schema and models should be defined, meeting the challenge level and assumptions."]\n}',
                },
              ],
            },
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: "  Score the solution as follows: \n- If the solution meets all criteria for the current challenge level, give a score of 9/10. \n- If the solution goes beyond the provided criteria, give a score of 10/10.",
                },
              ],
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: challengeAndSolutionPrompt,
                },
              ],
            },
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: "Respond with the score in this format: \n[score] \n(Score range: 1 - 10, if any criteria is not met then take down from the score, other than that a 9/10 if and only if the solution met all the criteria then a 9/10 score is deserved. However a 10/10 is well deserved for exceeding the criteria) \nList of elements to be fixed: \n1. [Specify areas needing improvement based on evaluation]",
                },
              ],
            },
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: "Provide a concise evaluation score from 1 to 10 without any further explanation.",
                },
              ],
            },
          ],
          temperature: 1,
          max_tokens: 256,
          top_p: 0,
          frequency_penalty: 0,
          presence_penalty: 0,
          response_format: {
            type: "text",
          },
        });

        return response.choices[0]?.message.content ?? "No response generated";
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw new Error(
          "Failed to evaluate the solution. Please try again later.",
        );
      }
    }),
});
