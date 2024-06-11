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
  "Database",
  "Message Queue",
  "Database Cluster",
  "Cache Cluster"
]);

const DatabaseConfigs = z.object({
  type: z.union([
    z.literal("Primary (Write)"),
    z.literal("Replica (Read only)"),
    z.string().refine((val) => val.startsWith("Replica (Read only) of "), {
      message: "Must match 'Replica (Read only) of <something>'",
    }),
    z.literal("Read/Write"),
  ]),
});

const CacheConfigs = z.object({
  type: z.union([z.literal("User Session"), z.literal("Database Read/Write")]),
});

const componentConfigs = z.object({
  Database: DatabaseConfigs,
  Cache: CacheConfigs,
});

const keyValueSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const DatabaseComponentSchema = z.object({
  id: z.string(),
  type: z.literal(componentsListSchema.Values.Database),
  configs: DatabaseConfigs,
});

const CacheComponentSchema = z.object({
  id: z.string(),
  type: z.literal(componentsListSchema.Values.Cache),
  configs: CacheConfigs,
});

const componentSchema = z.union([
  DatabaseComponentSchema,
  CacheComponentSchema,
  z.object({
    id: z.string(),
    type: componentsListSchema,
    configs: z.object({}).optional(),
  }),
]);

const connectionSchema = z.object({
  source: z.object({
    id: z.string(),
  }),
  target: z.object({
    id: z.string(),
  }),
});

export const levelSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string(),
  preConnectedComponents: z.array(componentSchema),
  preConnectedConnections: z.array(connectionSchema),
  criteria: z.array(z.string()),
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
export type SystemComponentType = z.infer<typeof componentsListSchema>;
export type ComponentConfig = z.infer<typeof componentConfigs>;
