import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const signs = sqliteTable("Sign", {
	id: text("id").primaryKey(),
	example: text("example").notNull(),
	definition: text("definition").notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }),
	createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
	termId: text("termId").notNull(),
});
