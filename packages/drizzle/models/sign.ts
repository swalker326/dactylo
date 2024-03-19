import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const sign = sqliteTable("sign", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	example: text("example").notNull(),
	definition: text("definition").notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	termId: text("termId").notNull(),
});
