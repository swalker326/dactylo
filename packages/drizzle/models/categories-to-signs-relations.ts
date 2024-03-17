import { relations } from "drizzle-orm";
import { categoriesToSigns } from "./categories-to-signs";
import { category as DBCategory } from "./categories";
import { sign } from "./sign";

export const categoriesToSignsRelations = relations(
	categoriesToSigns,
	(helpers) => ({
		category: helpers.one(DBCategory, {
			fields: [categoriesToSigns.A],
			references: [DBCategory.id],
		}),
		sign: helpers.one(sign, {
			fields: [categoriesToSigns.B],
			references: [sign.id],
		}),
	}),
);
