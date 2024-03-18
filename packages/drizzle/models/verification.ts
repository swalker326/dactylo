import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const verifications = sqliteTable("verification", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	type: text("type").notNull(),
	target: text("target").notNull(),
	secret: text("secret").notNull(),
	algorithm: text("algorithm").notNull(),
	digits: integer("digits", { mode: "number" }).notNull(),
	period: integer("period", { mode: "number" }).notNull(),
	charSet: text("charSet").notNull(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }),
	createdAt: text("createdAt")
		.$defaultFn(() => new Date().toISOString())
		.notNull(),
});
