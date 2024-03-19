import { sampleWords } from "./sampleWords";
import { slugerize } from "./slugerize";
import { db, eq, inArray } from "./src/index";
import { schema } from "./models/schema";
import { term as DBTerm, InsertTerm, SelectTerm } from "./models/term";
import { sign } from "./models/sign";
import { permission } from "./models/permission";

async function seed() {
	// const arr = [1, 2];
	// const invalidArray = arr.map((_, index) => ({ word: `test223423_${index}` }));
	// await db.insert(schema.term).values(invalidArray);
	// rtbCln7foG5nAd3A4KG25;
	await db.insert(schema.sign).values({
		example: "test",
		termId: "rtbCln7foG5nAd3A4KG25",
		definition: "test",
	});

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
	// console.time("Adding sample words...");
	// for (let category in sampleWords) {
	// 	category = category as keyof typeof sampleWords;
	// 	const words = sampleWords[category as keyof typeof sampleWords];
	// 	const wordList = words.map(({ word }) => word);
	// 	await db.insert(DBCategory).values({
	// 		name: category,
	// 		slug: slugerize(category),
	// 	});
	// 	const wordMatches = await db
	// 		.select()
	// 		.from(DBTerm)
	// 		.where(inArray(DBTerm.word, wordList));

	// 	const newTerms = wordList
	// 		.filter((w) => !wordMatches.some((m) => m.word === w))
	// 		.map((word) => ({
	// 			categoryId: 10, //invalid attribute
	// 			word,
	// 			slug: slugerize(word),
	// 		}))
	//     newTerms;
	//     //^?

	// 	await db.insert(DBTerm).values(newTerms);

	// 	for (const { word, definition } of words) {
	// 		const term = await db.select().from(DBTerm).where(eq(DBTerm.word, word));

	// 		if (!term) throw new Error(`Term ${word} not found`);
	// 		await db.insert(sign).values({
	// 			example: definition,
	// 			termId: term[0].id,
	// 			definition: definition,
	// 			createdAt: new Date().toISOString(),
	// 		});
	// 	}

	// 	// console.timeEnd("Adding sample words...");
	// }
}

seed();
