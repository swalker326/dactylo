import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const requestTypes = sqliteTable("RequestType", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});
