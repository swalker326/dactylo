import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const signs = sqliteTable("Sign", {
	id: text("id").primaryKey().$defaultFn(createId),
	example: text("example").notNull(),
	definition: text("definition").notNull(),
	updatedAt: text("updatedAt").$defaultFn(() => new Date().toISOString()),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	termId: text("termId").notNull(),
});
