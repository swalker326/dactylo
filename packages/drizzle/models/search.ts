import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const search = sqliteTable("search", {
	id: int("id").primaryKey(),
	term: text("term").notNull(),
	userId: text("userId"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
});
