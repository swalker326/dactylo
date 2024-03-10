import { relations } from "drizzle-orm";
import { signsToSigns } from "./signs-to-signs";
import { signs } from "./signs";

export const signsToSignsRelations = relations(signsToSigns, (helpers) => ({
	sign: helpers.one(signs, {
		fields: [signsToSigns.A],
		references: [signs.id],
	}),
	sign: helpers.one(signs, {
		fields: [signsToSigns.B],
		references: [signs.id],
	}),
}));
