import { relations } from "drizzle-orm";
import { search } from "./search";
import { user } from "./user";
import { searchSign } from "./search-sign";

export const searchesRelations = relations(search, (helpers) => ({
	user: helpers.one(user, {
		relationName: "searchToUser",
		fields: [search.userId],
		references: [user.id],
	}),
	results: helpers.many(searchSign, { relationName: "searchToSearchSign" }),
}));
