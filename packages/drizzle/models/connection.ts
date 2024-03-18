import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const connection = sqliteTable("connection", {
	id: int("id").primaryKey({ autoIncrement: true }),
	providerName: text("providerName").notNull(),
	providerId: text("providerId").notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	userId: text("userId").notNull(),
});
