import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const searchSigns = sqliteTable('SearchSign', { searchId: text('searchId').notNull(), signId: text('signId').notNull() });