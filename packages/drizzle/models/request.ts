import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const request = sqliteTable("request", {
	id: int("id").primaryKey({ autoIncrement: true }),
	term: text("term").notNull(),
	definition: text("definition").notNull(),
	example: text("example").notNull(),
	userId: int("userId").notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	requestStatusId: int("requestStatusId").notNull(),
	requestTypeId: int("requestTypeId").notNull(),
});
