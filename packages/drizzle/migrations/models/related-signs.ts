import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const relatedSigns = sqliteTable("_RelatedSigns", {
	A: text("A").notNull(),
	B: text("B").notNull(),
});
