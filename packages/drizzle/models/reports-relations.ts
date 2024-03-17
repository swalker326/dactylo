import { relations } from "drizzle-orm";
import { reports } from "./reports";
import { videos } from "./videos";
import { users } from "./users";

export const reportsRelations = relations(reports, (helpers) => ({
  video: helpers.one(videos, {
    relationName: "ReportToVideo",
    fields: [reports.videoId],
    references: [videos.id],
  }),
  user: helpers.one(users, {
    relationName: "ReportToUser",
    fields: [reports.userId],
    references: [users.id],
  }),
}));
