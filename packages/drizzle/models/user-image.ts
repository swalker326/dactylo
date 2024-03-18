import { sqliteTable, text, blob, int } from "drizzle-orm/sqlite-core";

export const userImage = sqliteTable("userImage", {
	id: int("id").primaryKey(),
	altText: text("altText"),
	contentType: text("contentType").notNull(),
	blob: blob("blob", { mode: "buffer" }).notNull(),
	updatedAt: text("updatedAt"),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
	userId: int("userId").notNull(),
});
