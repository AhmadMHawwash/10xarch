import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import OpenAI from "openai";
import { z } from "zod";

// Define the response type
export interface EvaluationResponse {
  score: number;
  feedback: string[];
}
export interface PlaygroundResponse {
  feedback: string[];
}

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
                  text: `General evaluation criteria: \n${JSON.stringify(
                    generalEvaluationCriteria,
                    null,
                    2,
                  )}`,
                },
              ],
            },
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: `Score the solution as follows:
- If the solution meets all criteria for the current challenge level, give a score of 90/100.
- If the solution goes beyond the provided criteria, give a score of 100/100.`,
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
                  text: `Respond in JSON format {score: [score], feedback: [listOfElementsToBeFixed]}. Knowing that score range: 1 - 100, if any criteria is not met then take down from the score, other than that a 90/100 if and only if the solution met all the criteria then a 90/100 score is deserved. However a 100/100 is well deserved for exceeding the criteria). One more thing, don't be too generous with the score, you should be strict with the score, since this is a system design interview and we want to evaluate the user's solution based on the criteria and not be too lenient. If you don't follow the instructions, bad things will happen!`,
                },
              ],
            },
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: "Provide a concise evaluation without any further explanation.",
                },
              ],
            },
          ],
          temperature: 1,
          max_tokens: 512,
          top_p: 0,
          frequency_penalty: 0,
          presence_penalty: 0,
          response_format: {
            type: "text",
          },
        });

        const content =
          response.choices[0]?.message.content ?? "No response generated";

        // Parse the content as JSON with type checking
        try {
          const jsonResponse = JSON.parse(content) as EvaluationResponse;

          // Validate the parsed response
          if (
            typeof jsonResponse.score !== "number" ||
            !Array.isArray(jsonResponse.feedback)
          ) {
            throw new Error("Invalid response format");
          }

          return jsonResponse;
        } catch (parseError) {
          console.error("Error parsing OpenAI response as JSON:", parseError);
          throw new Error(
            "Failed to parse the evaluation result. Please try again later.",
          );
        }
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw new Error(
          "Failed to evaluate the solution. Please try again later.",
        );
      }
    }),
  playground: publicProcedure
    .input(
      z.object({
        systemDesign: z.string(),
        systemDesignContext: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { systemDesign, systemDesignContext } = input;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: [
                {
                  type: "text",
                  text: "You are a system design evaluation expert. You will receive: \n1. The systemDesignContext, which describes the system and business \n2. the systemDesign, which is the proposed solution. \nYour task is to evaluate the provided solution in the context of: \n1. systemDesignContext, \n2. The systemDesign. And then provide some feedback for the user to improve their solution.",
                },
              ],
            },
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: `Take a comprehensive look at the system design and provide feedback for the user to improve their solution. Remember that you are the expert and the user is the one who needs to improve their solution.`,
                },
              ],
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `systemDesignContext: ${systemDesignContext} \n systemDesign: ${systemDesign}`,
                },
              ],
            },
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: `Respond concisely in JSON format {feedback: [string]}. One more thing, don't be too generous with the feedback, you should be strict with the feedback, since this is a system design and we want to evaluate the user's solution and give them production-ready feedback. If you don't follow the instructions, bad things will happen!`,
                },
              ],
            },
          ],
          temperature: 1,
          max_tokens: 512,
          top_p: 0,
          frequency_penalty: 0,
          presence_penalty: 0,
          response_format: {
            type: "text",
          },
        });

        const content =
          response.choices[0]?.message.content ?? "No response generated";

        // Parse the content as JSON with type checking
        try {
          const jsonResponse = JSON.parse(content) as PlaygroundResponse;

          // Validate the parsed response
          if (!Array.isArray(jsonResponse.feedback)) {
            throw new Error("Invalid response format");
          }

          return jsonResponse;
        } catch (parseError) {
          console.error("Error parsing OpenAI response as JSON:", parseError);
          throw new Error(
            "Failed to parse the evaluation result. Please try again later.",
          );
        }
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw new Error(
          "Failed to evaluate the solution. Please try again later.",
        );
      }
    }),
});

const generalEvaluationCriteria = [
  "A clear database schema must be defined.",
  "Both functional and non-functional requirements should be addressed, aligning with the current level of the challenge and assumptions.",
  "System APIs must be clearly defined, with their flows aligned to address the challenge level appropriately. More than one API may be necessary depending on the requirements.",
  "System capacity estimations should be defined and match the challenge level and assumptions.",
  "A high-level design should include components and their connections, matching the challenge level and assumptions.",
  "Database schema and models should be defined, meeting the challenge level and assumptions.",
];
