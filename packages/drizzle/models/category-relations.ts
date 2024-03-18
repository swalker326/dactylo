import { relations } from "drizzle-orm";
import { category } from "./category";
import { categoryToSign } from "./category-to-sign";

export const categoryRelations = relations(category, (helpers) => ({
	signs: helpers.many(categoryToSign),
}));
