import { relations } from "drizzle-orm";
import { permissionToRole } from "./permission-to-role";
import { permission } from "./permission";
import { role } from "./role";

export const permissionToRoleRelations = relations(
	permissionToRole,
	(helpers) => ({
		permission: helpers.one(permission, {
			fields: [permissionToRole.A],
			references: [permission.id],
		}),
		role: helpers.one(role, {
			fields: [permissionToRole.B],
			references: [role.id],
		}),
	}),
);
