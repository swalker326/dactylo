import { sqliteTable, text, blob, integer } from "drizzle-orm/sqlite-core";

export const userImages = sqliteTable("UserImage", {
  id: text("id").primaryKey(),
  altText: text("altText"),
  contentType: text("contentType").notNull(),
  blob: blob("blob", { mode: "buffer" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  userId: text("userId").notNull(),
});
