import { relations } from "drizzle-orm";
import { signsToSigns } from "./signs-to-signs";
import { signs } from "./signs";

export const signsToSignsRelations = relations(signsToSigns, (helpers) => ({
	relatedSign: helpers.one(signs, {
		fields: [signsToSigns.relatedSign],
		references: [signs.id],
		relationName: "RelatedSigns",
	}),
	relatedToSign: helpers.one(signs, {
		fields: [signsToSigns.relatedToSign],
		references: [signs.id],
		relationName: "RelatedToSigns",
	}),
}));
