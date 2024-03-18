import { relations } from "drizzle-orm";
import { permission } from "./permission";
import { permissionToRole } from "./permission-to-role";

export const permissionRelations = relations(permission, (helpers) => ({
	roles: helpers.many(permissionToRole),
}));
