import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const roleToUsers = sqliteTable("_RoleToUser", {
	A: text("A").notNull(),
	B: text("B").notNull(),
});
