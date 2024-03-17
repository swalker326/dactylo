import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const sign = sqliteTable("sign", {
  id: int("id").primaryKey({ autoIncrement: true }),
  example: text("example").notNull(),
  definition: text("definition").notNull(),
  updatedAt: text("updatedAt"),
  createdAt: text("createdAt")
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  termId: int("termId").notNull(),
});
