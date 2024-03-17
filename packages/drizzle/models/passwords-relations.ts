import { relations } from "drizzle-orm";
import { passwords } from "./passwords";
import { users } from "./users";

export const passwordsRelations = relations(passwords, (helpers) => ({
  user: helpers.one(users, {
    relationName: "PasswordToUser",
    fields: [passwords.userId],
    references: [users.id],
  }),
}));
