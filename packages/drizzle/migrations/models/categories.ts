import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("Category", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull(),
	name: text("name").notNull(),
	description: text("description").default("").notNull(),
});
