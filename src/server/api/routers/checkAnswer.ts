import { generalCriteria } from "@/lib/levels/criteria";
import { constraints } from "@/lib/levels/loadBalancing/solutions";
import { levelSchema, userSolutionSchema } from "@/lib/levels/type";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { OpenAI } from "openai";
import { z } from "zod";

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
      const { level, userSolution } = input;

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
        //     //   I want you to think thoroughly about my solution and give me quick feedback, that doesn't go beyond the scope of the challenge.
        //     // ` },
        //     { role: "assistant", content: "Let me validate your solution." },
        //   ],
        // });

        // const responseMessage = response?.choices?.[0]?.message;

        const connectionsInText = userSolution.connections.map(
          (connection) =>
            `${connection.source.id} connected to ${connection.target.id}`,
        );

        const getComponentConfig = (c: (typeof userSolution.components)[0]) => {
          return Object.values((c.configs as object) ?? {}).map(
            (value) => `${c.id} is configured as ${value} ${c.type}`,
          );
        };

        const getKnowingThat = (c: (typeof userSolution.components)[0]) => {
          return getComponentConfig(c).map(toBullets).join("\n");
        };

        const toBullets = (s: string) => `- ${s}`;

        const componentsWithConfigs = userSolution.components.filter(
          (c) => Object.values(c.configs ?? {}).length > 0,
        );

        return `The design challenge is: ${level.title}, ${level.description}. And this level has some constraints: ${constraints.join(", ")}.
The design challenge can be considered has a "Correct" solution if it had this criteria:
${[...level.citeria, ...generalCriteria].map(toBullets).join("\n")}.

Then we can consider the solution is correct.

The components I have in my design solution are: 
${userSolution.components.map((c) => toBullets(c.id)).join("\n")}.

And they are connected like this: 
${connectionsInText.map(toBullets).join("\n")}.

${componentsWithConfigs.length > 0 ? "Knowing that:" : ""}
${componentsWithConfigs.map(getKnowingThat).join("\n")}`;
        return [
          //         {
          //           role: "system",
          //           content:
          //             "You are an expert system designer and architect, in a system design interview.",
          //         },
          //         {
          //           role: "system",
          //           content: `
          //           Validate the solution by:
          //           - Checking the components and their connections.
          //           - Ensuring components are correctly connected and not incorrectly connected.
          //           If the solution is correct, confirm it without further suggestions, and say "it's correct".
          //           If there’s an issue, provide a single, high-level hint to fix it.
          //           Do not:
          //           - Be chatty.
          //           - Ask for details already provided.
          //           - Go beyond the scope of the challenge.
          //           - Discuss configurations or implementation details such as handling connections, read/write access, load balancing strategies, or redundancy measures.
          // `,
          // },
          // {
          //   role: "system",
          //   content: `Here are possible solutions: ${solutions.join(", ")}`,
          // },
          // {
          //   role: "system",
          //   content: `Here are some instructions for the user provided solutions: ${notes.join(", ")}`,
          // },
          // {
          //   role: "user",
          //   content:
          //     "I'll provide you with a system design challenge I'm solving, and I need your assistance",
          // },
          {
            role: "user",
            content: `the design challenge is: ${level.title}, ${level.description}`,
          },
          {
            role: "user",
            content: `The components I have are ${userSolution.components.map((c) => c.id).join(", ")}. And they are connected like this: ${connectionsInText.join(", ")}. And that represents components and connections between them.`,
          },
          // { role: "user", content: level.metaInstructions },
          // {
          //   role: "",
          //   content: `Here are possible solutions: ${solutions.join(", ")}`,
          // },
          // {
          //   role: "user",
          //   content: `
          //   I need you to slightly hint me to fix the problems in my solution. And don't be chatty.
          //   Give me one informative hint a time, that will allow me to fix the very first problem ahead and learn from it.
          //   `,
          // },

          // I need you to help me fix issues in my system design solution with high-level feedback, one hint at a time. Follow these strict rules:

          // Focus only on the scope of the current challenge.
          // Address components and their connections, not implementation details or configurations.
          // Provide one concise hint to fix the immediate issue without going into detail.
          // Validate the solution by:
          // - Checking the components and their connections.
          // - Ensuring components are correctly connected and not incorrectly connected.
          // If the solution is correct, confirm it without further suggestions.
          // If there’s an issue, provide a single, high-level hint to fix it.
          // Do not:
          // - Be chatty.
          // - Ask for details already provided.
          // - Go beyond the scope of the challenge.
          // - Discuss configurations or implementation details such as handling connections, read/write access, load balancing strategies, or redundancy measures.

          // { role: "user", content: `
          // This is just a game and we're on a very high level conceptual game, and we can't configure components like load balancers or servers.
          //   As a system design expert, I want you to look for all good and bad practices.
          //   ie: Components that can be connected to each other, and components shouldn't be connected to each other. ie, after adding load balancer a client shouldn't be able to talk directly to the server.
          //   I want you to think thoroughly about my solution and give me quick feedback, that doesn't go beyond the scope of the challenge.
          // ` },
        ];
      } catch (error) {
        console.error("Error validating solution:", error);
        return { error: "Error validating solution" };
      }
    }),
});
