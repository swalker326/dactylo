import { relations } from "drizzle-orm";
import { videoStatuses } from "./video-statuses";
import { videos } from "./videos";

export const videoStatusesRelations = relations(videoStatuses, (helpers) => ({
	videos: helpers.many(videos, { relationName: "VideoToVideoStatus" }),
}));
