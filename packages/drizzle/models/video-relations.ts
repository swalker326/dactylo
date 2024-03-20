import { relations } from "drizzle-orm";
import { video } from "./video";
import { user } from "./user";
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
	sign: helpers.one(sign, {
		relationName: "videosToSign",
		fields: [video.signId],
		references: [sign.id],
	}),
	votes: helpers.many(vote, { relationName: "videoToVotes" }),
	favorites: helpers.many(favorite, { relationName: "videoToFavorites" }),
	reports: helpers.many(report, { relationName: "videoToReports" }),
}));
