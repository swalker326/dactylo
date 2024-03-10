import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const rolesToUsers = sqliteTable("_RoleToUser", {
	A: text("A").notNull(),
	B: text("B").notNull(),
});
