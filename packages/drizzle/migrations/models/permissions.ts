import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const permissions = sqliteTable("Permission", {
	id: text("id").primaryKey(),
	action: text("action").notNull(),
	entity: text("entity").notNull(),
	access: text("access").notNull(),
	description: text("description").default("").notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
