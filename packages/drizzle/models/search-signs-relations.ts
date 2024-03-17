import { relations } from "drizzle-orm";
import { searchSigns } from "./search-signs";
import { searches } from "./searches";
import { sign } from "./sign";

export const searchSignsRelations = relations(searchSigns, (helpers) => ({
  search: helpers.one(searches, {
    relationName: "SearchToSearchSign",
    fields: [searchSigns.searchId],
    references: [searches.id],
  }),
  sign: helpers.one(sign, {
    relationName: "SignToSearchSigns",
    fields: [searchSigns.signId],
    references: [sign.id],
  }),
}));
