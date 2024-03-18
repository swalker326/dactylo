import { relations } from "drizzle-orm";
import { session } from "./session";
import { user } from "./user";

export const sessionsRelations = relations(session, (helpers) => ({
	user: helpers.one(user, {
		relationName: "sessionToUser",
		fields: [session.userId],
		references: [user.id],
	}),
}));
