import { relations } from "drizzle-orm";
import { requestType } from "./request-type";
import { request } from "./request";

export const requestTypeRelations = relations(requestType, (helpers) => ({
	requestIds: helpers.many(request, { relationName: "requestToRequestType" }),
}));
