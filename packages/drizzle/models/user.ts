import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const user = sqliteTable("user", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	email: text("email").notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
});
