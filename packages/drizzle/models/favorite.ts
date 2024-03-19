import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const favorite = sqliteTable("favorite", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	userId: text("userId").notNull(),
	videoId: text("videoId").notNull(),
});
