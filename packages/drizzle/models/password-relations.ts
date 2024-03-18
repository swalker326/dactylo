import { relations } from "drizzle-orm";
import { password } from "./password";
import { user } from "./user";

export const passwordRelations = relations(password, (helpers) => ({
	user: helpers.one(user, {
		relationName: "passwordToUser",
		fields: [password.userId],
		references: [user.id],
	}),
}));
