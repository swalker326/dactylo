import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const vote = sqliteTable("vote", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	userId: text("userId").notNull(),
	videoId: text("videoId").notNull(),
	voteDate: text("voteDate")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	voteType: text("voteTypeId", {
		enum: ["UPVOTE", "DOWNVOTE", "NO_VOTE"],
	}).notNull(),
});

export type SelectVote = typeof vote.$inferSelect;
export type InsertVote = typeof vote.$inferInsert;
