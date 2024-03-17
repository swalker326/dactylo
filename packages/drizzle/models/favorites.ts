import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const favorites = sqliteTable('Favorite', { id: text('id').primaryKey(), userId: text('userId').notNull(), videoId: text('videoId').notNull() });