import { relations } from 'drizzle-orm';
import { videos } from './videos';
import { users } from './users';
import { videoStatuses } from './video-statuses';
import { sign } from "./sign";
import { votes } from './votes';
import { favorites } from './favorites';
import { reports } from './reports';

export const videosRelations = relations(videos, (helpers) => ({
	user: helpers.one(users, {
		relationName: "UserToVideo",
		fields: [videos.userId],
		references: [users.id],
	}),
	status: helpers.one(videoStatuses, {
		relationName: "VideoToVideoStatus",
		fields: [videos.videoStatusId],
		references: [videoStatuses.id],
	}),
	sign: helpers.one(sign, {
		relationName: "SignToVideo",
		fields: [videos.signId],
		references: [sign.id],
	}),
	votes: helpers.many(votes, { relationName: "VideoToVote" }),
	favorites: helpers.many(favorites, { relationName: "FavoriteToVideo" }),
	reports: helpers.many(reports, { relationName: "ReportToVideo" }),
}));