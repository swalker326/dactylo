import { sqliteTable, text, real, int } from "drizzle-orm/sqlite-core";

export const video = sqliteTable("video", {
	id: int("id").primaryKey({ autoIncrement: true }),
	videoId: text("videoId").notNull(),
	trendingScore: real("trendingScore").default(0).notNull(),
	signId: int("signId").notNull(),
	userId: int("userId").notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	voteCount: int("voteCount", { mode: "number" }).default(0).notNull(),
	url: text("url").notNull(),
	approvedOn: text("updatedAt"),
	videoStatusId: int("videoStatusId", { mode: "number" }).notNull(),
});
