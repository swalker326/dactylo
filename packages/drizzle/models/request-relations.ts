import { relations } from "drizzle-orm";
import { request } from "./request";
import { user } from "./user";

export const requestRelations = relations(request, (helpers) => ({
	user: helpers.one(user, {
		relationName: "requestsToUser",
		fields: [request.userId],
		references: [user.id],
	}),
}));
