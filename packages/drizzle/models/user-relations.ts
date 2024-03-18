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
import { search } from "./search";
import { request } from "./request";

export const usersRelations = relations(user, (helpers) => ({
	uploadedVideos: helpers.many(video, { relationName: "userToVideo" }),
	vote: helpers.many(vote, { relationName: "userToVote" }),
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
	session: helpers.many(session, { relationName: "sessionToUser" }),
	connection: helpers.many(connection, { relationName: "connectionToUser" }),
	favorite: helpers.many(favorite, { relationName: "favoriteToUser" }),
	report: helpers.many(report, { relationName: "reportToUser" }),
	search: helpers.many(search, { relationName: "searchToUser" }),
	request: helpers.many(request, { relationName: "requestToUser" }),
}));
