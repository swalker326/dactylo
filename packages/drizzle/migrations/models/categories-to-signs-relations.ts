import { relations } from "drizzle-orm";
import { categoriesToSigns } from "./categories-to-signs";
import { categories } from "./categories";
import { signs } from "./signs";

export const categoriesToSignsRelations = relations(
	categoriesToSigns,
	(helpers) => ({
		category: helpers.one(categories, {
			fields: [categoriesToSigns.A],
			references: [categories.id],
		}),
		sign: helpers.one(signs, {
			fields: [categoriesToSigns.B],
			references: [signs.id],
		}),
	}),
);
