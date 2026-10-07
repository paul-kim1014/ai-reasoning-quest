import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  handle: text("handle").notNull(),
  character: text("character").notNull(),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(1),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("idx_profiles_user_id").on(table.userId)]);

export const completions = sqliteTable("completions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  questId: text("quest_id").notNull(),
  xpAwarded: integer("xp_awarded").notNull(),
  completedAt: text("completed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("idx_completions_user_quest").on(table.userId, table.questId)]);
