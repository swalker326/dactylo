import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const role = sqliteTable("role", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	name: text("name").notNull(),
	description: text("description").default("").notNull(),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	updatedAt: text("updatedAt"),
});
