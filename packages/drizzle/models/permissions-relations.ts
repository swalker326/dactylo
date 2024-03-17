import { relations } from 'drizzle-orm';
import { permissions } from './permissions';
import { permissionsToRoles } from './permissions-to-roles';

export const permissionsRelations = relations(permissions, (helpers) => ({ roles: helpers.many(permissionsToRoles) }));