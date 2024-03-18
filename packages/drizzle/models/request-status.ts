import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const requestStatus = sqliteTable("requestStatus", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
});
