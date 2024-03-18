import { relations } from "drizzle-orm";
import { voteTypes } from "./vote-type";
import { vote } from "./vote";

export const voteTypesRelations = relations(voteTypes, (helpers) => ({
	vote: helpers.many(vote, { relationName: "voteToVoteType" }),
}));
