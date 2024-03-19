import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const session = sqliteTable("session", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	expirationDate: int("expirationDate", { mode: "timestamp" }).notNull(),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	updatedAt: text("updatedAt"),
	userId: text("userId").notNull(),
});
