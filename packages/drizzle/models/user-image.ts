import { sqliteTable, text, blob, int } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const userImage = sqliteTable("userImage", {
	id: text("id").primaryKey().$defaultFn(nanoid),
	altText: text("altText"),
	contentType: text("contentType").notNull(),
	blob: blob("blob", { mode: "buffer" }).notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	userId: text("userId").notNull(),
});
