import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
export * from "../models/schema";
import { schema } from "../models/schema";
export * from "drizzle-orm";

if (!process.env.TURSO_DB_URL) {
	throw new Error("TURSO_DB_URL is not set");
}
if (!process.env.TURSO_DB_AUTH_TOKEN) {
	throw new Error("TURSO_DB_AUTH_TOKEN is not set");
}
const client = createClient({
	url: process.env.TURSO_DB_URL,
	authToken: process.env.TURSO_DB_AUTH_TOKEN,
});
export const db = drizzle(client, { schema });
