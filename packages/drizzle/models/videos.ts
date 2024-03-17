import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

export const videos = sqliteTable("Video", {
  id: text("id").primaryKey(),
  videoId: text("videoId").notNull(),
  trendingScore: real("trendingScore").default(0).notNull(),
  signId: text("signId").notNull(),
  userId: text("userId").notNull(),
  uploadDate: integer("uploadDate", { mode: "timestamp" })
    .defaultNow()
    .notNull(),
  voteCount: integer("voteCount", { mode: "number" }).default(0).notNull(),
  url: text("url").notNull(),
  approvedOn: integer("approvedOn", { mode: "timestamp" }),
  videoStatusId: integer("videoStatusId", { mode: "number" }).notNull(),
});
