import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const requests = sqliteTable("Request", {
  id: text("id").primaryKey(),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  example: text("example").notNull(),
  userId: text("userId").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  requestStatusId: integer("requestStatusId", { mode: "number" }).notNull(),
  requestTypeId: integer("requestTypeId", { mode: "number" }).notNull(),
});
