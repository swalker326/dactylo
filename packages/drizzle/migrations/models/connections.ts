import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const connections = sqliteTable("Connection", {
	id: text("id").primaryKey(),
	providerName: text("providerName").notNull(),
	providerId: text("providerId").notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	userId: text("userId").notNull(),
});
