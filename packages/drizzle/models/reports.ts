import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const reports = sqliteTable('Report', { id: text('id').primaryKey(), videoId: text('videoId').notNull(), userId: text('userId').notNull(), reason: text('reason').notNull(), createdAt: integer('createdAt', { mode: 'timestamp' }).defaultNow().notNull() });