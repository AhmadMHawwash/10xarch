import { z } from "zod";

export type Connection<T = string> = {
  source: T;
  target: T;
};

const componentsListSchema = z.enum([
  "Client",
  "Server",
  "Load Balancer",
  "Cache",
  "CDN",
  "SQL Database",
]);

const keyValueSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const componentSchema = z.object({
  id: z.string(),
  type: componentsListSchema,
  configs: z.unknown().optional(),
});

const connectionSchema = z.object({
  source: componentSchema,
  target: componentSchema,
});

export const levelSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string(),
  preConnectedComponents: z.array(componentSchema),
  preConnectedConnections: z.array(connectionSchema),
  components: z.array(z.string()),
  dashboard: z
    .object({
      beforeStartingLevel: z.object({
        reports: z.array(keyValueSchema),
        stats: z.array(keyValueSchema),
      }),
      afterStartingLevel: z.object({
        reports: z.array(keyValueSchema),
        stats: z.array(keyValueSchema),
      }),
    })
    .optional(),
});

export const userSolutionSchema = z.object({
  components: z.array(componentSchema),
  connections: z.array(connectionSchema),
});

const systemComponentSchema = z.object({
  name: componentsListSchema,
  description: z.string(),
  icon: z.any(),
});

export type Level = z.infer<typeof levelSchema>;
export type UserSolution = z.infer<typeof userSolutionSchema>;
export type SystemComponent = z.infer<typeof systemComponentSchema>;
