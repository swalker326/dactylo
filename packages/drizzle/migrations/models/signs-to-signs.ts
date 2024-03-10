import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const signsToSigns = sqliteTable("_RelatedSigns", {
	A: text("A").notNull(),
	B: text("B").notNull(),
});
