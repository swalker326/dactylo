import { relations } from "drizzle-orm";
import { requestStatuses } from "./request-statuses";
import { requests } from "./requests";

export const requestStatusesRelations = relations(
	requestStatuses,
	(helpers) => ({
		requests: helpers.many(requests, {
			relationName: "RequestToRequestStatus",
		}),
	}),
);
