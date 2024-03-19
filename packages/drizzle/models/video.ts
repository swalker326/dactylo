import { sqliteTable, text, real, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const video = sqliteTable("video", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	videoId: text("videoId").notNull(),
	trendingScore: real("trendingScore").default(0).notNull(),
	signId: text("signId").notNull(),
	userId: text("userId").notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	voteCount: int("voteCount", { mode: "number" }).default(0).notNull(),
	url: text("url").notNull(),
	approvedOn: text("updatedAt"),
	videoStatus: text("videoStatus", {
		enum: ["APPROVED", "REJECTED", "PENDING"],
	}).notNull(),
});
