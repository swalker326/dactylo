import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const category = sqliteTable("category", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	slug: text("slug").notNull(),
	name: text("name").notNull(),
	description: text("description").default("").notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
});
