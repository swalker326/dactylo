import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const voteTypes = sqliteTable("VoteType", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});
