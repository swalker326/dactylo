import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const report = sqliteTable("report", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	videoId: text("videoId").notNull(),
	userId: text("userId").notNull(),
	reason: text("reason").notNull(),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	updatedAt: text("updatedAt"),
});
