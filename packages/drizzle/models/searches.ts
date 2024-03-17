import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const searches = sqliteTable("Search", {
  id: text("id").primaryKey(),
  term: text("term").notNull(),
  userId: text("userId"),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});
