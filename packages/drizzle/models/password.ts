import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const password = sqliteTable("password", {
	hash: text("hash").notNull(),
	userId: int("userId").notNull(),
});
