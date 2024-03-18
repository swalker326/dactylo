import { sqliteTable, int } from "drizzle-orm/sqlite-core";

export const favorite = sqliteTable("favorite", {
	id: int("id").primaryKey({ autoIncrement: true }),
	userId: int("userId").notNull(),
	videoId: int("videoId").notNull(),
});
