import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const report = sqliteTable("report", {
	id: int("id").primaryKey({ autoIncrement: true }),
	videoId: int("videoId").notNull(),
	userId: int("userId").notNull(),
	reason: text("reason").notNull(),
	createdAt: int("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});
