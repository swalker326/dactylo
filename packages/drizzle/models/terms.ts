import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const terms = sqliteTable("Term", {
	id: text("id").primaryKey().$defaultFn(createId),
	word: text("word").notNull(),
	createdAt: text("createdAt").notNull(),
	updatedAt: text("updatedAt"),
});
