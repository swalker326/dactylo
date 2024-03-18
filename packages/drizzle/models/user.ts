import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
	id: int("id").primaryKey({ autoIncrement: true }),
	email: text("email").notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
});
