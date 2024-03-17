import { relations } from "drizzle-orm";
import { requests } from "./requests";
import { requestStatuses } from "./request-statuses";
import { users } from "./users";
import { requestTypes } from "./request-types";

export const requestsRelations = relations(requests, (helpers) => ({
  status: helpers.one(requestStatuses, {
    relationName: "RequestToRequestStatus",
    fields: [requests.requestStatusId],
    references: [requestStatuses.id],
  }),
  user: helpers.one(users, {
    relationName: "RequestToUser",
    fields: [requests.userId],
    references: [users.id],
  }),
  requestType: helpers.one(requestTypes, {
    relationName: "RequestToRequestType",
    fields: [requests.requestTypeId],
    references: [requestTypes.id],
  }),
}));
