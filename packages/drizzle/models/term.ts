import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const term = sqliteTable("term", {
	id: int("id").primaryKey({ autoIncrement: true }),
	word: text("word").notNull().unique(),
	createdAt: text("createdAt")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt"),
});

export type SelectTerm = InferSelectModel<typeof term>;
export type InsertTerm = InferInsertModel<typeof term>;