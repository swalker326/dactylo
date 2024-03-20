import { relations } from "drizzle-orm";
import { user } from "./user";
import { video } from "./video";
import { vote } from "./vote";
import { roleToUser } from "./role-to-user";
import { userImage } from "./user-image";
import { password } from "./password";
import { session } from "./session";
import { connection } from "./connection";
import { favorite } from "./favorite";
import { report } from "./report";
import { request } from "./request";

export const usersRelations = relations(user, (helpers) => ({
	uploadedVideos: helpers.many(video, { relationName: "userToVideo" }),
	votes: helpers.many(vote, { relationName: "userToVotes" }),
	roles: helpers.many(roleToUser),
	image: helpers.one(userImage, {
		relationName: "userToUserImage",
		fields: [user.id],
		references: [userImage.userId],
	}),
	password: helpers.one(password, {
		relationName: "passwordToUser",
		fields: [user.id],
		references: [password.userId],
	}),
	sessions: helpers.many(session, { relationName: "sessionToUser" }),
	connections: helpers.many(connection, { relationName: "connectionToUser" }),
	favorites: helpers.many(favorite, { relationName: "favoriteToUser" }),
	reports: helpers.many(report, { relationName: "reportsToUser" }),
	requests: helpers.many(request, { relationName: "requestsToUser" }),
}));
