import { relations } from "drizzle-orm";
import { vote } from "./vote";
import { voteTypes } from "./vote-type";
import { user } from "./user";
import { video } from "./video";

export const votesRelations = relations(vote, (helpers) => ({
	voteType: helpers.one(voteTypes, {
		relationName: "voteToVoteType",
		fields: [vote.voteTypeId],
		references: [voteTypes.id],
	}),
	user: helpers.one(user, {
		relationName: "userToVote",
		fields: [vote.userId],
		references: [user.id],
	}),
	video: helpers.one(video, {
		relationName: "videoToVote",
		fields: [vote.videoId],
		references: [video.id],
	}),
}));
