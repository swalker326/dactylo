import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const signsToSigns = sqliteTable("_RelatedSigns", {
	relatedSign: text("relatedSign").notNull(),
	relatedToSign: text("relatedToSign").notNull(),
});
