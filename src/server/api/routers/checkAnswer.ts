import { z } from "zod";

import { levelSchema, userSolutionSchema } from "@/lib/levels/type";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const checkSolution = createTRPCRouter({
  hello: publicProcedure
    .input(
      z.object({
        level: levelSchema,
        userSolution: userSolutionSchema,
        tree: z.any(),
      }),
    )
    .mutation(async ({ input }) => {
      const { level, userSolution, tree } = input;

      if (!level || !userSolution) {
        return { error: "Missing required parameters" };
      }

      try {
        // const response = await openai.chat.completions.create({
        //   model: "gpt-4o-2024-05-13",
        //   messages: [
        //     {
        //       role: "system",
        //       content: "You are an expert system designer and architect.",
        //     },
        //     {
        //       role: "assistant",
        //       content:
        //         "What is the system design challenge you are trying to solve?",
        //     },
        //     {
        //       role: "user",
        //       content: JSON.stringify(level),
        //     },
        //     { role: "assistant", content: "What is your solution?" },
        //     { role: "user", content: JSON.stringify(userSolution) },
        //     // { role: "user", content: `
        //     //   As a system design expert, I want you to look for all good and bad practices.
        //     //   ie: Components that can be connected to each other, and components shouldn't be connected to each other. ie, after adding load balancer a client shouldn't be able to talk directly to the server.
        //     //   I want you to think thoroughly about my solution and give me quick feedback, that doesn't go beyond the scope of the problem.
        //     // ` },
        //     { role: "assistant", content: "Let me validate your solution." },
        //   ],
        // });

        // const responseMessage = response?.choices?.[0]?.message;

        // console.log("responseMessage:", responseMessage);
        return [
          {
            role: "system",
            content: "You are an expert system designer and architect, in a system design interview.",
          },
          {
            role: "assistant",
            content:
              "I'll provide you with a system design challenge and you need to solve it.",
          },
          {
            role: "assistant",
            content: JSON.stringify(level),
          },
          {
            role: "user",
            content: `my solution in JSON looks like this: ${JSON.stringify(userSolution)}, where there are components, and connections objects, that represent the components and connections between them.`,
          },
          {
            role: "user",
            content: `
            I need you to slightly hint me to fix the problems in my solution. And don't be chatty.
            Give me one informative hint a time, that will allow me to fix the very first problem ahead and learn from it.
            `,
          },
          // { role: "user", content: `
          // This is just a game and we're on a very high level conceptual game, and we can't configure components like load balancers or servers.
          //   As a system design expert, I want you to look for all good and bad practices.
          //   ie: Components that can be connected to each other, and components shouldn't be connected to each other. ie, after adding load balancer a client shouldn't be able to talk directly to the server.
          //   I want you to think thoroughly about my solution and give me quick feedback, that doesn't go beyond the scope of the problem.
          // ` },
        ];
      } catch (error) {
        console.error("Error validating solution:", error);
        return { error: "Error validating solution" };
      }
    }),
});
