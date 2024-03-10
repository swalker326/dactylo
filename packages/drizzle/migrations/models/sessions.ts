import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("Session", {
	id: text("id").primaryKey(),
	expirationDate: integer("expirationDate", { mode: "timestamp" }).notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	userId: text("userId").notNull(),
});
