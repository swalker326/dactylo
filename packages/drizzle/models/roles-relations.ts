import { relations } from 'drizzle-orm';
import { roles } from './roles';
import { rolesToUsers } from './roles-to-users';
import { permissionsToRoles } from './permissions-to-roles';

export const rolesRelations = relations(roles, (helpers) => ({ users: helpers.many(rolesToUsers), permissions: helpers.many(permissionsToRoles) }));