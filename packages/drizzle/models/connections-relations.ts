import { relations } from "drizzle-orm";
import { connections } from "./connections";
import { users } from "./users";

export const connectionsRelations = relations(connections, (helpers) => ({
  user: helpers.one(users, {
    relationName: "ConnectionToUser",
    fields: [connections.userId],
    references: [users.id],
  }),
}));
