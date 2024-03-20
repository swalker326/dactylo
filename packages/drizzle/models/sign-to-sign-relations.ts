import { relations } from "drizzle-orm";
import { signToSign } from "./sign-to-sign";
import { sign } from "./sign";

export const signsToSignsRelations = relations(signToSign, (helpers) => ({
	sign: helpers.one(sign, {
		fields: [signToSign.signId],
		references: [sign.id],
		relationName: "relatedSigns",
	}),
	relatedSign: helpers.one(sign, {
		fields: [signToSign.relatedSignId],
		references: [sign.id],
		relationName: "relatedToSigns",
	}),
}));