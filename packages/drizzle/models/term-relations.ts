import { relations } from "drizzle-orm";
import { term } from "./term";
import { sign } from "./sign";

export const termRelations = relations(term, (helpers) => ({
	signs: helpers.many(sign, { relationName: "signToTerm" }),
}));
