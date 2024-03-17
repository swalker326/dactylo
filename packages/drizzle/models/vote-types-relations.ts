import { relations } from 'drizzle-orm';
import { voteTypes } from './vote-types';
import { votes } from './votes';

export const voteTypesRelations = relations(voteTypes, (helpers) => ({ Vote: helpers.many(votes, { relationName: 'VoteToVoteType' }) }));