import { relations } from "drizzle-orm";
import { report } from "./report";
import { video } from "./video";
import { user } from "./user";

export const reportRelations = relations(report, (helpers) => ({
	video: helpers.one(video, {
		relationName: "reportToVideo",
		fields: [report.videoId],
		references: [video.id],
	}),
	user: helpers.one(user, {
		relationName: "reportToUser",
		fields: [report.userId],
		references: [user.id],
	}),
}));
