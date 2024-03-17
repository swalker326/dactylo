import { relations } from "drizzle-orm";
import { signs } from "./signs";
import { videos } from "./videos";
import { categoriesToSigns } from "./categories-to-signs";
import { signsToSigns } from "./signs-to-signs";
import { searchSigns } from "./search-signs";
import { terms } from "./terms";

export const signsRelations = relations(signs, (helpers) => ({
	videos: helpers.many(videos, { relationName: "SignToVideo" }),
	categories: helpers.many(categoriesToSigns),
	relatedSigns: helpers.many(signsToSigns, { relationName: "RelatedSigns" }),
	relatedToSigns: helpers.many(signsToSigns, {
		relationName: "RelatedToSigns",
	}),
	// searchSigns: helpers.many(searchSigns, { relationName: "SignToSearchSigns" }),
	term: helpers.one(terms, {
		relationName: "SignToTerm",
		fields: [signs.termId],
		references: [terms.id],
	}),
}));
