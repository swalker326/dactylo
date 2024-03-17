import { relations } from 'drizzle-orm';
import { permissionsToRoles } from './permissions-to-roles';
import { permissions } from './permissions';
import { roles } from './roles';

export const permissionsToRolesRelations = relations(permissionsToRoles, (helpers) => ({ permission: helpers.one(permissions, { fields: [ permissionsToRoles.A ], references: [ permissions.id ] }), role: helpers.one(roles, { fields: [ permissionsToRoles.B ], references: [ roles.id ] }) }));