import { relations } from "drizzle-orm";
import { connection } from "./connection";
import { user } from "./user";

export const connectionRelations = relations(connection, (helpers) => ({
	user: helpers.one(user, {
		relationName: "connectionToUser",
		fields: [connection.userId],
		references: [user.id],
	}),
}));
