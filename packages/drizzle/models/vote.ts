import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const vote = sqliteTable("vote", {
	id: int("id").primaryKey({ autoIncrement: true }),
	userId: int("userId").notNull(),
	videoId: int("videoId").notNull(),
	voteDate: text("voteDate")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	voteTypeId: int("voteTypeId").notNull(),
});
