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
		relationName: "signToVideo",
		fields: [video.signId],
		references: [sign.id],
	}),
	votes: helpers.many(vote, { relationName: "votesToVideo" }),
	favorites: helpers.many(favorite, { relationName: "favoritesToVideo" }),
	reports: helpers.many(report, { relationName: "reportsToVideo" }),
}));
