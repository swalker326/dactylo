import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const voteTypes = sqliteTable("voteType", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
});
