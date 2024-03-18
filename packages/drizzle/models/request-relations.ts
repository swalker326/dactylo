import { relations } from "drizzle-orm";
import { request } from "./request";
import { requestStatus } from "./request-status";
import { user } from "./user";
import { requestType } from "./request-type";

export const requestRelations = relations(request, (helpers) => ({
	status: helpers.one(requestStatus, {
		relationName: "requestToRequestStatus",
		fields: [request.requestStatusId],
		references: [requestStatus.id],
	}),
	user: helpers.one(user, {
		relationName: "requestToUser",
		fields: [request.userId],
		references: [user.id],
	}),
	requestType: helpers.one(requestType, {
		relationName: "requestToRequestType",
		fields: [request.requestTypeId],
		references: [requestType.id],
	}),
}));
