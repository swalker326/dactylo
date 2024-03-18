import { relations } from "drizzle-orm";
import { role } from "./role";
import { roleToUser } from "./role-to-user";
import { permissionToRole } from "./permission-to-role";

export const rolesRelations = relations(role, (helpers) => ({
	users: helpers.many(roleToUser),
	permissions: helpers.many(permissionToRole),
}));
