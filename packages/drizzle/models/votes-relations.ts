import { relations } from "drizzle-orm";
import { votes } from "./votes";
import { voteTypes } from "./vote-types";
import { users } from "./users";
import { videos } from "./videos";

export const votesRelations = relations(votes, (helpers) => ({
  voteType: helpers.one(voteTypes, {
    relationName: "VoteToVoteType",
    fields: [votes.voteTypeId],
    references: [voteTypes.id],
  }),
  user: helpers.one(users, {
    relationName: "UserToVote",
    fields: [votes.userId],
    references: [users.id],
  }),
  video: helpers.one(videos, {
    relationName: "VideoToVote",
    fields: [votes.videoId],
    references: [videos.id],
  }),
}));
