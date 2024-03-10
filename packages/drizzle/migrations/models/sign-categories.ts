import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const signCategories = sqliteTable("_SignCategories", {
	A: text("A").notNull(),
	B: text("B").notNull(),
});
