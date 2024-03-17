import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const votes = sqliteTable("Vote", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  videoId: text("videoId").notNull(),
  voteDate: integer("voteDate", { mode: "timestamp" }).defaultNow().notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  voteTypeId: integer("voteTypeId", { mode: "number" }).notNull(),
});
