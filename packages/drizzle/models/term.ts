import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const term = sqliteTable("term", {
  id: int("id").primaryKey({ autoIncrement: true }),
  word: text("word").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt"),
});
