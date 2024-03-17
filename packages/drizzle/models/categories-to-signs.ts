import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categoriesToSigns = sqliteTable('_SignCategories', { A: text('A').notNull(), B: text('B').notNull() });