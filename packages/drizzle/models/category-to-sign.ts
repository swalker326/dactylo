import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categoryToSign = sqliteTable("signCategories", {
	A: text("A").notNull(),
	B: text("B").notNull(),
});
