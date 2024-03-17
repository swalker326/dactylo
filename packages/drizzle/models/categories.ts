import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const category = sqliteTable("category", {
	id: int("id").primaryKey({ autoIncrement: true }),
	slug: text("slug").notNull(),
	name: text("name").notNull(),
	description: text("description").default("").notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
});
