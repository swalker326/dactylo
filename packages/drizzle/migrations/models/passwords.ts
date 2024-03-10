import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const passwords = sqliteTable("Password", {
	hash: text("hash").notNull(),
	userId: text("userId").notNull(),
});
