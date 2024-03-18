import { relations } from "drizzle-orm";
import { video } from "./video";
import { user } from "./user";
import { videoStatus } from "./video-status";
import { sign } from "./sign";
import { vote } from "./vote";
import { favorite } from "./favorite";
import { report } from "./report";

export const videosRelations = relations(video, (helpers) => ({
	user: helpers.one(user, {
		relationName: "userToVideo",
		fields: [video.userId],
		references: [user.id],
	}),
	status: helpers.one(videoStatus, {
		relationName: "videoToVideoStatus",
		fields: [video.videoStatusId],
		references: [videoStatus.id],
	}),
	sign: helpers.one(sign, {
		relationName: "signToVideo",
		fields: [video.signId],
		references: [sign.id],
	}),
	votes: helpers.many(vote, { relationName: "videoToVote" }),
	favorite: helpers.many(favorite, { relationName: "favoriteToVideo" }),
	report: helpers.many(report, { relationName: "reportToVideo" }),
}));
