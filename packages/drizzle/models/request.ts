import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const request = sqliteTable("request", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	term: text("term").notNull(),
	definition: text("definition").notNull(),
	example: text("example").notNull(),
	userId: text("userId").notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	requestStatus: text("requestStatus", {
		enum: ["APPROVED", "REJECTED", "PENDING"],
	}).notNull(),
	requestType: text("requestType", { enum: ["SIGN", "TERM"] }).notNull(),
});
