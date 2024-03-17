import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const roles = sqliteTable("Role", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
