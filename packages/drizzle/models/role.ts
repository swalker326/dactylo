import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const role = sqliteTable("role", {
	id: int("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	description: text("description").default("").notNull(),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	updatedAt: text("updatedAt"),
});
