import { relations } from 'drizzle-orm';
import { videoStatuses } from './video-statuses';
import { videos } from './videos';

export const videoStatusesRelations = relations(videoStatuses, (helpers) => ({ Video: helpers.many(videos, { relationName: 'VideoToVideoStatus' }) }));