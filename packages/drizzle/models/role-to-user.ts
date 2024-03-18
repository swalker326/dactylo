import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const roleToUser = sqliteTable("roleToUser", {
	A: text("A").notNull(),
	B: text("B").notNull(),
});
