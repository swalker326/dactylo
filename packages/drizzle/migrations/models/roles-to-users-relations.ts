import { relations } from "drizzle-orm";
import { rolesToUsers } from "./roles-to-users";
import { roles } from "./roles";
import { users } from "./users";

export const rolesToUsersRelations = relations(rolesToUsers, (helpers) => ({
	role: helpers.one(roles, {
		fields: [rolesToUsers.A],
		references: [roles.id],
	}),
	user: helpers.one(users, {
		fields: [rolesToUsers.B],
		references: [users.id],
	}),
}));
