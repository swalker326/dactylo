import { relations } from "drizzle-orm";
import { categoryToSign } from "./category-to-sign";
import { category as DBCategory } from "./category";
import { sign } from "./sign";

export const categoriesToSignsRelations = relations(
	categoryToSign,
	(helpers) => ({
		category: helpers.one(DBCategory, {
			fields: [categoryToSign.A],
			references: [DBCategory.id],
		}),
		sign: helpers.one(sign, {
			fields: [categoryToSign.B],
			references: [sign.id],
		}),
	}),
);
