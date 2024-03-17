import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const categories = sqliteTable("Category", {
  id: text("id").primaryKey().$defaultFn(createId),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  createdAt: text("createdAt").default("CURRENT_TIMESTAMP").notNull(),
});
