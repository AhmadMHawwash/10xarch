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
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  credits: integer("credits").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
  playgrounds: many(playgrounds),
}));

export const playgrounds = createTable("playgrounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ownerId: text("owner_id").references(() => users.id),
});

export type Playground = typeof playgrounds.$inferSelect;

export const playgroundsRelations = relations(playgrounds, ({ one }) => ({
  owner: one(users, {
    fields: [playgrounds.ownerId],
    references: [users.id],
  }),
}));

export const credits = createTable("credits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id).notNull(),
  balance: integer("balance").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creditTransactions = createTable("credit_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  type: text("type", { enum: ["purchase", "usage"] }).notNull(),
  description: text("description"),
  status: text("status", { enum: ["pending", "completed", "failed"] }).notNull(),
  paymentId: text("payment_id"),
  stripeSessionId: text("stripe_session_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Credits = typeof credits.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;

export const creditsRelations = relations(credits, ({ one }) => ({
  user: one(users, {
    fields: [credits.userId],
    references: [users.id],
  }),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, {
    fields: [creditTransactions.userId],
    references: [users.id],
  }),
}));
