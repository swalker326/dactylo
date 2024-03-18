import { relations } from "drizzle-orm";
import { userImage } from "./user-image";
import { user } from "./user";

export const userImageRelations = relations(userImage, (helpers) => ({
	user: helpers.one(user, {
		relationName: "userToUserImage",
		fields: [userImage.userId],
		references: [user.id],
	}),
}));
