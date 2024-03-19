import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const connection = sqliteTable("connection", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	providerName: text("providerName").notNull(),
	providerId: text("providerId").notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	userId: text("userId").notNull(),
});
