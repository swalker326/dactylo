import { relations } from "drizzle-orm";
import { sign } from "./sign";
import { videos } from "./videos";
import { categoriesToSigns } from "./categories-to-signs";
import { signToSign } from "./sign-to-sign";
import { searchSigns } from "./search-signs";
import { term } from "./term";

export const signRelations = relations(sign, (helpers) => ({
  videos: helpers.many(videos, { relationName: "SignToVideo" }),
  categories: helpers.many(categoriesToSigns),
  relatedSigns: helpers.many(signToSign, { relationName: "RelatedSigns" }),
  relatedToSigns: helpers.many(signToSign, {
    relationName: "RelatedToSigns",
  }),
  // searchSigns: helpers.many(searchSigns, { relationName: "SignToSearchSigns" }),
  term: helpers.one(term, {
    relationName: "SignToTerm",
    fields: [sign.termId],
    references: [term.id],
  }),
}));
