import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const videoStatus = sqliteTable("videoStatus", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
});
