import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// junction table for many-to-many relationship between sign and sign (relatedSign)

export const signToSign = sqliteTable("relatedSign", {
	signId: text("sign").notNull(),
	relatedSignId: text("relatedSign").notNull(),
});
