import { relations } from "drizzle-orm";
import { categories } from "./categories";
import { categoriesToSigns } from "./categories-to-signs";

export const categoriesRelations = relations(categories, (helpers) => ({
	signs: helpers.many(categoriesToSigns),
}));
