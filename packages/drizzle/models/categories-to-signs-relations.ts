import { relations } from "drizzle-orm";
import { categoriesToSigns } from "./categories-to-signs";
import { categories } from "./categories";
import { sign } from "./sign";

export const categoriesToSignsRelations = relations(
  categoriesToSigns,
  (helpers) => ({
    category: helpers.one(categories, {
      fields: [categoriesToSigns.A],
      references: [categories.id],
    }),
    sign: helpers.one(sign, {
      fields: [categoriesToSigns.B],
      references: [sign.id],
    }),
  }),
);
