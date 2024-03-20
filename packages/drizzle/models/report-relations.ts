import { relations } from "drizzle-orm";
import { report } from "./report";
import { video } from "./video";
import { user } from "./user";

export const reportRelations = relations(report, (helpers) => ({
	video: helpers.one(video, {
		relationName: "videoToReports",
		fields: [report.videoId],
		references: [video.id],
	}),
	user: helpers.one(user, {
		relationName: "reportsToUser",
		fields: [report.userId],
		references: [user.id],
	}),
}));
