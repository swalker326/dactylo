import { relations } from "drizzle-orm";
import { category as DBCategory } from "./categories";
import { categoriesToSigns } from "./categories-to-signs";

export const categoriesRelations = relations(DBCategory, (helpers) => ({
	signs: helpers.many(categoriesToSigns),
}));
