import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";

export const permissions = sqliteTable("Permission", {
  id: text("id").primaryKey().$defaultFn(createId),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  access: text("access").notNull(),
  description: text("description").default("").notNull(),
  createdAt: text("createdAt")
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
