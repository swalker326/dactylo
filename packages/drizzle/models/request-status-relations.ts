import { relations } from "drizzle-orm";
import { requestStatus } from "./request-status";
import { request } from "./request";

export const requestStatusRelations = relations(requestStatus, (helpers) => ({
	requestIds: helpers.many(request, { relationName: "requestToRequestStatus" }),
}));
