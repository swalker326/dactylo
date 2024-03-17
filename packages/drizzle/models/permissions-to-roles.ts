import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const permissionsToRoles = sqliteTable('_PermissionToRole', { A: text('A').notNull(), B: text('B').notNull() });