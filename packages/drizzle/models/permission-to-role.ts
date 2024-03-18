import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const permissionToRole = sqliteTable("permissionToRole", {
	A: text("A").notNull(),
	B: text("B").notNull(),
});
