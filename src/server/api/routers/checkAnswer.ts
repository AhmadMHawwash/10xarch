import {
  createCallerFactory,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import OpenAI from "openai";
import { z } from "zod";
import {
  calculateTextTokens,
  costToCredits,
  GPT_TOKEN_COSTS,
} from "@/lib/tokens";
import { TRPCError } from "@trpc/server";
import { creditsRouter } from "./credits";
import { auth } from "@clerk/nextjs/server";

const createCreditsCaller = createCallerFactory(creditsRouter);

// Define the response type
const EvaluationResponseSchema = z.object({
  score: z.number(),
  strengths: z.string(),
  improvementAreas: z.string(),
  recommendations: z.string(),
});

export type EvaluationResponse = z.infer<typeof EvaluationResponseSchema>;
export type PlaygroundResponse = Omit<
  z.infer<typeof EvaluationResponseSchema>,
  "score"
>;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const checkSolution = createTRPCRouter({
  hello: publicProcedure
    .input(
      z.object({
        criteria: z.array(z.string()),
        challengeAndSolutionPrompt: z.string(),
        bypassInternalToken: z.string().optional(),
      }),
    )
    .output(EvaluationResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId } = await auth();

      const canUseAI =
        input.bypassInternalToken === process.env.BYPASS_TOKEN || userId;
      if (!canUseAI) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to use this endpoint",
        });
      }
      const { criteria, challengeAndSolutionPrompt } = input;

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content:
            "You are a system design evaluation expert. You will receive: \n1. The challenge description \n2. The current stage of the challenge being addressed \n3. The user's proposed solution. \nYour task is to evaluate the provided solution in the context of: \n1. The challenge requirements, \n2. The system requirements provided by the CPO/CTO, \n3. Provided hints for solving the current level, \n4. The criteria that define a correct solution.",
        },
        {
          role: "assistant",
          content: `Accept the solution if it meets the following criteria: \n${JSON.stringify(criteria, null, 2)}. \nIf any criteria are not met, inform the user and reduce their overall score.`,
        },
        {
          role: "assistant",
          content: `General evaluation criteria: \n${JSON.stringify(
            generalEvaluationCriteria,
            null,
            2,
          )}`,
        },
        {
          role: "assistant",
          content: `Score the solution as follows:
- If the solution meets all criteria for the current challenge level, give a score of 90/100.
- If the solution goes beyond the provided criteria, give a score of 100/100.`,
        },
        {
          role: "user",
          content: challengeAndSolutionPrompt,
        },
        {
          role: "assistant",
          content: `Respond in JSON format {score: number, strengths: string, improvementAreas: string, recommendations: string}. 
              * Regarding score: score ranges from 0 to 100. When the provided solution fixes part of the given challenge (and current stage) then add score to the user score. If the user didn't solve anything, then they deserver a ZERO (0). One more thing, I want you to be quite strict with the score, since this is a system design interview and we want to evaluate the user's solution based on the criteria and not be too lenient. And as the user progresses in the challenge they should face strictier scoring approach. 
              * Regarding improvementAreas: each improvement area, should be one specific improvement. So if you have multiple improvements, you should list them separately in markdown format.
              * Regarding strengths, improvementAreas and recommendations should be in markdown format.
              * Rules: 1. If you don't follow the instructions, bad things will happen! 2. Give the feedback like this {score: number, strengths: string, improvementAreas: string, recommendations: string}. No further wrapping`,
        },
        {
          role: "assistant",
          content:
            "Provide a concise evaluation without any further explanation.",
        },
      ];

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.2,
          max_tokens: 512,
          frequency_penalty: 0,
          presence_penalty: 0,
        });

        const content =
          response.choices[0]?.message.content ?? "No response generated";

        // Parse the content as JSON with type checking
        try {
          if (userId && input.bypassInternalToken !== process.env.BYPASS_TOKEN) {
            const inputTokens = calculateTextTokens(JSON.stringify(messages));
            const outputTokens = calculateTextTokens(content);

            const inputCost =
              (inputTokens / 1000) * GPT_TOKEN_COSTS["gpt-4o-mini"].input;
            const outputCost =
              (outputTokens / 1000) * GPT_TOKEN_COSTS["gpt-4o-mini"].output;
            const totalCredits = costToCredits(inputCost + outputCost);

            // Use credits via TRPC
            const caller = createCreditsCaller(ctx);
            await caller.use({
              amount: totalCredits,
              description: "AI Solution Evaluation",
            });
          }
          const jsonResponse = JSON.parse(content) as EvaluationResponse;

          return jsonResponse;
        } catch (parseError) {
          console.error("Error parsing OpenAI response as JSON:", parseError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Failed to parse the evaluation result. Please try again later.",
          });
        }
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to evaluate the solution. Please try again later.",
        });
      }
    }),
  playground: protectedProcedure
    .input(
      z.object({
        systemDesign: z.string(),
        systemDesignContext: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { systemDesign, systemDesignContext } = input;

      // Calculate input tokens
      const inputText = `systemDesignContext: ${systemDesignContext} \n systemDesign: ${systemDesign}`;
      const inputTokens = calculateTextTokens(inputText);
      const estimatedOutputTokens = 512; // max_tokens from the API call

      // Calculate required credits
      const inputCost =
        (inputTokens / 1000) * GPT_TOKEN_COSTS["gpt-4o-mini"].input;
      const outputCost =
        (estimatedOutputTokens / 1000) * GPT_TOKEN_COSTS["gpt-4o-mini"].output;
      const totalCredits = costToCredits(inputCost + outputCost);

      // Use credits via TRPC
      const caller = createCreditsCaller(ctx);
      await caller.use({
        amount: totalCredits,
        description: "AI Playground Feedback",
      });

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a system design evaluation expert. You will receive: \n1. The systemDesignContext, which describes the system and business \n2. the systemDesign, which is the proposed solution. \nYour task is to evaluate the provided solution in the context of: \n1. systemDesignContext, \n2. The systemDesign. And then provide some feedback for the user to improve their solution.",
            },
            {
              role: "assistant",
              content:
                "Take a comprehensive look at the system design and provide feedback for the user to improve their solution. Remember that you are the expert and the user is the one who needs to improve their solution.",
            },
            {
              role: "user",
              content: `systemDesignContext: ${systemDesignContext} \n systemDesign: ${systemDesign}`,
            },
            {
              role: "assistant",
              content: `Respond concisely in JSON format {strengths: string, improvementAreas: string, recommendations: string}. 
                  * Regarding improvementAreas: each improvement area, should be one specific improvement. So if you have multiple improvements, you should list them separately in markdown format.
                  * Regarding strengths, improvementAreas and recommendations should be in markdown format.
                  * Rules: 1. If you don't follow the instructions, bad things will happen! 2. Give the feedback like this {score: number, strengths: string, improvementAreas: string, recommendations: string}. No further wrapping`,
            },
            {
              role: "assistant",
              content:
                "Provide a concise evaluation without any further explanation.",
            },
          ],
          temperature: 0.2,
          max_tokens: 512,
          frequency_penalty: 0,
          presence_penalty: 0,
        });

        const content =
          response.choices[0]?.message.content ?? "No response generated";

        // Parse the content as JSON with type checking
        try {
          const jsonResponse = JSON.parse(content) as PlaygroundResponse;
          return jsonResponse;
        } catch (parseError) {
          console.error("Error parsing OpenAI response as JSON:", parseError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Failed to parse the evaluation result. Please try again later.",
          });
        }
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to evaluate the solution. Please try again later.",
        });
      }
    }),
});

const generalEvaluationCriteria = [
  "A clear database schema must be defined.",
  "Both functional and non-functional requirements should be addressed, aligning with the current level of the challenge and requirements.",
  "The solution should be scalable and maintainable.",
  "The solution should follow best practices for the chosen technologies.",
  "The solution should be secure and handle edge cases.",
  "The solution should be well-documented and easy to understand.",
  "The solution should be testable and include appropriate error handling.",
  "The solution should consider performance implications.",
  "The solution should follow SOLID principles where applicable.",
];
