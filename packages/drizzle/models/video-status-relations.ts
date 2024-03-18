import { relations } from "drizzle-orm";
import { videoStatus } from "./video-status";
import { video } from "./video";

export const videoStatusesRelations = relations(videoStatus, (helpers) => ({
	video: helpers.many(video, { relationName: "videoToVideoStatus" }),
}));
