import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const session = sqliteTable("session", {
	id: int("id").primaryKey({ autoIncrement: true }),
	expirationDate: int("expirationDate", { mode: "timestamp" }).notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	userId: int("userId").notNull(),
});
