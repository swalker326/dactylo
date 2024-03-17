import { sampleWords } from "./sampleWords";
import { slugerize } from "./slugerize";
import { db, eq } from "./src/index";
import { categories as dbCategory } from "./models/categories";
import { terms } from "./models/terms";
import { signs } from "./models/signs";
import { permissions } from "./models/permissions";

async function seed() {
	// console.time("🔑 Created permissions...");
	// const entities = ["user", "sign", "video"];
	// const actions = ["create", "read", "update", "delete"];
	// const accesses = ["own", "any"] as const;
	// for (const entity of entities) {
	// 	for (const action of actions) {
	// 		for (const access of accesses) {
	// 			await db.insert(permissions).values({ entity, action, access });
	// 		}
	// 	}
	// }
	// console.timeEnd("🔑 Created permissions...");
	// console.time("👑 Created roles...");
	// await prisma.role.create({
	// 	data: {
	// 		name: "admin",
	// 		permissions: {
	// 			connect: await prisma.permission.findMany({
	// 				select: { id: true },
	// 				where: { access: "any" },
	// 			}),
	// 		},
	// 	},
	// });
	// await prisma.role.create({
	// 	data: {
	// 		name: "user",
	// 		permissions: {
	// 			connect: await prisma.permission.findMany({
	// 				select: { id: true },
	// 				where: { access: "own" },
	// 			}),
	// 		},
	// 	},
	// });
	// console.timeEnd("👑 Created roles...");
	// // // Create sample roles
	console.time("Adding sample words...");
	for (let category in sampleWords) {
		category = category as keyof typeof sampleWords;
		await db.insert(dbCategory).values({
			name: category,
			slug: slugerize(category),
		});
		await db.insert(terms).values(
			sampleWords[category as keyof typeof sampleWords].map(({ word }) => ({
				word,
				createdAt: new Date().toISOString(),
			})),
		);

		for (const { word, definition } of sampleWords[
			category as keyof typeof sampleWords
		]) {
			const term = await db.select().from(terms).where(eq(terms.word, word));

			if (!term) throw new Error(`Term ${word} not found`);
			await db.insert(signs).values({
				example: definition,
				termId: term[0].id,
				definition: definition,
				createdAt: new Date().toISOString(),
				// categorgyId: newCategory[0].id,
			});
		}

		// console.timeEnd("Adding sample words...");
	}
}

seed();
