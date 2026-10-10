import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  handle: text("handle").notNull(),
  character: text("character").notNull(),
  avatar: text("avatar").notNull().default("female-strategist"),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(1),
  rating: integer("rating").notNull().default(1000),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("idx_profiles_user_id").on(table.userId)]);

export const completions = sqliteTable("completions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  questId: text("quest_id").notNull(),
  xpAwarded: integer("xp_awarded").notNull(),
  completedAt: text("completed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("idx_completions_user_quest").on(table.userId, table.questId)]);

export const battles = sqliteTable("battles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  opponentHandle: text("opponent_handle").notNull(),
  result: text("result").notNull(),
  ratingDelta: integer("rating_delta").notNull(),
  tactic: text("tactic").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
