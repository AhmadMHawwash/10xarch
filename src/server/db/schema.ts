// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  text,
  timestamp,
  uuid,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `sdp_${name}`,
);

export const posts = createTable(
  "post",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name"),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

export type Post = typeof posts.$inferSelect;

export const users = createTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // Stripe customer info
  stripe_customer_id: text("stripe_customer_id"),
});

export type User = typeof users.$inferSelect;

// Subscription status enum
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "incomplete",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "paused",
]);

// Subscriptions table
export const subscriptions = createTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // The user who purchased/manages the subscription
  ownerType: text("owner_type").notNull(), // 'user' or 'org'
  ownerId: text("owner_id").notNull(), // The account the subscription benefits
  stripe_subscription_id: text("stripe_subscription_id").unique(),
  status: subscriptionStatusEnum("status").notNull(),
  tier: text("tier").notNull(),
  current_period_start: timestamp("current_period_start").notNull(),
  current_period_end: timestamp("current_period_end").notNull(),
  cancel_at_period_end: integer("cancel_at_period_end").notNull().default(0),
  canceled_at: timestamp("canceled_at"),
  ended_at: timestamp("ended_at"),
  trial_start: timestamp("trial_start"),
  trial_end: timestamp("trial_end"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
  playgrounds: many(playgrounds),
}));

export const ownerTypeEnum = pgEnum("owner_type", ["user", "org"]);
export const backupStatusEnum = pgEnum("backup_status", ["pending", "success", "failed"]);

export const playgrounds = createTable("playgrounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  jsonBlob: jsonb("json_blob").notNull(),
  ownerId: text("owner_id").references(() => users.id).notNull(),
  ownerType: ownerTypeEnum("owner_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by").references(() => users.id).notNull(),
  updatedBy: text("updated_by").references(() => users.id).notNull(),
  editorIds: text("editor_ids").array(),
  viewerIds: text("viewer_ids").array(),
  currentVisitorIds: text("current_visitor_ids").array(),
  lastEvaluationAt: timestamp("last_evaluation_at"),
  evaluationScore: integer("evaluation_score"),
  evaluationFeedback: text("evaluation_feedback"),
  isPublic: integer("is_public").notNull().default(0),
  tags: text("tags"),
  description: text("description"),
  // GitHub backup fields
  lastBackupCommitSha: text("last_backup_commit_sha"),
  backupStatus: backupStatusEnum("backup_status"),
});

export type Playground = typeof playgrounds.$inferSelect;

export const playgroundsRelations = relations(playgrounds, ({ one, many }) => ({
  owner: one(users, {
    fields: [playgrounds.ownerId],
    references: [users.id],
    relationName: "userOwnedPlaygrounds",
  }),
  backupHistory: many(backupHistory),
}));

export const backupHistory = createTable("backup_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  playgroundId: uuid("playground_id").references(() => playgrounds.id).notNull(),
  commitSha: text("commit_sha").notNull(),
  commitUrl: text("commit_url").notNull(),
  commitMessage: text("commit_message").notNull(),
  status: backupStatusEnum("status").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by").references(() => users.id).notNull(),
});

export type BackupHistory = typeof backupHistory.$inferSelect;

export const backupHistoryRelations = relations(backupHistory, ({ one }) => ({
  playground: one(playgrounds, {
    fields: [backupHistory.playgroundId],
    references: [playgrounds.id],
  }),
  createdByUser: one(users, {
    fields: [backupHistory.createdBy],
    references: [users.id],
  }),
}));

export const tokenBalances = createTable("token_balances", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerType: text("owner_type").notNull(), // 'user' or 'org'
  ownerId: text("owner_id").notNull(),
  expiringTokens: integer("expiring_tokens").notNull().default(0),
  expiringTokensExpiry: timestamp("expiring_tokens_expiry"),
  nonexpiringTokens: integer("nonexpiring_tokens").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tokenLedger = createTable("token_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerType: text("owner_type").notNull(), // 'user' or 'org'
  ownerId: text("owner_id").notNull(),
  type: text("type").notNull(), // 'expiring' or 'nonexpiring'
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(), // 'subscription', 'topup', 'usage', 'reset', etc.
  expiry: timestamp("expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

