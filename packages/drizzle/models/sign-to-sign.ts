import { sqliteTable, int } from "drizzle-orm/sqlite-core";

// junction table for many-to-many relationship between sign and sign (relatedSign)

export const signToSign = sqliteTable("relatedSign", {
	sign: int("sign").notNull(),
	relatedSign: int("relatedSign").notNull(),
});
