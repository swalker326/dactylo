import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const term = sqliteTable("term", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	word: text("word").notNull().unique(),
	createdAt: text("createdAt")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt"),
});

export type SelectTerm = InferSelectModel<typeof term>;
export type InsertTerm = InferInsertModel<typeof term>;