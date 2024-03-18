import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const requestType = sqliteTable("requestType", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
});
