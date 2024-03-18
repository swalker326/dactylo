import { relations } from "drizzle-orm";
import { favorite } from "./favorite";
import { user } from "./user";
import { video } from "./video";

export const favoriteRelations = relations(favorite, (helpers) => ({
	user: helpers.one(user, {
		relationName: "favoriteToUser",
		fields: [favorite.userId],
		references: [user.id],
	}),
	video: helpers.one(video, {
		relationName: "favoriteToVideo",
		fields: [favorite.videoId],
		references: [video.id],
	}),
}));
