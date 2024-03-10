import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const permissionToRoles = sqliteTable("_PermissionToRole", {
	A: text("A").notNull(),
	B: text("B").notNull(),
});
