import { prisma } from "../src/index";
import { sampleWords } from "./sampleWords";
import { slugerize } from "../slugerize";

async function seed() {
	// console.time("🔑 Created permissions...");
	// const entities = ["user", "sign", "video"];
	// const actions = ["create", "read", "update", "delete"];
	// const accesses = ["own", "any"] as const;
	// for (const entity of entities) {
	// 	for (const action of actions) {
	// 		for (const access of accesses) {
	// 			await prisma.permission.create({ data: { entity, action, access } });
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
	// // Create sample roles
	console.time("Adding sample words...");
	for (let category in sampleWords) {
		category = category as keyof typeof sampleWords;
		const newCategory = await prisma.category.create({
			data: {
				name: category,
				slug: slugerize(category),
			},
		});
		await prisma.term.createMany({
			data: sampleWords[category as keyof typeof sampleWords].map(
				({ word }) => ({
					word,
				}),
			),
			skipDuplicates: true,
		});

		for (const { word, definition } of sampleWords[
			category as keyof typeof sampleWords
		]) {
			const term = await prisma.term.findFirst({ where: { word } });

			if (!term) throw new Error(`Term ${word} not found`);
			await prisma.sign.create({
				data: {
					example: definition,
					term: { connect: { id: term.id } },
					definition: definition,
					categories: { connect: { id: newCategory.id } },
				},
			});
		}
	}
	console.timeEnd("Adding sample words...");
}

seed()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
