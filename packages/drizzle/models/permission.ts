import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const permission = sqliteTable("permission", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	action: text("action").notNull(),
	entity: text("entity").notNull(),
	access: text("access").notNull(),
	description: text("description").default("").notNull(),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	updatedAt: text("updatedAt"),
});
