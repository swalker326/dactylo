import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const searchSign = sqliteTable("searchSign", {
	searchId: text("searchId").notNull(),
	signId: text("signId").notNull(),
});
