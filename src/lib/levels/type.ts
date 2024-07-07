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
  "Cache Cluster",
  "Server Cluster",
  "Whiteboard",
]);

const DatabaseConfigs = z.object({
  type: z.union([
    z.literal("Read/Write"),
    z.literal("Replica (Read only)"),
    // @ FIXME: This is making the type loose
    z.string().refine((val) => val.startsWith("Replica (Read only) of "), {
      message: "Must match 'Replica (Read only) of <something>'",
    }),
  ]),
  "primary instances count": z.number().optional(),
  "replica instances count": z.number().optional(),
});

const CacheConfigs = z.object({
  type: z.union([z.literal("User Session"), z.literal("Database Read/Write")]),
  "primary instances count": z.number().optional(),
  "replica instances count": z.number().optional(),
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
  targets: z.array(z.string()),
  configs: DatabaseConfigs,
});

const CacheComponentSchema = z.object({
  id: z.string(),
  type: z.literal(componentsListSchema.Values.Cache),
  targets: z.array(z.string()),
  configs: CacheConfigs,
});

const DatabaseClusterComponentSchema = z.object({
  id: z.string(),
  type: z.literal(componentsListSchema.Values["Database Cluster"]),
  targets: z.array(z.string()),
  configs: DatabaseConfigs,
});

const CacheClusterComponentSchema = z.object({
  id: z.string(),
  type: z.literal(componentsListSchema.Values["Cache Cluster"]),
  targets: z.array(z.string()),
  configs: CacheConfigs,
});

const componentSchema = z.union([
  DatabaseComponentSchema,
  CacheComponentSchema,
  DatabaseClusterComponentSchema,
  CacheClusterComponentSchema,
  z.object({
    id: z.string(),
    type: componentsListSchema,
    targets: z.array(z.string()),
    configs: z.object({}).optional(),
  }),
]);

export const levelSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string(),
  preConnectedComponents: z.array(componentSchema),
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

export const userSolutionSchema = z.array(componentSchema);

const systemComponentSchema = z.object({
  name: componentsListSchema,
  description: z.string(),
  icon: z.any(),
  content: z.string().optional(),
});

export type Level = z.infer<typeof levelSchema>;
export type UserSolution = z.infer<typeof userSolutionSchema>;
export type SystemComponent = z.infer<typeof systemComponentSchema>;
export type SystemComponentType = z.infer<typeof componentsListSchema>;
export type ComponentConfig = z.infer<typeof componentConfigs>;
