import { relations } from "drizzle-orm";
import { searchSign } from "./search-sign";
import { search } from "./search";
import { sign } from "./sign";

export const searchSignsRelations = relations(searchSign, (helpers) => ({
	search: helpers.one(search, {
		relationName: "searchToSearchSign",
		fields: [searchSign.searchId],
		references: [search.id],
	}),
	sign: helpers.one(sign, {
		relationName: "signToSearchSigns",
		fields: [searchSign.signId],
		references: [sign.id],
	}),
}));
