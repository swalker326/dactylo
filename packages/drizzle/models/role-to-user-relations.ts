import { relations } from "drizzle-orm";
import { roleToUser } from "./role-to-user";
import { role } from "./role";
import { user } from "./user";

export const rolesToUsersRelations = relations(roleToUser, (helpers) => ({
	role: helpers.one(role, {
		fields: [roleToUser.A],
		references: [role.id],
	}),
	user: helpers.one(user, {
		fields: [roleToUser.B],
		references: [user.id],
	}),
}));
