import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const password = sqliteTable("password", {
	hash: text("hash").notNull(),
	userId: text("userId").notNull(),
});
