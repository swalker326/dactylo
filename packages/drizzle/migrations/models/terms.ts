import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const terms = sqliteTable("Term", {
	id: text("id").primaryKey(),
	word: text("word").notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }),
});
