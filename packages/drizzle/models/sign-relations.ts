import { relations } from "drizzle-orm";
import { sign } from "./sign";
import { video } from "./video";
import { categoryToSign } from "./category-to-sign";
import { signToSign } from "./sign-to-sign";
import { searchSign } from "./search-sign";
import { term } from "./term";

export const signRelations = relations(sign, (helpers) => ({
	video: helpers.many(video, { relationName: "signToVideo" }),
	categories: helpers.many(categoryToSign),
	relatedSigns: helpers.many(signToSign, { relationName: "relatedSigns" }),
	relatedToSigns: helpers.many(signToSign, {
		relationName: "relatedToSigns",
	}),
	// searchSigns: helpers.many(searchSigns, { relationName: "signToSearchSigns" }),
	term: helpers.one(term, {
		relationName: "signToTerm",
		fields: [sign.termId],
		references: [term.id],
	}),
}));
